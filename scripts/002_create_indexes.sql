-- InfiAgentic Platform - Database Indexes
-- Version: 1.0.0

-- ============================================
-- PRIMARY LOOKUP INDEXES
-- ============================================

-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_org_id ON users(org_id);
CREATE INDEX idx_users_org_active ON users(org_id) WHERE is_active = true;

-- Organizations
CREATE INDEX idx_organizations_slug ON organizations(slug);

-- Products
CREATE INDEX idx_products_org_id ON products(org_id);
CREATE INDEX idx_products_org_slug ON products(org_id, slug);
CREATE INDEX idx_products_type ON products(type);

-- ============================================
-- CONTENT INDEXES
-- ============================================

CREATE INDEX idx_content_org_id ON content(org_id);
CREATE INDEX idx_content_org_status ON content(org_id, status);
CREATE INDEX idx_content_org_type ON content(org_id, content_type);
CREATE INDEX idx_content_created_by ON content(created_by);
CREATE INDEX idx_content_product ON content(product_id);
CREATE INDEX idx_content_scheduled ON content(org_id, scheduled_at) WHERE status = 'approved' AND scheduled_at IS NOT NULL;
CREATE INDEX idx_content_pending_approval ON content(org_id, created_at DESC) WHERE status = 'pending_approval';
CREATE INDEX idx_content_published ON content(org_id, published_at DESC) WHERE status = 'published';

-- Content Approvals
CREATE INDEX idx_content_approvals_content ON content_approvals(content_id);
CREATE INDEX idx_content_approvals_user ON content_approvals(user_id);

-- ============================================
-- SOCIAL MEDIA INDEXES
-- ============================================

-- Social Accounts
CREATE INDEX idx_social_accounts_org ON social_accounts(org_id);
CREATE INDEX idx_social_accounts_platform ON social_accounts(org_id, platform);
CREATE INDEX idx_social_accounts_active ON social_accounts(org_id) WHERE is_active = true;

-- Social Posts
CREATE INDEX idx_social_posts_org ON social_posts(org_id);
CREATE INDEX idx_social_posts_account ON social_posts(social_account_id);
CREATE INDEX idx_social_posts_content ON social_posts(content_id);
CREATE INDEX idx_social_posts_scheduled ON social_posts(org_id, scheduled_at) WHERE status = 'scheduled';
CREATE INDEX idx_social_posts_published ON social_posts(org_id, published_at DESC) WHERE status = 'published';
CREATE INDEX idx_social_posts_org_platform_status ON social_posts(org_id, platform, status);

-- ============================================
-- EMAIL INDEXES
-- ============================================

-- Email Templates
CREATE INDEX idx_email_templates_org ON email_templates(org_id);
CREATE INDEX idx_email_templates_active ON email_templates(org_id) WHERE is_active = true;

-- Email Campaigns
CREATE INDEX idx_email_campaigns_org ON email_campaigns(org_id);
CREATE INDEX idx_email_campaigns_status ON email_campaigns(org_id, status);
CREATE INDEX idx_email_campaigns_scheduled ON email_campaigns(org_id, scheduled_at) WHERE status = 'scheduled';
CREATE INDEX idx_email_campaigns_product ON email_campaigns(product_id);

-- Email Automations
CREATE INDEX idx_email_automations_org ON email_automations(org_id);
CREATE INDEX idx_email_automations_active ON email_automations(org_id) WHERE is_active = true;
CREATE INDEX idx_email_automations_trigger ON email_automations(org_id, trigger_type);

-- ============================================
-- CALL MARKETING INDEXES
-- ============================================

CREATE INDEX idx_call_campaigns_org ON call_campaigns(org_id);
CREATE INDEX idx_call_campaigns_status ON call_campaigns(org_id, status);
CREATE INDEX idx_call_logs_campaign ON call_logs(campaign_id);
CREATE INDEX idx_call_logs_lead ON call_logs(lead_id);
CREATE INDEX idx_call_logs_created ON call_logs(created_at DESC);

-- ============================================
-- LEADS & CRM INDEXES
-- ============================================

-- Leads
CREATE INDEX idx_leads_org ON leads(org_id);
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_phone ON leads(phone);
CREATE INDEX idx_leads_org_status ON leads(org_id, status);
CREATE INDEX idx_leads_org_score ON leads(org_id, score DESC);
CREATE INDEX idx_leads_assigned ON leads(assigned_to);
CREATE INDEX idx_leads_product ON leads(product_id);
CREATE INDEX idx_leads_source ON leads(org_id, source);
CREATE INDEX idx_leads_created ON leads(org_id, created_at DESC);
CREATE INDEX idx_leads_new ON leads(org_id, created_at DESC) WHERE status = 'new';

