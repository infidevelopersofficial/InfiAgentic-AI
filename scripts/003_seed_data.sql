-- InfiAgentic Platform - Seed Data
-- Version: 1.0.0

-- ============================================
-- SYSTEM ROLES
-- ============================================

-- Create default organization for seeding
INSERT INTO organizations (id, name, slug, settings, subscription_tier) VALUES
('00000000-0000-0000-0000-000000000001', 'InfiDevelopers', 'infidevelopers', '{"theme": "dark", "timezone": "Asia/Kolkata"}', 'enterprise');

-- System roles (org_id NULL = system-wide)
INSERT INTO roles (id, org_id, name, description, permissions, is_system) VALUES
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Super Admin', 'Full system access', '["*"]', true),
('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Admin', 'Organization administrator', '["org:manage", "users:manage", "content:manage", "social:manage", "email:manage", "leads:manage", "crm:manage", "analytics:view", "agents:manage", "workflows:manage", "settings:manage"]', true),
('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Marketing Manager', 'Marketing team lead', '["content:manage", "social:manage", "email:manage", "analytics:view", "agents:use"]', true),
('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Content Creator', 'Content creation and publishing', '["content:create", "content:edit", "social:schedule", "analytics:view"]', true),
('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'Sales Rep', 'Sales and CRM access', '["leads:view", "leads:edit", "crm:manage", "analytics:view"]', true),
('00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 'Analyst', 'View-only analytics access', '["analytics:view", "reports:view"]', true);

-- Admin user (password: admin123 - hashed with bcrypt)
INSERT INTO users (id, org_id, role_id, email, password_hash, first_name, last_name, is_active, is_verified) VALUES
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'admin@infidevelopers.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTtYt.Q8XW5L5e', 'Admin', 'User', true, true);

-- ============================================
-- PRODUCTS
-- ============================================

INSERT INTO products (id, org_id, name, slug, type, description, is_active) VALUES
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Jyotishya', 'jyotishya', 'jyotishya', 'Astrology SaaS Platform - Horoscope, Kundli, Predictions', true),
('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'HealthPedya', 'healthpedya', 'healthpedya', 'Healthcare Information Portal - Medical, Wellness, Ayurveda', true),
('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'SchooPay', 'schoopay', 'schoopay', 'Education Payments Platform - School Fees, Subscriptions', true);

-- ============================================
-- AI AGENTS
-- ============================================

INSERT INTO ai_agents (id, org_id, name, description, agent_type, model, system_prompt, tools, config, is_active, created_by) VALUES
(
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'Content Creator Agent',
    'Generates marketing content for social media, blogs, emails, and ads',
    'content',
    'gpt-4',
    'You are an expert marketing content creator for InfiDevelopers. You create engaging, conversion-focused content for three products: Jyotishya (astrology), HealthPedya (healthcare), and SchooPay (education payments). Always maintain brand voice, use relevant hashtags, and optimize for each platform. Focus on value-driven content that educates and converts.',
    '["generate_post", "generate_email", "generate_article", "optimize_seo", "suggest_hashtags", "analyze_sentiment"]',
    '{"temperature": 0.7, "max_tokens": 2000, "tone": "professional_friendly"}',
    true,
    '00000000-0000-0000-0000-000000000001'
),
(
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'Engagement Agent',
    'Manages social media engagement, responds to comments, and analyzes audience',
    'engagement',
    'gpt-4',
    'You are a social media engagement specialist. Your role is to: 1) Respond to comments and messages professionally, 2) Identify trending topics relevant to our products, 3) Suggest optimal posting times, 4) Analyze engagement patterns, 5) Recommend content adjustments based on performance. Always be helpful, empathetic, and on-brand.',
    '["respond_comment", "analyze_sentiment", "find_trends", "schedule_optimal", "analyze_engagement"]',
    '{"temperature": 0.6, "response_style": "conversational"}',
    true,
    '00000000-0000-0000-0000-000000000001'
),
(
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'Sales Agent',
    'Qualifies leads, nurtures prospects, and assists with deal progression',
    'sales',
    'gpt-4',
    'You are a sales development representative for InfiDevelopers. Your responsibilities: 1) Qualify inbound leads using BANT criteria, 2) Score leads based on engagement and fit, 3) Send personalized follow-up sequences, 4) Identify upsell/cross-sell opportunities across our three products, 5) Schedule demos and meetings. Always be consultative, not pushy.',
    '["qualify_lead", "score_lead", "send_sequence", "update_crm", "schedule_meeting", "analyze_intent"]',
    '{"temperature": 0.5, "qualification_criteria": "BANT"}',
    true,
    '00000000-0000-0000-0000-000000000001'
);

-- ============================================
-- AGENT PROMPTS
-- ============================================

INSERT INTO agent_prompts (id, agent_id, name, prompt_type, template, variables, is_active) VALUES
-- Content Agent Prompts
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Social Post Generator', 'generate_post', 
'Create a {{platform}} post for {{product_name}}.

Topic: {{topic}}
Goal: {{goal}}
Tone: {{tone}}
Character Limit: {{char_limit}}

Requirements:
- Include a compelling hook
- Add relevant emojis (2-3 max)
- Include a clear CTA
- Suggest 3-5 hashtags
- Keep it authentic and engaging

Generate the post:', 
'["platform", "product_name", "topic", "goal", "tone", "char_limit"]', true),

('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Email Campaign Generator', 'generate_email',
'Create an email for {{campaign_type}} campaign.

Product: {{product_name}}
Audience: {{audience_segment}}
Subject Goal: {{subject_goal}}
Main Message: {{main_message}}
CTA: {{cta_text}}

Generate:
1. 3 subject line options (A/B test ready)
2. Preview text
3. Email body (HTML-ready)
4. Plain text version

Email:', 
'["campaign_type", "product_name", "audience_segment", "subject_goal", "main_message", "cta_text"]', true),

-- Engagement Agent Prompts
('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 'Comment Response', 'respond_comment',
'Respond to this {{platform}} comment/message:

Original Post: {{post_content}}
Comment: {{comment_text}}
Commenter Info: {{commenter_info}}
Sentiment: {{detected_sentiment}}

Guidelines:
- Be helpful and professional
- Address their specific question/concern
- Stay on brand for {{product_name}}
- Include a soft CTA if appropriate
- Keep response under {{max_length}} characters

Response:', 
'["platform", "post_content", "comment_text", "commenter_info", "detected_sentiment", "product_name", "max_length"]', true),

-- Sales Agent Prompts
('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000003', 'Lead Qualification', 'qualify_lead',
'Qualify this lead for {{product_name}}:

Lead Info:
- Name: {{lead_name}}
- Company: {{company}}
- Title: {{job_title}}
- Source: {{source}}
- Actions: {{recent_actions}}

Evaluate using BANT:
- Budget: Likely budget range
- Authority: Decision-making power
- Need: Problem they''re trying to solve
- Timeline: Urgency level

Provide:
1. Qualification Score (1-100)
2. Recommended next action
3. Personalized talking points
4. Potential objections to address

Analysis:', 
'["product_name", "lead_name", "company", "job_title", "source", "recent_actions"]', true);

-- ============================================
-- SAMPLE WORKFLOWS
-- ============================================

INSERT INTO workflows (id, org_id, agent_id, name, description, trigger_type, trigger_config, steps, is_active, created_by) VALUES
(
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'Weekly Content Calendar',
    'Generates weekly content calendar with posts for all platforms',
    'schedule',
    '{"cron": "0 9 * * 1", "timezone": "Asia/Kolkata"}',
    '[
        {"id": 1, "type": "agent_action", "action": "generate_weekly_plan", "config": {"products": ["jyotishya", "healthpedya", "schoopay"]}},
        {"id": 2, "type": "condition", "condition": "plan_approved", "true_step": 3, "false_step": 5},
        {"id": 3, "type": "agent_action", "action": "generate_content_batch", "config": {"count": 21}},
        {"id": 4, "type": "action", "action": "schedule_posts", "config": {"auto_schedule": true}},
        {"id": 5, "type": "notification", "action": "notify_approval", "config": {"channel": "slack"}}
    ]',
    true,
    '00000000-0000-0000-0000-000000000001'
),
(
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000003',
    'New Lead Nurture Sequence',
    'Automatically nurtures new leads with personalized content',
    'event',
    '{"event": "lead.created", "filters": {"score": {"gte": 30}}}',
    '[
        {"id": 1, "type": "agent_action", "action": "qualify_lead", "config": {}},
        {"id": 2, "type": "delay", "duration": "1h"},
        {"id": 3, "type": "agent_action", "action": "send_welcome_email", "config": {"template": "welcome_sequence_1"}},
        {"id": 4, "type": "delay", "duration": "2d"},
        {"id": 5, "type": "condition", "condition": "email_opened", "true_step": 6, "false_step": 8},
        {"id": 6, "type": "agent_action", "action": "send_value_email", "config": {"template": "value_prop"}},
        {"id": 7, "type": "delay", "duration": "3d"},
        {"id": 8, "type": "agent_action", "action": "send_case_study", "config": {}},
        {"id": 9, "type": "action", "action": "assign_to_sales", "config": {"round_robin": true}}
    ]',
    true,
    '00000000-0000-0000-0000-000000000001'
);

-- ============================================
-- EMAIL TEMPLATES
-- ============================================

INSERT INTO email_templates (id, org_id, name, subject, html_content, text_content, category, is_active, created_by) VALUES
(
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'Welcome Email',
    'Welcome to {{product_name}} - Let''s Get Started!',
    '<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><h1 style="color: #6366f1;">Welcome, {{first_name}}!</h1><p>Thank you for joining {{product_name}}. We''re excited to have you on board.</p><p>Here''s what you can do next:</p><ul><li>Complete your profile</li><li>Explore our features</li><li>Check out our getting started guide</li></ul><a href="{{cta_url}}" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Get Started</a></body></html>',
    'Welcome, {{first_name}}!\n\nThank you for joining {{product_name}}. We''re excited to have you on board.\n\nHere''s what you can do next:\n- Complete your profile\n- Explore our features\n- Check out our getting started guide\n\nGet Started: {{cta_url}}',
    'onboarding',
    true,
    '00000000-0000-0000-0000-000000000001'
);
