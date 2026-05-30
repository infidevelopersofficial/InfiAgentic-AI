"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Check, X, Eye } from "lucide-react"
import type { ApprovalRequest } from "@/lib/types"

interface ApprovalQueueProps {
  requests: ApprovalRequest[]
  onApprove?: (request: ApprovalRequest) => void
  onReject?: (request: ApprovalRequest) => void
  onView?: (request: ApprovalRequest) => void
}

const typeColors: Record<string, string> = {
  content: "bg-blue-500/10 text-blue-600",
  campaign: "bg-purple-500/10 text-purple-600",
  workflow: "bg-orange-500/10 text-orange-600",
}

export function ApprovalQueue({ requests, onApprove, onReject, onView }: ApprovalQueueProps) {
  const pendingRequests = requests.filter((r) => r.status === "pending")

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Pending Approvals</CardTitle>
        <Badge variant="secondary">{pendingRequests.length} pending</Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pendingRequests.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">No pending approvals</p>
          ) : (
            pendingRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{request.requestedBy.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{request.title}</p>
                      <Badge variant="secondary" className={typeColors[request.type]}>
                        {request.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{request.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Requested {new Date(request.requestedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => onView?.(request)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                    onClick={() => onApprove?.(request)}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => onReject?.(request)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
