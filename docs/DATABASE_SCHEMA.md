# Database Schema Documentation

## Entity Relationship Diagram (ERD)

\`\`\`
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│   organizations │       │      users      │       │      roles      │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │◄──┐   │ id (PK)         │   ┌──►│ id (PK)         │
│ name            │   │   │ org_id (FK)     │───┘   │ name            │
│ slug            │   │   │ role_id (FK)    │───────│ permissions     │
│ settings        │   └───│ email           │       │ created_at      │
│ created_at      │       │ password_hash   │       └─────────────────┘
└─────────────────┘       │ is_active       │
                          │ created_at      │
                          └────────┬────────┘
                                   │
        ┌──────────────────────────┼──────────────────────────┐
        │                          │                          │
        ▼                          ▼                          ▼
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│    products     │       │     content     │       │     leads       │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │       │ id (PK)         │
│ org_id (FK)     │       │ org_id (FK)     │       │ org_id (FK)     │
│ name            │       │ created_by (FK) │       │ product_id (FK) │
│ type            │       │ product_id (FK) │       │ email           │
│ api_key         │       │ title           │       │ phone           │
│ settings        │       │ body            │       │ source          │
└─────────────────┘       │ type            │       │ status          │
                          │ status          │       │ score           │
                          │ scheduled_at    │       │ assigned_to (FK)│
                          └────────┬────────┘       └────────┬────────┘
                                   │                          │
        ┌──────────────────────────┤                          │
        │                          │                          │
        ▼                          ▼                          ▼
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│  social_posts   │       │ email_campaigns │       │  lead_actions   │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │       │ id (PK)         │
│ content_id (FK) │       │ content_id (FK) │       │ lead_id (FK)    │
│ platform        │       │ subject         │       │ action_type     │
│ post_id         │       │ template_id     │       │ agent_id (FK)   │
│ status          │       │ status          │       │ metadata        │
│ metrics         │       │ sent_count      │       │ created_at      │
│ published_at    │       │ opened_count    │       └─────────────────┘
└─────────────────┘       └─────────────────┘

┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│  ai_agents      │       │   workflows     │       │ workflow_runs   │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │       │ id (PK)         │
│ org_id (FK)     │       │ org_id (FK)     │       │ workflow_id (FK)│
│ name            │       │ agent_id (FK)   │       │ status          │
│ type            │       │ name            │       │ input           │
│ config          │       │ trigger_type    │       │ output          │
│ prompts         │       │ steps           │       │ started_at      │
│ state           │       │ is_active       │       │ completed_at    │
│ is_active       │       │ created_at      │       │ error           │
└─────────────────┘       └─────────────────┘       └─────────────────┘

┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│    contacts     │       │      deals      │       │   activities    │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │       │ id (PK)         │
│ org_id (FK)     │       │ org_id (FK)     │       │ org_id (FK)     │
│ lead_id (FK)    │       │ contact_id (FK) │       │ entity_type     │
│ name            │       │ product_id (FK) │       │ entity_id       │
│ email           │       │ title           │       │ action          │
│ phone           │       │ value           │       │ user_id (FK)    │
│ company         │       │ stage           │       │ metadata        │
│ metadata        │       │ probability     │       │ created_at      │
└─────────────────┘       │ close_date      │       └─────────────────┘
                          └─────────────────┘
\`\`\`

## Indexing Strategy

### Primary Indexes
- All `id` columns (auto-indexed as PRIMARY KEY)
- All `org_id` columns for multi-tenant queries
- `users.email` for login lookups
- `leads.email`, `leads.phone` for deduplication

### Composite Indexes
- `(org_id, created_at DESC)` on all major tables for timeline queries
- `(org_id, status)` on content, leads, campaigns
- `(org_id, product_id, status)` for product-specific queries
- `(workflow_id, status, started_at)` for workflow monitoring

### Partial Indexes
- Active records: `WHERE is_active = true`
- Pending approvals: `WHERE status = 'pending_approval'`
- Scheduled content: `WHERE scheduled_at > NOW()`
