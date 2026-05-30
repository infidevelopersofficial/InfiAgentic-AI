"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw, Settings } from "lucide-react"
import type { Agent } from "@/lib/types"
import { cn } from "@/lib/utils"

interface AgentStatusCardProps {
  agent: Agent
  onStart?: () => void
  onPause?: () => void
  onRestart?: () => void
}

const statusColors = {
  idle: "bg-muted text-muted-foreground",
  running: "bg-green-500/10 text-green-500 border-green-500/20",
  paused: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  error: "bg-red-500/10 text-red-500 border-red-500/20",
  completed: "bg-blue-500/10 text-blue-500 border-blue-500/20",
}

export function AgentStatusCard({ agent, onStart, onPause, onRestart }: AgentStatusCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">{agent.name}</CardTitle>
        <Badge variant="outline" className={cn("capitalize", statusColors[agent.status])}>
          {agent.status}
        </Badge>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{agent.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            {agent.lastRun && <span>Last run: {new Date(agent.lastRun).toLocaleString()}</span>}
          </div>
          <div className="flex gap-1">
            {agent.status === "idle" || agent.status === "paused" ? (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onStart}>
                <Play className="h-4 w-4" />
              </Button>
            ) : agent.status === "running" ? (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onPause}>
                <Pause className="h-4 w-4" />
              </Button>
            ) : null}
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onRestart}>
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
