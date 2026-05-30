"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import type { Lead } from "@/lib/types"

interface LeadPipelineProps {
  leads: Lead[]
}

const stages = [
  { id: "new", label: "New", color: "bg-blue-500" },
  { id: "contacted", label: "Contacted", color: "bg-yellow-500" },
  { id: "qualified", label: "Qualified", color: "bg-orange-500" },
  { id: "proposal", label: "Proposal", color: "bg-purple-500" },
  { id: "negotiation", label: "Negotiation", color: "bg-pink-500" },
  { id: "won", label: "Won", color: "bg-green-500" },
]

export function LeadPipeline({ leads }: LeadPipelineProps) {
  const getLeadsByStage = (stage: string) => leads.filter((lead) => lead.status === stage)

  return (
    <ScrollArea className="w-full">
      <div className="flex gap-4 pb-4">
        {stages.map((stage) => {
          const stageLeads = getLeadsByStage(stage.id)
          return (
            <div key={stage.id} className="w-72 shrink-0">
              <div className="mb-3 flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${stage.color}`} />
                <span className="font-medium">{stage.label}</span>
                <Badge variant="secondary" className="ml-auto">
                  {stageLeads.length}
                </Badge>
              </div>
              <div className="space-y-3">
                {stageLeads.map((lead) => (
                  <Card key={lead.id} className="cursor-pointer transition-shadow hover:shadow-md">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {lead.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <p className="font-medium leading-none">{lead.name}</p>
                          {lead.company && <p className="text-sm text-muted-foreground">{lead.company}</p>}
                          <div className="flex items-center gap-2 pt-2">
                            <Badge variant="outline" className="text-xs">
                              Score: {lead.score}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{lead.source}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )
        })}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}