-- Lead Actions
CREATE INDEX idx_lead_actions_lead ON lead_actions(lead_id);
CREATE INDEX idx_lead_actions_type ON lead_actions(action_type);
CREATE INDEX idx_lead_actions_created ON lead_actions(created_at DESC);

-- Lead Flows
CREATE INDEX idx_lead_flows_org ON lead_flows(org_id);
CREATE INDEX idx_lead_flows_active ON lead_flows(org_id) WHERE is_active = true;

-- Lead Scoring
CREATE INDEX idx_lead_scoring_org ON lead_scoring_rules(org_id);
CREATE INDEX idx_lead_scoring_active ON lead_scoring_rules(org_id) WHERE is_active = true;

-- Contacts
CREATE INDEX idx_contacts_org ON contacts(org_id);
CREATE INDEX idx_contacts_email ON contacts(org_id, email);
CREATE INDEX idx_contacts_lead ON contacts(lead_id);
CREATE INDEX idx_contacts_owner ON contacts(owner_id);

-- Deals
CREATE INDEX idx_deals_org ON deals(org_id);
CREATE INDEX idx_deals_contact ON deals(contact_id);
CREATE INDEX idx_deals_product ON deals(product_id);
CREATE INDEX idx_deals_stage ON deals(org_id, stage);
CREATE INDEX idx_deals_owner ON deals(owner_id);
CREATE INDEX idx_deals_close_date ON deals(org_id, expected_close_date);
CREATE INDEX idx_deals_open ON deals(org_id, stage) WHERE won IS NULL;

-- ============================================
-- AI AGENTS & WORKFLOWS INDEXES
-- ============================================

-- AI Agents
CREATE INDEX idx_ai_agents_org ON ai_agents(org_id);
CREATE INDEX idx_ai_agents_type ON ai_agents(org_id, agent_type);
CREATE INDEX idx_ai_agents_active ON ai_agents(org_id) WHERE is_active = true;

-- Agent Prompts
CREATE INDEX idx_agent_prompts_agent ON agent_prompts(agent_id);
CREATE INDEX idx_agent_prompts_active ON agent_prompts(agent_id) WHERE is_active = true;

-- Workflows
CREATE INDEX idx_workflows_org ON workflows(org_id);
CREATE INDEX idx_workflows_agent ON workflows(agent_id);
CREATE INDEX idx_workflows_active ON workflows(org_id) WHERE is_active = true;
CREATE INDEX idx_workflows_trigger ON workflows(org_id, trigger_type);

-- Workflow Runs
CREATE INDEX idx_workflow_runs_workflow ON workflow_runs(workflow_id);
CREATE INDEX idx_workflow_runs_status ON workflow_runs(workflow_id, status);
CREATE INDEX idx_workflow_runs_created ON workflow_runs(created_at DESC);
CREATE INDEX idx_workflow_runs_running ON workflow_runs(workflow_id) WHERE status = 'running';

-- ============================================
-- ANALYTICS INDEXES
-- ============================================

-- Analytics Events (Time-series optimized)
CREATE INDEX idx_analytics_events_org_time ON analytics_events(org_id, created_at DESC);
CREATE INDEX idx_analytics_events_type ON analytics_events(org_id, event_type, created_at DESC);
CREATE INDEX idx_analytics_events_entity ON analytics_events(entity_type, entity_id);
CREATE INDEX idx_analytics_events_product ON analytics_events(product_id, created_at DESC);

-- Daily Metrics
CREATE INDEX idx_daily_metrics_org_date ON daily_metrics(org_id, metric_date DESC);
CREATE INDEX idx_daily_metrics_type ON daily_metrics(org_id, metric_type, metric_date DESC);
CREATE INDEX idx_daily_metrics_product ON daily_metrics(product_id, metric_date DESC);

-- Reports
CREATE INDEX idx_reports_org ON reports(org_id);
CREATE INDEX idx_reports_type ON reports(org_id, report_type);

-- ============================================
-- ACTIVITY LOG INDEXES
-- ============================================

CREATE INDEX idx_activities_org ON activities(org_id);
CREATE INDEX idx_activities_user ON activities(user_id);
CREATE INDEX idx_activities_entity ON activities(entity_type, entity_id);
CREATE INDEX idx_activities_created ON activities(org_id, created_at DESC);
CREATE INDEX idx_activities_action ON activities(org_id, action, created_at DESC);
