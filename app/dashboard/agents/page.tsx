"use client"

import { useState, useEffect, useCallback } from "react"
import { AgentStatusCard } from "@/components/dashboard/agent-status-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AnalyticsChart } from "@/components/dashboard/analytics-chart"
import { CreateAgentDialog } from "@/components/dashboard/create-agent-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { 
  Plus, 
  Bot, 
  Zap, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Play, 
  Pause, 
  Square, 
  Settings, 
  MoreHorizontal,
  Search,
  Filter,
  Edit,
  Trash2,
  RefreshCw,
  Activity,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api-client"
import type { Agent } from "@/lib/types"

// Helper function to map backend agent to frontend Agent type
function mapBackendAgentToFrontend(backendAgent: any): Agent {
  return {
    id: backendAgent.id,
    name: backendAgent.name,
    type: backendAgent.agent_type as Agent['type'],
    status: backendAgent.status as Agent['status'],
    description: backendAgent.description || '',
    lastRun: backendAgent.last_run_at ? new Date(backendAgent.last_run_at) : undefined,
    nextRun: backendAgent.next_run_at ? new Date(backendAgent.next_run_at) : undefined,
    config: backendAgent.config || {},
  }
}

const initialAgents: Agent[] = [
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
  const { toast } = useToast()
  const [agents, setAgents] = useState<Agent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [selectedType, setSelectedType] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  
  // Fetch agents on mount
  useEffect(() => {
    const fetchAgents = async () => {
      setIsLoading(true)
      try {
        const response = await apiClient.getAgents({ page: 1, limit: 100 })
        const mappedAgents = response.items.map(mapBackendAgentToFrontend)
        setAgents(mappedAgents)
      } catch (err: any) {
        const errorMessage = err.detail || 'Failed to load agents'
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchAgents()
  }, [toast])
  
  const runningAgents = agents.filter((a) => a.status === "running").length
  const totalTasks = 1247 // This would come from backend stats
  const successRate = 98.5 // This would come from backend stats

  const handleCreateAgent = useCallback(async (newAgent: any) => {
    setIsCreating(true)
    try {
      const backendAgent = await apiClient.createAgent({
        name: newAgent.name,
        agent_type: newAgent.type,
        description: newAgent.description,
        config: newAgent.config || {},
      })

      const agent = mapBackendAgentToFrontend(backendAgent)
      setAgents(prev => [agent, ...prev])
      
      toast({
        title: "Agent Created",
        description: `${agent.name} has been created successfully.`,
      })
    } catch (err: any) {
      const errorMessage = err.detail || 'Failed to create agent'
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }, [toast])

  const handleStartAgent = useCallback(async (agentId: string) => {
    try {
      await apiClient.updateAgent(agentId, { status: 'running' })
      
      setAgents(prev =>
        prev.map(agent =>
          agent.id === agentId
            ? { ...agent, status: "running" as const }
            : agent
        )
      )
      
      toast({
        title: "Agent Started",
        description: "Agent has been started successfully.",
      })
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.detail || "Failed to start agent",
        variant: "destructive",
      })
    }
  }, [toast])

  const handleStopAgent = useCallback(async (agentId: string) => {
    try {
      await apiClient.updateAgent(agentId, { status: 'idle' })
      
      setAgents(prev =>
        prev.map(agent =>
          agent.id === agentId
            ? { ...agent, status: "idle" as const }
            : agent
        )
      )
      
      toast({
        title: "Agent Stopped",
        description: "Agent has been stopped.",
      })
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.detail || "Failed to stop agent",
        variant: "destructive",
      })
    }
  }, [toast])

  const handleDeleteAgent = useCallback(async (agentId: string) => {
    try {
      await apiClient.deleteAgent(agentId)
      setAgents(prev => prev.filter(agent => agent.id !== agentId))
      
      toast({
        title: "Agent Deleted",
        description: "Agent has been removed.",
        variant: "destructive",
      })
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.detail || "Failed to delete agent",
        variant: "destructive",
      })
    }
  }, [toast])

  const filteredAgents = agents.filter(agent => {
    const matchesType = selectedType === "all" || agent.type === selectedType
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesType && matchesSearch
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running": return "text-green-600 bg-green-50"
      case "idle": return "text-gray-600 bg-gray-50"
      case "error": return "text-red-600 bg-red-50"
      default: return "text-gray-600 bg-gray-50"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Agents</h1>
          <p className="text-muted-foreground">Monitor and manage your AI agent workforce</p>
        </div>
        <CreateAgentDialog onCreateAgent={handleCreateAgent}>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Agent
          </Button>
        </CreateAgentDialog>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search agents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="content">Content</SelectItem>
            <SelectItem value="social">Social</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="seo">SEO</SelectItem>
            <SelectItem value="analytics">Analytics</SelectItem>
            <SelectItem value="orchestrator">Orchestrator</SelectItem>
          </SelectContent>
        </Select>
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
            {filteredAgents.map((agent) => (
              <Card key={agent.id} className="relative">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                        agent.status === 'running' ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        <Bot className={`h-5 w-5 ${
                          agent.status === 'running' ? 'text-green-600' : 'text-gray-600'
                        }`} />
                      </div>
                      <div>
                        <h3 className="font-semibold">{agent.name}</h3>
                        <Badge className={getStatusColor(agent.status)}>
                          {agent.status}
                        </Badge>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {agent.status === 'idle' ? (
                          <DropdownMenuItem onClick={() => handleStartAgent(agent.id)}>
                            <Play className="h-4 w-4 mr-2" />
                            Start Agent
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleStopAgent(agent.id)}>
                            <Pause className="h-4 w-4 mr-2" />
                            Stop Agent
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem>
                          <Settings className="h-4 w-4 mr-2" />
                          Configure
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Activity className="h-4 w-4 mr-2" />
                          View Logs
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteAgent(agent.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{agent.description}</p>
                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                      <span>Last run: {agent.lastRun?.toLocaleTimeString() || 'Never'}</span>
                      {agent.nextRun && <span>Next: {agent.nextRun.toLocaleTimeString()}</span>}
                    </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="running" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredAgents
              .filter((a) => a.status === "running")
              .map((agent) => (
                <Card key={agent.id} className="relative">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                          <Bot className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{agent.name}</h3>
                          <Badge className="text-green-600 bg-green-50">
                            running
                          </Badge>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleStopAgent(agent.id)}>
                            <Pause className="h-4 w-4 mr-2" />
                            Stop Agent
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Settings className="h-4 w-4 mr-2" />
                            Configure
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Activity className="h-4 w-4 mr-2" />
                            View Logs
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">{agent.description}</p>
                    <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                      <span>Last run: {agent.lastRun?.toLocaleTimeString() || 'Never'}</span>
                      {agent.nextRun && <span>Next: {agent.nextRun.toLocaleTimeString()}</span>}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
        <TabsContent value="idle" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredAgents
              .filter((a) => a.status === "idle")
              .map((agent) => (
                <Card key={agent.id} className="relative">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                          <Bot className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{agent.name}</h3>
                          <Badge className="text-gray-600 bg-gray-50">
                            idle
                          </Badge>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleStartAgent(agent.id)}>
                            <Play className="h-4 w-4 mr-2" />
                            Start Agent
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Settings className="h-4 w-4 mr-2" />
                            Configure
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Activity className="h-4 w-4 mr-2" />
                            View Logs
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteAgent(agent.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">{agent.description}</p>
                    <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                      <span>Last run: {agent.lastRun?.toLocaleTimeString() || 'Never'}</span>
                      {agent.nextRun && <span>Next: {agent.nextRun.toLocaleTimeString()}</span>}
                    </div>
                  </CardContent>
                </Card>
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
