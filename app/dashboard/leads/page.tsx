"use client"

import { useState, useMemo, useCallback } from "react"
import { CreateFlowDialog } from "@/components/dashboard/create-flow-dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, MoreHorizontal, GitBranch, Users, Zap, TrendingUp, ArrowRight, Mail, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ErrorBoundary, ErrorState } from "@/components/ui/error-boundary"
import { LoadingState } from "@/components/ui/loading-state"
import { usePerformanceMonitor } from "@/lib/performance"

const triggerOptions = [
  { value: "form_submission", label: "Form Submission" },
  { value: "demo_request", label: "Demo Request" },
  { value: "email_signup", label: "Email Signup" },
  { value: "inactive_30_days", label: "Inactive 30 Days" },
  { value: "campaign_response", label: "Campaign Response" },
  { value: "manual_add", label: "Manual Add" },
]

const initialLeadFlows = [
  {
    id: "1",
    name: "Website Signup Flow",
    description: "Nurture new website signups with welcome series and product education",
    status: "active",
    trigger: "Form submission",
    leads: 2847,
    conversionRate: 24,
    steps: [
      { type: "email", label: "Welcome Email" },
      { type: "delay", label: "Wait 2 days" },
      { type: "email", label: "Product Guide" },
      { type: "delay", label: "Wait 3 days" },
      { type: "email", label: "Case Study" },
    ],
  },
  {
    id: "2",
    name: "Demo Request Flow",
    description: "High-intent lead nurturing for demo requests",
    status: "active",
    trigger: "Demo form submitted",
    leads: 456,
    conversionRate: 42,
    steps: [
      { type: "email", label: "Confirmation" },
      { type: "delay", label: "Wait 1 hour" },
      { type: "email", label: "Prep Materials" },
    ],
  },
  {
    id: "3",
    name: "Re-engagement Flow",
    description: "Win back inactive leads with targeted messaging",
    status: "paused",
    trigger: "Inactive 30 days",
    leads: 1234,
    conversionRate: 8,
    steps: [
      { type: "email", label: "We Miss You" },
      { type: "delay", label: "Wait 7 days" },
      { type: "email", label: "Special Offer" },
    ],
  },
]

const statusColors: Record<string, string> = {
  active: "bg-green-500/10 text-green-600 border-green-500/20",
  paused: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
}

export default function LeadFlowsPage() {
  const { toast } = useToast()
  const [leadFlows, setLeadFlows] = useState(initialLeadFlows)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Performance monitoring
  usePerformanceMonitor('LeadFlowsPage')

  // Memoized metrics calculation
  const metrics = useMemo(() => ({
    totalFlows: leadFlows.length,
    activeFlows: leadFlows.filter(flow => flow.status === 'active').length,
    totalLeads: leadFlows.reduce((acc, flow) => acc + flow.leads, 0),
    avgConversion: Math.round(
      leadFlows.reduce((acc, flow) => acc + flow.conversionRate, 0) / leadFlows.length
    )
  }), [leadFlows])

  const handleCreateFlow = useCallback(async (newFlow: any) => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Validate required fields
      if (!newFlow.name || !newFlow.name.trim()) {
        throw new Error("Flow name is required")
      }
      
      if (!newFlow.trigger) {
        throw new Error("Trigger is required")
      }

      // Check for duplicate name
      const duplicateName = leadFlows.some(flow => 
        flow.name.toLowerCase() === newFlow.name.trim().toLowerCase()
      )
      if (duplicateName) {
        throw new Error("A flow with this name already exists")
      }

      const flow = {
        id: (leadFlows.length + 1).toString(),
        name: newFlow.name.trim(),
        description: newFlow.description?.trim() || "",
        status: "paused",
        trigger: triggerOptions.find(opt => opt.value === newFlow.trigger)?.label || newFlow.trigger,
        leads: 0,
        conversionRate: 0,
        steps: newFlow.steps || [],
      }
      
      setLeadFlows([flow, ...leadFlows])
      
      toast({
        title: "Flow Created",
        description: `${flow.name} has been created successfully.`,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create flow"
      setError(errorMessage)
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [leadFlows, toast])

  const handleToggleStatus = useCallback(async (flowId: string) => {
    try {
      setLeadFlows(prev =>
        prev.map(flow =>
          flow.id === flowId
            ? { ...flow, status: flow.status === "active" ? "paused" : "active" }
            : flow
        )
      )
      
      const flow = leadFlows.find(f => f.id === flowId)
      toast({
        title: "Status Updated",
        description: `${flow?.name} is now ${flow?.status === "active" ? "paused" : "active"}.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update flow status",
        variant: "destructive",
      })
    }
  }, [leadFlows, toast])

  const handleRetry = useCallback(() => {
    setError(null)
    setIsLoading(false)
  }, [])

  // Memoized flow card component to prevent unnecessary re-renders
  const FlowCard = useCallback(({ flow }: { flow: any }) => (
    <Card key={flow.id}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <GitBranch className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">{flow.name}</h3>
              <p className="text-sm text-muted-foreground mb-2">{flow.description}</p>
              <div className="flex items-center gap-2">
                <Badge className={statusColors[flow.status]}>
                  {flow.status}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {flow.trigger}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-medium">{flow.leads.toLocaleString()} leads</div>
              <div className="text-sm text-muted-foreground">{flow.conversionRate}% conversion</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {flow.status === "active" ? "Active" : "Paused"}
              </span>
              <Switch 
                checked={flow.status === "active"} 
                onCheckedChange={() => handleToggleStatus(flow.id)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Edit Flow</DropdownMenuItem>
                <DropdownMenuItem>Duplicate</DropdownMenuItem>
                <DropdownMenuItem>View Analytics</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  ), [handleToggleStatus])

  if (error) {
    return (
      <ErrorState 
        message={error} 
        onRetry={handleRetry}
      />
    )
  }

  if (isLoading) {
    return <LoadingState message="Creating flow..." />
  }

  return (
    <ErrorBoundary>
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lead Flows</h1>
          <p className="text-muted-foreground">Automated lead nurturing sequences powered by AI</p>
        </div>
        <CreateFlowDialog onCreateFlow={handleCreateFlow}>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Flow
          </Button>
        </CreateFlowDialog>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <GitBranch className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Flows</p>
              <p className="text-2xl font-bold">{metrics.activeFlows}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
              <Users className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Leads in Flows</p>
              <p className="text-2xl font-bold">{leadFlows.reduce((acc, f) => acc + f.leads, 0).toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
              <TrendingUp className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg. Conversion</p>
              <p className="text-2xl font-bold">{metrics.avgConversion}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Flow List */}
      <div className="space-y-4">
        {leadFlows.map((flow) => (
          <FlowCard key={flow.id} flow={flow} />
        ))}
      </div>
      </div>
    </ErrorBoundary>
  )
}
