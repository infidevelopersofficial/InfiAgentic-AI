import { MetricCard } from "@/components/dashboard/metric-card"
import { AgentStatusCard } from "@/components/dashboard/agent-status-card"
import { ApprovalQueue } from "@/components/dashboard/approval-queue"
import { AnalyticsChart } from "@/components/dashboard/analytics-chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Users, Mail, TrendingUp, Bot, Share2 } from "lucide-react"
import type { Agent, ApprovalRequest } from "@/lib/types"

const mockAgents: Agent[] = [
  {
    id: "1",
    name: "Content Writer",
    type: "content",
    status: "running",
    description: "Generates blog posts and articles based on topics",
    lastRun: new Date(),
    config: {},
  },
  {
    id: "2",
    name: "Social Scheduler",
    type: "social",
    status: "running",
    description: "Schedules and posts content across social platforms",
    lastRun: new Date(),
    config: {},
  },
  {
    id: "3",
    name: "Email Composer",
    type: "email",
    status: "idle",
    description: "Creates personalized email campaigns",
    lastRun: new Date(Date.now() - 86400000),
    config: {},
  },
  {
    id: "4",
    name: "SEO Optimizer",
    type: "seo",
    status: "running",
    description: "Analyzes and improves content SEO",
    lastRun: new Date(),
    config: {},
  },
]

const mockApprovals: ApprovalRequest[] = [
  {
    id: "1",
    type: "content",
    itemId: "c1",
    title: "AI Trends 2025 Blog Post",
    description: "Comprehensive blog post about emerging AI trends",
    requestedBy: "John Doe",
    requestedAt: new Date(),
    status: "pending",
  },
  {
    id: "2",
    type: "campaign",
    itemId: "e1",
    title: "Product Launch Email",
    description: "Email campaign for new feature announcement",
    requestedBy: "Jane Smith",
    requestedAt: new Date(Date.now() - 86400000),
    status: "pending",
  },
]

const chartData = [
  { date: "Jan", value: 4000 },
  { date: "Feb", value: 3000 },
  { date: "Mar", value: 5000 },
  { date: "Apr", value: 4500 },
  { date: "May", value: 6000 },
  { date: "Jun", value: 5500 },
  { date: "Jul", value: 7000 },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your marketing automation platform</p>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Content"
          value="248"
          change={12}
          changeType="increase"
          icon={FileText}
          description="vs last month"
        />
        <MetricCard
          title="Active Leads"
          value="1,429"
          change={8}
          changeType="increase"
          icon={Users}
          description="vs last month"
        />
        <MetricCard
          title="Email Sent"
          value="52.4K"
          change={-3}
          changeType="decrease"
          icon={Mail}
          description="vs last month"
        />
        <MetricCard
          title="Engagement Rate"
          value="4.2%"
          change={0.5}
          changeType="increase"
          icon={TrendingUp}
          description="vs last month"
        />
      </div>

      {/* Charts and Agents */}
      <div className="grid gap-6 lg:grid-cols-2">
        <AnalyticsChart title="Content Performance" data={chartData} type="area" />
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              AI Agents Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {mockAgents.map((agent) => (
                <AgentStatusCard key={agent.id} agent={agent} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Approvals */}
      <ApprovalQueue requests={mockApprovals} />

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Social Reach</CardTitle>
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">125.4K</div>
            <p className="text-xs text-muted-foreground">Across all platforms</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Workflows Active</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Running automations</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.2%</div>
            <p className="text-xs text-muted-foreground">Lead to customer</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
