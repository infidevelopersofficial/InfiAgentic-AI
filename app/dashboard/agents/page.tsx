"use client"

import { AgentStatusCard } from "@/components/dashboard/agent-status-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AnalyticsChart } from "@/components/dashboard/analytics-chart"
import { Plus, Bot, Zap, Clock, CheckCircle, AlertCircle } from "lucide-react"
import type { Agent } from "@/lib/types"

const agents: Agent[] = [
  {
    id: "1",
    name: "Content Writer Agent",
    type: "content",
    status: "running",
    description: "Generates high-quality blog posts, articles, and marketing copy using GPT-4",
    lastRun: new Date(),
    nextRun: new Date(Date.now() + 3600000),
    config: { model: "gpt-4", temperature: 0.7 },
  },
  {
    id: "2",
    name: "Social Media Agent",
    type: "social",
    status: "running",
    description: "Schedules and optimizes posts across Twitter, LinkedIn, and Instagram",
    lastRun: new Date(Date.now() - 1800000),
    nextRun: new Date(Date.now() + 1800000),
    config: { platforms: ["twitter", "linkedin", "instagram"] },
  },
  {
    id: "3",
    name: "Email Personalization Agent",
    type: "email",
    status: "idle",
    description: "Creates personalized email content based on recipient data and behavior",
    lastRun: new Date(Date.now() - 86400000),
    config: { personalizationLevel: "high" },
  },
  {
    id: "4",
    name: "SEO Optimizer Agent",
    type: "seo",
    status: "running",
    description: "Analyzes and improves content for search engine optimization",
    lastRun: new Date(Date.now() - 600000),
    nextRun: new Date(Date.now() + 2400000),
    config: { targetKeywords: 10 },
  },
  {
    id: "5",
    name: "Lead Scoring Agent",
    type: "analytics",
    status: "running",
    description: "Evaluates and scores leads based on engagement and fit criteria",
    lastRun: new Date(Date.now() - 300000),
    nextRun: new Date(Date.now() + 3300000),
    config: { scoringModel: "ml-v2" },
  },
  {
    id: "6",
    name: "Orchestrator Agent",
    type: "orchestrator",
    status: "running",
    description: "Coordinates all agents and manages workflow execution",
    lastRun: new Date(Date.now() - 60000),
    nextRun: new Date(Date.now() + 60000),
    config: { mode: "auto" },
  },
]

const activityData = [
  { date: "00:00", value: 12 },
  { date: "04:00", value: 8 },
  { date: "08:00", value: 24 },
  { date: "12:00", value: 45 },
  { date: "16:00", value: 38 },
  { date: "20:00", value: 22 },
]

const recentLogs = [
  { time: "2 min ago", agent: "Content Writer", action: "Generated blog post: AI Trends 2025", status: "success" },
  { time: "5 min ago", agent: "SEO Optimizer", action: "Optimized 3 articles for keywords", status: "success" },
  { time: "8 min ago", agent: "Social Media", action: "Scheduled 5 posts for tomorrow", status: "success" },
  { time: "15 min ago", agent: "Lead Scoring", action: "Scored 47 new leads", status: "success" },
  { time: "23 min ago", agent: "Email Agent", action: "Rate limit reached, pausing", status: "warning" },
]

export default function AgentsPage() {
  const runningAgents = agents.filter((a) => a.status === "running").length
  const totalTasks = 1247
  const successRate = 98.5

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Agents</h1>
          <p className="text-muted-foreground">Monitor and manage your AI agent workforce</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Agent
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
              <Bot className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Running Agents</p>
              <p className="text-2xl font-bold">
                {runningAgents}/{agents.length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
              <Zap className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tasks Today</p>
              <p className="text-2xl font-bold">{totalTasks}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10">
              <CheckCircle className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
              <p className="text-2xl font-bold">{successRate}%</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/10">
              <Clock className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg. Response</p>
              <p className="text-2xl font-bold">1.2s</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agents Grid */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Agents</TabsTrigger>
          <TabsTrigger value="running">Running</TabsTrigger>
          <TabsTrigger value="idle">Idle</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent) => (
              <AgentStatusCard key={agent.id} agent={agent} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="running" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {agents
              .filter((a) => a.status === "running")
              .map((agent) => (
                <AgentStatusCard key={agent.id} agent={agent} />
              ))}
          </div>
        </TabsContent>
        <TabsContent value="idle" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {agents
              .filter((a) => a.status === "idle")
              .map((agent) => (
                <AgentStatusCard key={agent.id} agent={agent} />
              ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Activity and Logs */}
      <div className="grid gap-6 lg:grid-cols-2">
        <AnalyticsChart title="Agent Activity (Today)" data={activityData} type="area" />
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentLogs.map((log, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    {log.status === "success" ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{log.agent}</span>
                      <Badge variant="secondary" className="text-xs">
                        {log.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{log.action}</p>
                    <p className="text-xs text-muted-foreground">{log.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
