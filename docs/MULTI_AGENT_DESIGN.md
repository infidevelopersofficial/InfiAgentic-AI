# Multi-Agent AI System Design

## Architecture Overview

\`\`\`
┌─────────────────────────────────────────────────────────────────────────┐
│                         ORCHESTRATOR LAYER                              │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    Agent Orchestrator                            │   │
│  │  • Task Distribution    • State Management    • Error Handling   │   │
│  │  • Context Sharing      • Tool Routing        • Rate Limiting    │   │
│  └─────────────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────────────┤
│                          AGENT LAYER                                    │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐           │
│  │  Content Agent  │ │ Engagement Agent│ │   Sales Agent   │           │
│  │  ─────────────  │ │  ─────────────  │ │  ─────────────  │           │
│  │ • Generate      │ │ • Respond       │ │ • Qualify       │           │
│  │ • Optimize      │ │ • Analyze       │ │ • Score         │           │
│  │ • Schedule      │ │ • Recommend     │ │ • Nurture       │           │
│  └────────┬────────┘ └────────┬────────┘ └────────┬────────┘           │
│           │                   │                   │                     │
├───────────┴───────────────────┴───────────────────┴─────────────────────┤
│                          TOOL LAYER                                     │
│  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐          │
│  │Content│ │Social │ │ Email │ │  CRM  │ │Analytics│ │External│         │
│  │ APIs  │ │ APIs  │ │ APIs  │ │ APIs  │ │  APIs  │ │  APIs  │         │
│  └───────┘ └───────┘ └───────┘ └───────┘ └───────┘ └───────┘          │
└─────────────────────────────────────────────────────────────────────────┘
\`\`\`

---

## 1. Content Agent

### Purpose
Generates, optimizes, and manages marketing content across all channels and products.

### Capabilities
\`\`\`typescript
interface ContentAgentCapabilities {
  generate_post: (params: PostParams) => Promise<PostContent>;
  generate_email: (params: EmailParams) => Promise<EmailContent>;
  generate_article: (params: ArticleParams) => Promise<ArticleContent>;
  optimize_seo: (content: string) => Promise<SEOOptimizedContent>;
  suggest_hashtags: (content: string, platform: Platform) => Promise<string[]>;
  analyze_sentiment: (content: string) => Promise<SentimentAnalysis>;
  repurpose_content: (content: Content, targetFormat: ContentType) => Promise<Content>;
  schedule_optimal: (content: Content, platform: Platform) => Promise<ScheduleRecommendation>;
}
\`\`\`

### System Prompt
\`\`\`
You are an expert marketing content creator for InfiDevelopers, managing three distinct SaaS products:

1. **Jyotishya** - Astrology SaaS Platform
   - Tone: Mystical yet professional, trustworthy
   - Topics: Horoscopes, Kundli, planetary alignments, life guidance
   - Audience: Spiritually curious professionals, 25-55 years

2. **HealthPedya.in** - Healthcare Information Portal
   - Tone: Authoritative, empathetic, educational
   - Topics: Medical information, wellness, Ayurveda, healthy living
   - Audience: Health-conscious individuals, caregivers, 30-60 years

3. **SchooPay.in** - Education Payments Platform
   - Tone: Professional, trustworthy, helpful
   - Topics: School fees, payment convenience, financial planning for education
   - Audience: Parents, school administrators, 28-50 years

**Core Guidelines:**
- Always maintain brand voice consistency for each product
- Create value-driven content that educates before selling
- Use relevant hashtags and optimize for each platform's algorithm
- Include clear calls-to-action without being pushy
- Adapt content length and style for each platform:
  - Twitter: Concise, engaging, 280 chars max
  - LinkedIn: Professional, thought-leadership, 1300 chars ideal
  - Instagram: Visual-first, emotional, storytelling
  - Facebook: Community-focused, conversational
  - Email: Personalized, value-packed, scannable

**Content Quality Standards:**
- Readability: Flesch score > 60
- SEO: Include primary keyword in first 100 words
- Engagement: Hook in first line, CTA in last line
- Accuracy: Fact-check all health and financial claims
\`\`\`

### Tool Definitions
\`\`\`typescript
const contentAgentTools = [
  {
    name: "generate_post",
    description: "Generate a social media post for a specific platform",
    parameters: {
      platform: { type: "string", enum: ["twitter", "linkedin", "instagram", "facebook"] },
      product: { type: "string", enum: ["jyotishya", "healthpedya", "schoopay"] },
      topic: { type: "string" },
      tone: { type: "string", enum: ["professional", "casual", "inspiring", "educational"] },
      include_cta: { type: "boolean", default: true },
      hashtag_count: { type: "number", default: 5 }
    }
  },
  {
    name: "generate_email",
    description: "Generate email content for campaigns",
    parameters: {
      campaign_type: { type: "string", enum: ["newsletter", "promotional", "nurture", "transactional"] },
      product: { type: "string" },
      audience_segment: { type: "string" },
      personalization_fields: { type: "array", items: { type: "string" } }
    }
  },
  {
    name: "optimize_seo",
    description: "Optimize content for search engines",
    parameters: {
      content: { type: "string" },
      target_keywords: { type: "array", items: { type: "string" } },
      content_type: { type: "string", enum: ["article", "landing_page", "product_page"] }
    }
  }
];
\`\`\`

### State Management
\`\`\`typescript
interface ContentAgentState {
  current_task: string | null;
  content_queue: ContentItem[];
  generated_today: number;
  performance_metrics: {
    avg_engagement_rate: number;
    top_performing_topics: string[];
    optimal_posting_times: Record<Platform, string[]>;
  };
  learning_context: {
    recent_feedback: Feedback[];
    brand_guidelines: BrandGuidelines;
    competitor_insights: CompetitorInsight[];
  };
}
\`\`\`

---

## 2. Engagement Agent

### Purpose
Manages social media interactions, analyzes audience behavior, and optimizes engagement strategies.

### Capabilities
\`\`\`typescript
interface EngagementAgentCapabilities {
  respond_comment: (params: CommentParams) => Promise<ResponseContent>;
  analyze_sentiment: (text: string) => Promise<SentimentResult>;
  find_trends: (params: TrendParams) => Promise<TrendingTopics>;
  analyze_engagement: (postId: string) => Promise<EngagementAnalysis>;
  recommend_response_priority: (comments: Comment[]) => Promise<PrioritizedComments>;
  detect_crisis: (mentions: Mention[]) => Promise<CrisisAlert | null>;
  suggest_engagement_actions: (context: EngagementContext) => Promise<ActionSuggestions>;
}
\`\`\`

### System Prompt
\`\`\`
You are a social media engagement specialist for InfiDevelopers. Your role is to maintain positive brand presence and build community across all platforms.

**Primary Responsibilities:**
1. Respond to comments and messages professionally and helpfully
2. Identify and escalate potential PR issues quickly
3. Find trending topics relevant to our products
4. Analyze engagement patterns to improve content strategy
5. Build relationships with key influencers and engaged followers

**Response Guidelines:**
- Always be helpful, empathetic, and on-brand
- Acknowledge the person's concern/question specifically
- Provide value in every interaction
- For negative comments: Acknowledge, apologize if needed, offer solution
- For questions: Provide clear, accurate answers or direct to resources
- For compliments: Thank genuinely and encourage sharing
- Never be defensive or dismissive
- Escalate serious complaints to human team immediately

**Platform-Specific Behaviors:**
- Twitter: Quick, concise responses; use appropriate emojis
- LinkedIn: Professional tone; add value to discussions
- Instagram: Warm, personal; use emojis liberally
- Facebook: Conversational; encourage community discussion

**Crisis Detection Triggers:**
- Multiple negative mentions in short timeframe
- Mentions of legal/safety issues
- Viral negative content about brand
- Competitor attack campaigns
\`\`\`

### Tool Definitions
\`\`\`typescript
const engagementAgentTools = [
  {
    name: "respond_comment",
    description: "Generate a response to a social media comment",
    parameters: {
      platform: { type: "string" },
      original_post: { type: "string" },
      comment_text: { type: "string" },
      commenter_history: { type: "object" },
      sentiment: { type: "string", enum: ["positive", "negative", "neutral", "question"] }
    }
  },
  {
    name: "analyze_engagement",
    description: "Analyze engagement metrics for a post",
    parameters: {
      post_id: { type: "string" },
      metrics: { type: "object" },
      benchmark_against: { type: "string", enum: ["historical", "competitor", "industry"] }
    }
  },
  {
    name: "find_trends",
    description: "Find trending topics relevant to our products",
    parameters: {
      products: { type: "array", items: { type: "string" } },
      platforms: { type: "array", items: { type: "string" } },
      time_range: { type: "string", enum: ["24h", "7d", "30d"] }
    }
  }
];
\`\`\`

---

## 3. Sales Agent

### Purpose
Qualifies leads, manages nurture sequences, and assists sales team with deal progression.

### Capabilities
\`\`\`typescript
interface SalesAgentCapabilities {
  qualify_lead: (lead: Lead) => Promise<QualificationResult>;
  score_lead: (lead: Lead) => Promise<LeadScore>;
  send_sequence: (params: SequenceParams) => Promise<SequenceResult>;
  update_crm: (update: CRMUpdate) => Promise<void>;
  schedule_meeting: (params: MeetingParams) => Promise<MeetingScheduled>;
  analyze_intent: (interactions: Interaction[]) => Promise<IntentAnalysis>;
  recommend_next_action: (lead: Lead) => Promise<ActionRecommendation>;
  identify_cross_sell: (contact: Contact) => Promise<CrossSellOpportunities>;
}
\`\`\`

### System Prompt
\`\`\`
You are a sales development representative for InfiDevelopers. Your goal is to qualify leads, nurture prospects, and support the sales team in closing deals.

**Qualification Framework (BANT):**
- **Budget**: Can they afford our solution? Look for company size, funding status
- **Authority**: Are they a decision-maker? Check title, department
- **Need**: Do they have a problem we solve? Analyze their interactions
- **Timeline**: How urgent is their need? Look for trigger events

**Lead Scoring Criteria:**
- Company fit (industry, size, location): 0-30 points
- Engagement level (emails, site visits, content): 0-30 points
- Intent signals (pricing page, demo request): 0-25 points
- Timing indicators (budget cycle, recent funding): 0-15 points

**Nurture Strategy by Score:**
- 0-30: Educational content, build awareness
- 31-50: Case studies, product benefits
- 51-70: Comparison guides, ROI calculators
- 71-85: Demo offers, trial invitations
- 86-100: Sales handoff, meeting scheduling

**Product-Specific Positioning:**
1. **Jyotishya**: Personal guidance, accuracy, tradition meets technology
2. **HealthPedya**: Trusted information, comprehensive coverage, easy access
3. **SchooPay**: Convenience, security, time-saving

**Communication Guidelines:**
- Be consultative, not pushy
- Ask questions to understand needs
- Provide value before asking for commitment
- Personalize based on their industry and role
- Follow up persistently but respectfully (max 5 touches)
\`\`\`

### Tool Definitions
\`\`\`typescript
const salesAgentTools = [
  {
    name: "qualify_lead",
    description: "Qualify a lead using BANT criteria",
    parameters: {
      lead_id: { type: "string" },
      lead_data: { type: "object" },
      interaction_history: { type: "array" }
    }
  },
  {
    name: "score_lead",
    description: "Calculate lead score based on multiple factors",
    parameters: {
      lead_id: { type: "string" },
      scoring_model: { type: "string", default: "default" }
    }
  },
  {
    name: "send_sequence",
    description: "Enroll lead in email sequence",
    parameters: {
      lead_id: { type: "string" },
      sequence_id: { type: "string" },
      personalization: { type: "object" }
    }
  },
  {
    name: "schedule_meeting",
    description: "Schedule a sales meeting",
    parameters: {
      lead_id: { type: "string" },
      meeting_type: { type: "string", enum: ["discovery", "demo", "proposal", "closing"] },
      preferred_times: { type: "array" },
      sales_rep_id: { type: "string" }
    }
  }
];
\`\`\`

---

## Workflow Examples

### 1. Weekly Content Calendar Generation

\`\`\`yaml
name: Weekly Content Calendar
trigger: schedule
schedule: "0 9 * * 1"  # Every Monday at 9 AM

steps:
  - id: analyze_performance
    agent: engagement
    action: analyze_engagement
    input:
      time_range: "7d"
      group_by: "content_type"
    
  - id: find_trends
    agent: engagement
    action: find_trends
    input:
      products: ["jyotishya", "healthpedya", "schoopay"]
      platforms: ["twitter", "linkedin", "instagram"]
      
  - id: generate_calendar
    agent: content
    action: generate_weekly_plan
    input:
      performance_data: "{{analyze_performance.output}}"
      trending_topics: "{{find_trends.output}}"
      posts_per_day: 3
      platforms: ["twitter", "linkedin", "instagram"]
      
  - id: generate_content
    agent: content
    action: generate_batch
    input:
      plan: "{{generate_calendar.output}}"
    parallel: true
    
  - id: schedule_posts
    action: schedule_posts
    input:
      posts: "{{generate_content.output}}"
      auto_schedule: true
      
  - id: notify
    action: notify
    input:
      channel: "slack"
      message: "Weekly content calendar generated with {{generate_content.output.count}} posts"
\`\`\`

### 2. New Lead Nurture Flow

\`\`\`yaml
name: New Lead Nurture
trigger: event
event: "lead.created"
conditions:
  - field: "score"
    operator: "gte"
    value: 30

steps:
  - id: qualify
    agent: sales
    action: qualify_lead
    input:
      lead_id: "{{trigger.lead_id}}"
      
  - id: delay_1
    action: delay
    duration: "1h"
    
  - id: send_welcome
    agent: content
    action: generate_email
    input:
      template: "welcome_sequence_1"
      lead_data: "{{trigger.lead_data}}"
      qualification: "{{qualify.output}}"
    then:
      action: send_email
      
  - id: delay_2
    action: delay
    duration: "2d"
    
  - id: check_engagement
    action: check_condition
    condition: "{{lead.email_opened}}"
    
  - id: engaged_path
    if: "{{check_engagement.result}}"
    steps:
      - agent: content
        action: generate_email
        input:
          template: "value_proposition"
          personalize: true
          
  - id: not_engaged_path
    else:
    steps:
      - agent: content
        action: generate_email
        input:
          template: "re_engagement"
          subject_variation: "A/B"
          
  - id: delay_3
    action: delay
    duration: "3d"
    
  - id: score_update
    agent: sales
    action: score_lead
    input:
      lead_id: "{{trigger.lead_id}}"
      include_recent_activity: true
      
  - id: handoff_check
    action: check_condition
    condition: "{{score_update.output.score}} >= 70"
    
  - id: sales_handoff
    if: "{{handoff_check.result}}"
    steps:
      - action: assign_lead
        input:
          method: "round_robin"
          team: "sales"
      - action: notify
        input:
          channel: "slack"
          message: "Hot lead ready for sales: {{trigger.lead_data.email}}"
\`\`\`

### 3. Social Media Crisis Response

\`\`\`yaml
name: Crisis Detection & Response
trigger: event
event: "social.mention"
conditions:
  - field: "sentiment"
    operator: "eq"
    value: "negative"
  - field: "reach"
    operator: "gte"
    value: 1000

steps:
  - id: analyze_severity
    agent: engagement
    action: detect_crisis
    input:
      mention: "{{trigger.mention}}"
      recent_mentions: "{{lookup_recent_mentions(24h)}}"
      
  - id: severity_check
    action: check_condition
    condition: "{{analyze_severity.output.severity}} >= 'medium'"
    
  - id: crisis_response
    if: "{{severity_check.result}}"
    steps:
      - action: notify_urgent
        input:
          channels: ["slack", "email", "sms"]
          recipients: ["pr_team", "leadership"]
          message: "CRISIS ALERT: {{analyze_severity.output.summary}}"
          
      - agent: engagement
        action: respond_comment
        input:
          priority: "immediate"
          tone: "apologetic"
          escalate: true
          
      - action: pause_scheduled_posts
        input:
          duration: "24h"
          platforms: "all"
          
  - id: standard_response
    else:
    steps:
      - agent: engagement
        action: respond_comment
        input:
          mention: "{{trigger.mention}}"
          follow_guidelines: true
\`\`\`

---

## State Management

### Global Agent State
\`\`\`typescript
interface GlobalAgentState {
  // Shared context across all agents
  organization: {
    id: string;
    settings: OrgSettings;
    products: Product[];
    brand_guidelines: BrandGuidelines;
  };
  
  // Real-time metrics
  metrics: {
    content_performance: ContentMetrics;
    engagement_rates: EngagementMetrics;
    lead_pipeline: PipelineMetrics;
  };
  
  // Learning & optimization
  learning: {
    successful_patterns: Pattern[];
    failed_attempts: FailedAttempt[];
    a_b_test_results: ABTestResult[];
  };
  
  // Rate limiting & quotas
  quotas: {
    api_calls_remaining: Record<string, number>;
    content_generated_today: number;
    emails_sent_today: number;
  };
}
\`\`\`

### Agent Communication Protocol
\`\`\`typescript
interface AgentMessage {
  id: string;
  from_agent: AgentType;
  to_agent: AgentType | 'orchestrator';
  message_type: 'request' | 'response' | 'event' | 'error';
  payload: unknown;
  context: {
    workflow_id?: string;
    step_id?: string;
    correlation_id: string;
  };
  timestamp: Date;
}
\`\`\`

---

## Error Handling & Fallbacks

\`\`\`typescript
const errorHandlingStrategy = {
  // Retry configuration
  retry: {
    max_attempts: 3,
    backoff: 'exponential',
    initial_delay: 1000,
    max_delay: 30000
  },
  
  // Fallback actions by error type
  fallbacks: {
    'rate_limit': {
      action: 'queue_for_later',
      notify: false
    },
    'api_error': {
      action: 'retry_with_backoff',
      notify: true,
      threshold: 3
    },
    'content_rejected': {
      action: 'request_human_review',
      notify: true
    },
    'critical_failure': {
      action: 'halt_and_escalate',
      notify: true,
      channels: ['slack', 'email']
    }
  },
  
  // Circuit breaker
  circuit_breaker: {
    failure_threshold: 5,
    reset_timeout: 60000,
    half_open_requests: 1
  }
};
