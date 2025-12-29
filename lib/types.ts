// Core Types for Agentic AI Platform

export type AgentStatus = "idle" | "running" | "paused" | "error" | "completed"
export type ContentStatus = "draft" | "pending_review" | "approved" | "scheduled" | "published" | "rejected"
export type CampaignStatus = "draft" | "active" | "paused" | "completed" | "archived"
export type LeadStatus = "new" | "contacted" | "qualified" | "proposal" | "negotiation" | "won" | "lost"
export type Priority = "low" | "medium" | "high" | "urgent"

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  role: "admin" | "editor" | "viewer"
  createdAt: Date
}

export interface Agent {
  id: string
  name: string
  type: "content" | "social" | "email" | "seo" | "analytics" | "orchestrator"
  status: AgentStatus
  description: string
  lastRun?: Date
  nextRun?: Date
  config: Record<string, unknown>
}

export interface ContentItem {
  id: string
  title: string
  type: "blog" | "social" | "email" | "ad" | "landing_page"
  status: ContentStatus
  content: string
  metadata: {
    keywords?: string[]
    tone?: string
    targetAudience?: string
    seoScore?: number
  }
  createdBy: string
  createdAt: Date
  updatedAt: Date
  scheduledFor?: Date
  publishedAt?: Date
}

export interface SocialPost {
  id: string
  contentId?: string
  platform: "twitter" | "linkedin" | "facebook" | "instagram" | "threads"
  content: string
  media?: string[]
  status: ContentStatus
  scheduledFor?: Date
  publishedAt?: Date
  metrics?: {
    likes: number
    comments: number
    shares: number
    impressions: number
    engagementRate: number
  }
}

export interface EmailCampaign {
  id: string
  name: string
  subject: string
  preheader?: string
  content: string
  status: CampaignStatus
  audienceId: string
  scheduledFor?: Date
  sentAt?: Date
  metrics?: {
    sent: number
    delivered: number
    opened: number
    clicked: number
    bounced: number
    unsubscribed: number
  }
}

export interface Lead {
  id: string
  name: string
  email: string
  company?: string
  phone?: string
  status: LeadStatus
  score: number
  source: string
  assignedTo?: string
  tags: string[]
  notes: string[]
  createdAt: Date
  updatedAt: Date
}

// Backend API response types
export interface BackendLead {
  id: string
  email: string
  phone?: string
  first_name?: string
  last_name?: string
  company?: string
  source?: string
  status: string
  score: number
  tags: string[]
  created_at: string
  updated_at?: string
}

export interface Workflow {
  id: string
  name: string
  description: string
  trigger: {
    type: "schedule" | "event" | "manual" | "webhook"
    config: Record<string, unknown>
  }
  steps: WorkflowStep[]
  status: "active" | "paused" | "draft"
  createdAt: Date
  updatedAt: Date
}

export interface WorkflowStep {
  id: string
  type: "agent" | "condition" | "delay" | "action" | "approval"
  agentId?: string
  config: Record<string, unknown>
  nextSteps: string[]
}

export interface ApprovalRequest {
  id: string
  type: "content" | "campaign" | "workflow"
  itemId: string
  title: string
  description: string
  requestedBy: string
  requestedAt: Date
  status: "pending" | "approved" | "rejected"
  reviewedBy?: string
  reviewedAt?: Date
  comments?: string
}

export interface AnalyticsMetric {
  name: string
  value: number
  change: number
  changeType: "increase" | "decrease" | "neutral"
  period: string
}

export interface ChartDataPoint {
  date: string
  value: number
  category?: string
}
