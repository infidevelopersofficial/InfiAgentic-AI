"use client"

import { useState } from "react"
import { CreateWorkflowDialog } from "@/components/dashboard/create-workflow-dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, MoreHorizontal, GitBranch, Zap, Play, Settings, TrendingUp, Clock, ArrowRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ErrorBoundary, ErrorState } from "@/components/ui/error-boundary"
import { LoadingState } from "@/components/ui/loading-state"

const triggerOptions = [
  { value: "new_lead", label: "New Lead Created" },
  { value: "content_ready", label: "Content Marked Ready" },
  { value: "lead_inactive", label: "Lead Inactive 30 Days" },
  { value: "weekly_schedule", label: "Weekly Schedule" },
  { value: "daily_schedule", label: "Daily Schedule" },
  { value: "campaign_response", label: "Campaign Response" },
  { value: "manual_trigger", label: "Manual Trigger" },
  { value: "data_change", label: "Data Change" },
]

const initialWorkflows = [
  {
    id: "1",
    name: "New Lead Nurture Sequence",
    description: "Automatically nurture new leads with personalized content over 14 days",
    status: "active",
    trigger: "New lead created",
    steps: 8,
    runs: 1247,
    successRate: 94,
  },
  {
    id: "2",
    name: "Content Publishing Pipeline",
    description: "Review, optimize, and publish content across all channels",
    status: "active",
    trigger: "Content marked ready",
    steps: 5,
    runs: 342,
    successRate: 98,
  },
  {
    id: "3",
    name: "Re-engagement Campaign",
    description: "Reach out to inactive leads with targeted messaging",
    status: "paused",
    trigger: "Lead inactive 30 days",
    steps: 6,
    runs: 89,
    successRate: 72,
  },
  {
    id: "4",
    name: "Weekly Report Generation",
    description: "Generate and distribute weekly performance reports",
    status: "active",
    trigger: "Every Monday 9 AM",
    steps: 4,
    runs: 52,
    successRate: 100,
  },
]

const statusColors: Record<string, string> = {
  active: "bg-green-500/10 text-green-600 border-green-500/20",
  paused: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  draft: "bg-muted text-muted-foreground",
}

export default function WorkflowsPage() {
  const { toast } = useToast()
  const [workflows, setWorkflows] = useState(initialWorkflows)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreateWorkflow = async (newWorkflow: any) => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Validate required fields
      if (!newWorkflow.name || !newWorkflow.name.trim()) {
        throw new Error("Workflow name is required")
      }
      
      if (!newWorkflow.trigger) {
        throw new Error("Trigger is required")
      }

      if (!newWorkflow.steps || newWorkflow.steps.length === 0) {
        throw new Error("At least one workflow step is required")
      }

      // Check for duplicate name
      const duplicateName = workflows.some(workflow => 
        workflow.name.toLowerCase() === newWorkflow.name.trim().toLowerCase()
      )
      if (duplicateName) {
        throw new Error("A workflow with this name already exists")
      }

      const workflow = {
        id: (workflows.length + 1).toString(),
        name: newWorkflow.name.trim(),
        description: newWorkflow.description?.trim() || "",
        status: "draft",
        trigger: triggerOptions.find(opt => opt.value === newWorkflow.trigger)?.label || newWorkflow.trigger,
        steps: newWorkflow.steps.length,
        runs: 0,
        successRate: 0,
      }
      
      setWorkflows([workflow, ...workflows])
      
      toast({
        title: "Workflow Created",
        description: `${workflow.name} has been created successfully.`,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create workflow"
      setError(errorMessage)
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleStatus = async (workflowId: string) => {
    try {
      setWorkflows(prev =>
        prev.map(workflow =>
          workflow.id === workflowId
            ? { ...workflow, status: workflow.status === "active" ? "paused" : "active" }
            : workflow
        )
      )
      
      const workflow = workflows.find(w => w.id === workflowId)
      toast({
        title: "Status Updated",
        description: `${workflow?.name} is now ${workflow?.status === "active" ? "paused" : "active"}.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update workflow status",
        variant: "destructive",
      })
    }
  }

  const handleRunWorkflow = async (workflowId: string) => {
    try {
      const workflow = workflows.find(w => w.id === workflowId)
      if (!workflow) return

      // Simulate running workflow
      toast({
        title: "Workflow Running",
        description: `${workflow.name} is now executing...`,
      })
      
      // Update run count
      setWorkflows(prev =>
        prev.map(w =>
          w.id === workflowId
            ? { ...w, runs: w.runs + 1 }
            : w
        )
      )
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to run workflow",
        variant: "destructive",
      })
    }
  }

  const handleRetry = () => {
    setError(null)
    setIsLoading(false)
  }

  if (error) {
    return (
      <ErrorState 
        message={error} 
        onRetry={handleRetry}
      />
    )
  }

  if (isLoading) {
    return <LoadingState message="Creating workflow..." />
  }

  return (
    <ErrorBoundary>
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workflows</h1>
          <p className="text-muted-foreground">Automate your marketing processes with AI-powered workflows</p>
        </div>
        <CreateWorkflowDialog onCreateWorkflow={handleCreateWorkflow}>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Workflow
          </Button>
        </CreateWorkflowDialog>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <GitBranch className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Workflows</p>
              <p className="text-2xl font-bold">{workflows.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
              <Play className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active</p>
              <p className="text-2xl font-bold">{workflows.filter((w) => w.status === "active").length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
              <Zap className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Runs</p>
              <p className="text-2xl font-bold">{workflows.reduce((acc, w) => acc + w.runs, 0).toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10">
              <Clock className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg Success Rate</p>
              <p className="text-2xl font-bold">
                {Math.round(workflows.reduce((acc, w) => acc + w.successRate, 0) / workflows.length)}%
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workflows List */}
      <div className="space-y-4">
        {workflows.map((workflow) => (
          <Card key={workflow.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">{workflow.name}</h3>
                    <Badge variant="outline" className={statusColors[workflow.status]}>
                      {workflow.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{workflow.description}</p>
                  <div className="mt-4 flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Zap className="h-4 w-4" />
                      <span>Trigger: {workflow.trigger}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <ArrowRight className="h-4 w-4" />
                      <span>{workflow.steps} steps</span>
                    </div>
                    <div className="text-muted-foreground">{workflow.runs.toLocaleString()} runs</div>
                    <div className="text-muted-foreground">{workflow.successRate}% success</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {workflow.status === "active" ? "Active" : "Paused"}
                    </span>
                    <Switch 
                      checked={workflow.status === "active"} 
                      onCheckedChange={() => handleToggleStatus(workflow.id)}
                    />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleRunWorkflow(workflow.id)}>
                        <Play className="h-4 w-4 mr-2" />
                        Run Now
                      </DropdownMenuItem>
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem>Duplicate</DropdownMenuItem>
                      <DropdownMenuItem>View Logs</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
    </ErrorBoundary>
  )
}
