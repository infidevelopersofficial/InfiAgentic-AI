"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, MoreHorizontal, GitBranch, Users, Zap, TrendingUp, ArrowRight, Mail, Clock } from "lucide-react"

const leadFlows = [
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
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lead Flows</h1>
          <p className="text-muted-foreground">Automated lead nurturing sequences powered by AI</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Flow
        </Button>
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
              <p className="text-2xl font-bold">{leadFlows.filter((f) => f.status === "active").length}</p>
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
              <p className="text-2xl font-bold">
                {Math.round(leadFlows.reduce((acc, f) => acc + f.conversionRate, 0) / leadFlows.length)}%
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10">
              <Zap className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Emails Sent</p>
              <p className="text-2xl font-bold">48.2K</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lead Flows */}
      <div className="space-y-4">
        {leadFlows.map((flow) => (
          <Card key={flow.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">{flow.name}</h3>
                    <Badge variant="outline" className={statusColors[flow.status]}>
                      {flow.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{flow.description}</p>

                  {/* Flow Steps Visualization */}
                  <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-2">
                    {flow.steps.map((step, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2">
                          {step.type === "email" ? (
                            <Mail className="h-4 w-4 text-blue-500" />
                          ) : (
                            <Clock className="h-4 w-4 text-orange-500" />
                          )}
                          <span className="text-sm whitespace-nowrap">{step.label}</span>
                        </div>
                        {index < flow.steps.length - 1 && (
                          <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Zap className="h-4 w-4" />
                      <span>Trigger: {flow.trigger}</span>
                    </div>
                    <div className="text-muted-foreground">{flow.leads.toLocaleString()} leads</div>
                    <div className="text-muted-foreground">{flow.conversionRate}% conversion</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {flow.status === "active" ? "Active" : "Paused"}
                    </span>
                    <Switch checked={flow.status === "active"} />
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
        ))}
      </div>
    </div>
  )
}
