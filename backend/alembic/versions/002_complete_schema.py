"""Complete schema migration

Revision ID: 002
Revises: 001
Create Date: 2024-01-15 12:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '002'
down_revision: Union[str, None] = '001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create remaining tables"""
    
    # Products
    op.create_table(
        'products',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('org_id', sa.String(36), sa.ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('slug', sa.String(100), nullable=False),
        sa.Column('description', sa.Text),
        sa.Column('logo_url', sa.Text),
        sa.Column('website_url', sa.Text),
        sa.Column('category', sa.String(100)),
        sa.Column('price', sa.Numeric(10, 2)),
        sa.Column('currency', sa.String(3), default='INR'),
        sa.Column('features', sa.JSON, default=[]),
        sa.Column('target_audience', sa.JSON, default={}),
        sa.Column('brand_voice', sa.Text),
        sa.Column('keywords', sa.JSON, default=[]),
        sa.Column('is_active', sa.Boolean, default=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now())
    )
    op.create_index('idx_products_org_id', 'products', ['org_id'])
    op.create_index('idx_products_slug', 'products', ['org_id', 'slug'], unique=True)
    
    # Content
    op.create_table(
        'content',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('org_id', sa.String(36), sa.ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False),
        sa.Column('product_id', sa.String(36), sa.ForeignKey('products.id', ondelete='SET NULL')),
        sa.Column('created_by', sa.String(36), sa.ForeignKey('users.id', ondelete='SET NULL')),
        sa.Column('title', sa.String(500), nullable=False),
        sa.Column('content_type', sa.String(50), nullable=False),
        sa.Column('body', sa.Text, nullable=False),
        sa.Column('meta_description', sa.String(300)),
        sa.Column('keywords', sa.JSON, default=[]),
        sa.Column('tone', sa.String(50)),
        sa.Column('target_audience', sa.String(100)),
        sa.Column('status', sa.String(20), default='draft'),
        sa.Column('ai_generated', sa.Boolean, default=False),
        sa.Column('ai_model_used', sa.String(50)),
        sa.Column('ai_prompt_used', sa.Text),
        sa.Column('quality_score', sa.Integer),
        sa.Column('revision_count', sa.Integer, default=0),
        sa.Column('published_at', sa.DateTime(timezone=True)),
        sa.Column('scheduled_at', sa.DateTime(timezone=True)),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now())
    )
    op.create_index('idx_content_org_id', 'content', ['org_id'])
    op.create_index('idx_content_status', 'content', ['org_id', 'status'])
    
    # Content Approvals
    op.create_table(
        'content_approvals',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('content_id', sa.String(36), sa.ForeignKey('content.id', ondelete='CASCADE'), nullable=False),
        sa.Column('reviewer_id', sa.String(36), sa.ForeignKey('users.id', ondelete='SET NULL')),
        sa.Column('status', sa.String(20), nullable=False),
        sa.Column('feedback', sa.Text),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now())
    )
    
    # Social Accounts
    op.create_table(
        'social_accounts',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('org_id', sa.String(36), sa.ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False),
        sa.Column('platform', sa.String(50), nullable=False),
        sa.Column('account_id', sa.String(255), nullable=False),
        sa.Column('account_name', sa.String(255)),
        sa.Column('access_token', sa.Text),
        sa.Column('refresh_token', sa.Text),
        sa.Column('token_expires_at', sa.DateTime(timezone=True)),
        sa.Column('profile_url', sa.Text),
        sa.Column('avatar_url', sa.Text),
        sa.Column('follower_count', sa.Integer, default=0),
        sa.Column('is_active', sa.Boolean, default=True),
        sa.Column('last_synced_at', sa.DateTime(timezone=True)),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now())
    )
    op.create_index('idx_social_accounts_org_id', 'social_accounts', ['org_id'])
    
    # Social Posts
    op.create_table(
        'social_posts',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('org_id', sa.String(36), sa.ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False),
        sa.Column('account_id', sa.String(36), sa.ForeignKey('social_accounts.id', ondelete='CASCADE'), nullable=False),
        sa.Column('content_id', sa.String(36), sa.ForeignKey('content.id', ondelete='SET NULL')),
        sa.Column('platform', sa.String(50), nullable=False),
        sa.Column('post_text', sa.Text, nullable=False),
        sa.Column('media_urls', sa.JSON, default=[]),
        sa.Column('hashtags', sa.JSON, default=[]),
        sa.Column('external_post_id', sa.String(255)),
        sa.Column('post_url', sa.Text),
        sa.Column('status', sa.String(20), default='draft'),
        sa.Column('scheduled_at', sa.DateTime(timezone=True)),
        sa.Column('published_at', sa.DateTime(timezone=True)),
        sa.Column('likes', sa.Integer, default=0),
        sa.Column('comments', sa.Integer, default=0),
        sa.Column('shares', sa.Integer, default=0),
        sa.Column('impressions', sa.Integer, default=0),
        sa.Column('reach', sa.Integer, default=0),
        sa.Column('engagement_rate', sa.String(10)),
        sa.Column('error_message', sa.Text),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now())
    )
    op.create_index('idx_social_posts_org_id', 'social_posts', ['org_id'])
    op.create_index('idx_social_posts_status', 'social_posts', ['org_id', 'status'])
    
    # Email Templates
    op.create_table(
        'email_templates',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('org_id', sa.String(36), sa.ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('subject', sa.String(500), nullable=False),
        sa.Column('html_body', sa.Text, nullable=False),
        sa.Column('plain_body', sa.Text),
        sa.Column('template_type', sa.String(50)),
        sa.Column('variables', sa.JSON, default=[]),
        sa.Column('is_active', sa.Boolean, default=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now())
    )
    
    # Email Campaigns
    op.create_table(
        'email_campaigns',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('org_id', sa.String(36), sa.ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False),
        sa.Column('template_id', sa.String(36), sa.ForeignKey('email_templates.id', ondelete='SET NULL')),
        sa.Column('product_id', sa.String(36), sa.ForeignKey('products.id', ondelete='SET NULL')),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('subject', sa.String(500), nullable=False),
        sa.Column('from_name', sa.String(100)),
        sa.Column('from_email', sa.String(255)),
        sa.Column('reply_to', sa.String(255)),
        sa.Column('html_body', sa.Text, nullable=False),
        sa.Column('plain_body', sa.Text),
        sa.Column('status', sa.String(20), default='draft'),
        sa.Column('audience_filter', sa.JSON, default={}),
        sa.Column('scheduled_at', sa.DateTime(timezone=True)),
        sa.Column('sent_at', sa.DateTime(timezone=True)),
        sa.Column('total_recipients', sa.Integer, default=0),
        sa.Column('sent_count', sa.Integer, default=0),
        sa.Column('delivered_count', sa.Integer, default=0),
        sa.Column('open_count', sa.Integer, default=0),
        sa.Column('click_count', sa.Integer, default=0),
        sa.Column('bounce_count', sa.Integer, default=0),
        sa.Column('unsubscribe_count', sa.Integer, default=0),
        sa.Column('spam_count', sa.Integer, default=0),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now())
    )
    op.create_index('idx_email_campaigns_org_id', 'email_campaigns', ['org_id'])
    
    # Email Automations
    op.create_table(
        'email_automations',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('org_id', sa.String(36), sa.ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('description', sa.Text),
        sa.Column('trigger_type', sa.String(50), nullable=False),
        sa.Column('trigger_conditions', sa.JSON, default={}),
        sa.Column('email_sequence', sa.JSON, default=[]),
        sa.Column('is_active', sa.Boolean, default=True),
        sa.Column('total_enrolled', sa.Integer, default=0),
        sa.Column('total_completed', sa.Integer, default=0),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now())
    )
    
    # Leads
    op.create_table(
        'leads',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('org_id', sa.String(36), sa.ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False),
        sa.Column('product_id', sa.String(36), sa.ForeignKey('products.id', ondelete='SET NULL')),
        sa.Column('assigned_to', sa.String(36), sa.ForeignKey('users.id', ondelete='SET NULL')),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('phone', sa.String(20)),
        sa.Column('first_name', sa.String(100)),
        sa.Column('last_name', sa.String(100)),
        sa.Column('company', sa.String(255)),
        sa.Column('job_title', sa.String(100)),
        sa.Column('source', sa.String(50)),
        sa.Column('source_details', sa.JSON, default={}),
        sa.Column('status', sa.String(20), default='new'),
        sa.Column('score', sa.Integer, default=0),
        sa.Column('tags', sa.JSON, default=[]),
        sa.Column('custom_fields', sa.JSON, default={}),
        sa.Column('last_activity_at', sa.DateTime(timezone=True)),
        sa.Column('converted_at', sa.DateTime(timezone=True)),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now())
    )
    op.create_index('idx_leads_org_id', 'leads', ['org_id'])
    op.create_index('idx_leads_email', 'leads', ['org_id', 'email'])
    op.create_index('idx_leads_status', 'leads', ['org_id', 'status'])
    
    # Lead Actions
    op.create_table(
        'lead_actions',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('lead_id', sa.String(36), sa.ForeignKey('leads.id', ondelete='CASCADE'), nullable=False),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id', ondelete='SET NULL')),
        sa.Column('action_type', sa.String(50), nullable=False),
        sa.Column('description', sa.Text),
        sa.Column('metadata', sa.JSON, default={}),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now())
    )
    
    # Lead Flows
    op.create_table(
        'lead_flows',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('org_id', sa.String(36), sa.ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False),
        sa.Column('product_id', sa.String(36), sa.ForeignKey('products.id', ondelete='SET NULL')),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('description', sa.Text),
        sa.Column('trigger_type', sa.String(50), nullable=False),
        sa.Column('trigger_conditions', sa.JSON, default={}),
        sa.Column('steps', sa.JSON, default=[]),
        sa.Column('is_active', sa.Boolean, default=True),
        sa.Column('total_leads', sa.Integer, default=0),
        sa.Column('conversion_count', sa.Integer, default=0),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now())
    )
    
    # Contacts
    op.create_table(
        'contacts',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('org_id', sa.String(36), sa.ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False),
        sa.Column('lead_id', sa.String(36), sa.ForeignKey('leads.id', ondelete='SET NULL')),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('phone', sa.String(20)),
        sa.Column('first_name', sa.String(100)),
        sa.Column('last_name', sa.String(100)),
        sa.Column('company', sa.String(255)),
        sa.Column('job_title', sa.String(100)),
        sa.Column('address', sa.Text),
        sa.Column('city', sa.String(100)),
        sa.Column('state', sa.String(100)),
        sa.Column('country', sa.String(100)),
        sa.Column('postal_code', sa.String(20)),
        sa.Column('tags', sa.JSON, default=[]),
        sa.Column('custom_fields', sa.JSON, default={}),
        sa.Column('is_subscribed', sa.Boolean, default=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now())
    )
    op.create_index('idx_contacts_org_id', 'contacts', ['org_id'])
    op.create_index('idx_contacts_email', 'contacts', ['org_id', 'email'])
    
    # Deals
    op.create_table(
        'deals',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('org_id', sa.String(36), sa.ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False),
        sa.Column('contact_id', sa.String(36), sa.ForeignKey('contacts.id', ondelete='SET NULL')),
        sa.Column('product_id', sa.String(36), sa.ForeignKey('products.id', ondelete='SET NULL')),
        sa.Column('assigned_to', sa.String(36), sa.ForeignKey('users.id', ondelete='SET NULL')),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('value', sa.Numeric(12, 2)),
        sa.Column('currency', sa.String(3), default='INR'),
        sa.Column('stage', sa.String(50), default='prospecting'),
        sa.Column('probability', sa.Integer, default=0),
        sa.Column('expected_close_date', sa.DateTime(timezone=True)),
        sa.Column('actual_close_date', sa.DateTime(timezone=True)),
        sa.Column('notes', sa.Text),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now())
    )
    op.create_index('idx_deals_org_id', 'deals', ['org_id'])
    op.create_index('idx_deals_stage', 'deals', ['org_id', 'stage'])
    
    # AI Agents
    op.create_table(
        'ai_agents',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('org_id', sa.String(36), sa.ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('agent_type', sa.String(50), nullable=False),
        sa.Column('description', sa.Text),
        sa.Column('model', sa.String(50), default='gpt-4'),
        sa.Column('system_prompt', sa.Text),
        sa.Column('temperature', sa.Float, default=0.7),
        sa.Column('max_tokens', sa.Integer, default=4000),
        sa.Column('tools', sa.JSON, default=[]),
        sa.Column('capabilities', sa.JSON, default=[]),
        sa.Column('is_active', sa.Boolean, default=True),
        sa.Column('total_runs', sa.Integer, default=0),
        sa.Column('successful_runs', sa.Integer, default=0),
        sa.Column('avg_response_time', sa.Float),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now())
    )
    op.create_index('idx_ai_agents_org_id', 'ai_agents', ['org_id'])
    
    # Agent Prompts
    op.create_table(
        'agent_prompts',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('agent_id', sa.String(36), sa.ForeignKey('ai_agents.id', ondelete='CASCADE'), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('prompt_type', sa.String(50), nullable=False),
        sa.Column('content', sa.Text, nullable=False),
        sa.Column('variables', sa.JSON, default=[]),
        sa.Column('is_active', sa.Boolean, default=True),
        sa.Column('version', sa.Integer, default=1),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now())
    )
    
    # Workflows
    op.create_table(
        'workflows',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('org_id', sa.String(36), sa.ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('description', sa.Text),
        sa.Column('trigger_type', sa.String(50), nullable=False),
        sa.Column('trigger_config', sa.JSON, default={}),
        sa.Column('steps', sa.JSON, default=[]),
        sa.Column('is_active', sa.Boolean, default=True),
        sa.Column('total_runs', sa.Integer, default=0),
        sa.Column('successful_runs', sa.Integer, default=0),
        sa.Column('last_run_at', sa.DateTime(timezone=True)),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now())
    )
    op.create_index('idx_workflows_org_id', 'workflows', ['org_id'])
    
    # Workflow Runs
    op.create_table(
        'workflow_runs',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('workflow_id', sa.String(36), sa.ForeignKey('workflows.id', ondelete='CASCADE'), nullable=False),
        sa.Column('triggered_by', sa.String(36), sa.ForeignKey('users.id', ondelete='SET NULL')),
        sa.Column('status', sa.String(20), default='pending'),
        sa.Column('started_at', sa.DateTime(timezone=True)),
        sa.Column('completed_at', sa.DateTime(timezone=True)),
        sa.Column('step_results', sa.JSON, default=[]),
        sa.Column('error_message', sa.Text),
        sa.Column('execution_time_ms', sa.Integer),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now())
    )
    
    # Analytics Events
    op.create_table(
        'analytics_events',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('org_id', sa.String(36), sa.ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False),
        sa.Column('event_type', sa.String(100), nullable=False),
        sa.Column('event_source', sa.String(50)),
        sa.Column('entity_type', sa.String(50)),
        sa.Column('entity_id', sa.String(36)),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id', ondelete='SET NULL')),
        sa.Column('properties', sa.JSON, default={}),
        sa.Column('session_id', sa.String(100)),
        sa.Column('ip_address', sa.String(45)),
        sa.Column('user_agent', sa.String(500)),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now())
    )
    op.create_index('idx_analytics_events_org_id', 'analytics_events', ['org_id'])
    op.create_index('idx_analytics_events_type', 'analytics_events', ['org_id', 'event_type'])
    
    # Daily Metrics
    op.create_table(
        'daily_metrics',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('org_id', sa.String(36), sa.ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False),
        sa.Column('product_id', sa.String(36), sa.ForeignKey('products.id', ondelete='SET NULL')),
        sa.Column('date', sa.Date, nullable=False),
        sa.Column('metric_type', sa.String(50), nullable=False),
        sa.Column('content_created', sa.Integer, default=0),
        sa.Column('content_published', sa.Integer, default=0),
        sa.Column('content_engagement', sa.Integer, default=0),
        sa.Column('social_posts', sa.Integer, default=0),
        sa.Column('social_likes', sa.Integer, default=0),
        sa.Column('social_comments', sa.Integer, default=0),
        sa.Column('social_shares', sa.Integer, default=0),
        sa.Column('social_reach', sa.Integer, default=0),
        sa.Column('emails_sent', sa.Integer, default=0),
        sa.Column('emails_opened', sa.Integer, default=0),
        sa.Column('emails_clicked', sa.Integer, default=0),
        sa.Column('email_unsubscribes', sa.Integer, default=0),
        sa.Column('new_leads', sa.Integer, default=0),
        sa.Column('qualified_leads', sa.Integer, default=0),
        sa.Column('converted_leads', sa.Integer, default=0),
        sa.Column('revenue', sa.Numeric(12, 2), default=0),
        sa.Column('deals_won', sa.Integer, default=0),
        sa.Column('deals_lost', sa.Integer, default=0),
        sa.Column('agent_runs', sa.Integer, default=0),
        sa.Column('agent_success_rate', sa.Numeric(5, 2)),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now())
    )
    op.create_index('idx_daily_metrics_org_date', 'daily_metrics', ['org_id', 'date'])
    
    # Activities
    op.create_table(
        'activities',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('org_id', sa.String(36), sa.ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id', ondelete='SET NULL')),
        sa.Column('activity_type', sa.String(50), nullable=False),
        sa.Column('entity_type', sa.String(50)),
        sa.Column('entity_id', sa.String(36)),
        sa.Column('description', sa.Text),
        sa.Column('metadata', sa.JSON, default={}),
        sa.Column('ip_address', sa.String(45)),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now())
    )
    op.create_index('idx_activities_org_id', 'activities', ['org_id'])
    
    print("✅ Complete schema migration completed successfully")


def downgrade() -> None:
    """Drop all tables in reverse order"""
    tables = [
        'activities', 'daily_metrics', 'analytics_events', 'workflow_runs', 'workflows',
        'agent_prompts', 'ai_agents', 'deals', 'contacts', 'lead_flows', 'lead_actions',
        'leads', 'email_automations', 'email_campaigns', 'email_templates', 'social_posts',
        'social_accounts', 'content_approvals', 'content', 'products'
    ]
    
    for table in tables:
        op.drop_table(table)
    
    print("✅ Downgrade completed successfully")
