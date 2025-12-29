"use client"

import { useState, useEffect, useCallback } from "react"
import { ApprovalQueue } from "@/components/dashboard/approval-queue"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { CheckCircle, Clock, XCircle, Eye, MessageSquare } from "lucide-react"
import type { ApprovalRequest } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api-client"

// Helper function to map backend approval to frontend ApprovalRequest type
function mapBackendApprovalToFrontend(backendApproval: any): ApprovalRequest {
  return {
    id: backendApproval.id,
    type: backendApproval.type as ApprovalRequest['type'],
    itemId: backendApproval.item_id,
    title: backendApproval.title,
    description: backendApproval.description || '',
    requestedBy: backendApproval.requested_by || '',
    requestedAt: new Date(backendApproval.requested_at),
    status: backendApproval.status as ApprovalRequest['status'],
    reviewedBy: backendApproval.reviewed_by || undefined,
    reviewedAt: backendApproval.reviewed_at ? new Date(backendApproval.reviewed_at) : undefined,
    comments: backendApproval.comments || undefined,
  }
}

const initialApprovals: ApprovalRequest[] = [
  {
    id: "1",
    type: "content",
    itemId: "c1",
    title: "AI Trends 2025 Blog Post",
    description: "Comprehensive blog post about emerging AI trends in marketing",
    requestedBy: "John Doe",
    requestedAt: new Date(),
    status: "pending",
  },
  {
    id: "2",
    type: "campaign",
    itemId: "e1",
    title: "Product Launch Email Campaign",
    description: "Email sequence for new feature announcement",
    requestedBy: "Jane Smith",
    requestedAt: new Date(Date.now() - 86400000),
    status: "pending",
  },
  {
    id: "3",
    type: "workflow",
    itemId: "w1",
    title: "Lead Nurture Automation",
    description: "14-day automated lead nurturing sequence",
    requestedBy: "Mike Wilson",
    requestedAt: new Date(Date.now() - 172800000),
    status: "pending",
  },
  {
    id: "4",
    type: "content",
    itemId: "c2",
    title: "Social Media Calendar - March",
    description: "Monthly social media content plan",
    requestedBy: "Sarah Lee",
    requestedAt: new Date(Date.now() - 259200000),
    status: "approved",
    reviewedBy: "Admin",
    reviewedAt: new Date(Date.now() - 86400000),
  },
  {
    id: "5",
    type: "campaign",
    itemId: "e2",
    title: "Re-engagement Email Blast",
    description: "Email campaign targeting inactive subscribers",
    requestedBy: "Tom Brown",
    requestedAt: new Date(Date.now() - 345600000),
    status: "rejected",
    reviewedBy: "Admin",
    reviewedAt: new Date(Date.now() - 172800000),
    comments: "Please revise the subject line for better open rates",
  },
]

export default function ApprovalsPage() {
  const { toast } = useToast()
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectComment, setRejectComment] = useState("")
  const [activeTab, setActiveTab] = useState("pending")

  // Fetch approvals on mount and when tab changes
  useEffect(() => {
    const fetchApprovals = async () => {
      setIsLoading(true)
      try {
        const params: any = { page: 1, limit: 100 }
        if (activeTab !== "all") {
          params.status = activeTab
        }
        const response = await apiClient.getApprovals(params)
        const mappedApprovals = response.items.map(mapBackendApprovalToFrontend)
        setApprovals(mappedApprovals)
      } catch (err: any) {
        const errorMessage = err.detail || 'Failed to load approvals'
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchApprovals()
  }, [activeTab, toast])

  const pendingCount = approvals.filter((a) => a.status === "pending").length
  const approvedCount = approvals.filter((a) => a.status === "approved").length
  const rejectedCount = approvals.filter((a) => a.status === "rejected").length

  const handleApprove = useCallback(async (request: ApprovalRequest) => {
    try {
      const updatedApproval = await apiClient.approveItem(request.id)
      const mappedApproval = mapBackendApprovalToFrontend(updatedApproval)
      
      setApprovals(prev =>
        prev.map(approval =>
          approval.id === request.id ? mappedApproval : approval
        )
      )
      
      toast({
        title: "Request Approved",
        description: `${request.title} has been approved.`,
      })
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.detail || "Failed to approve request",
        variant: "destructive",
      })
    }
  }, [toast])

  const handleReject = (request: ApprovalRequest) => {
    setSelectedRequest(request)
    setRejectDialogOpen(true)
  }

  const confirmReject = useCallback(async () => {
    if (!selectedRequest) return

    try {
      const updatedApproval = await apiClient.rejectItem(selectedRequest.id, rejectComment)
      const mappedApproval = mapBackendApprovalToFrontend(updatedApproval)
      
      setApprovals(prev =>
        prev.map(approval =>
          approval.id === selectedRequest.id ? mappedApproval : approval
        )
      )
      
      setRejectDialogOpen(false)
      setRejectComment("")
      setSelectedRequest(null)
      
      toast({
        title: "Request Rejected",
        description: `${selectedRequest.title} has been rejected.`,
        variant: "destructive",
      })
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.detail || "Failed to reject request",
        variant: "destructive",
      })
    }
  }, [selectedRequest, rejectComment, toast])

  const handleView = (request: ApprovalRequest) => {
    setSelectedRequest(request)
    setViewDialogOpen(true)
  }

  const getFilteredApprovals = (status: string) => {
    if (status === "all") return approvals
    return approvals.filter((a) => a.status === status)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Approvals</h1>
        <p className="text-muted-foreground">Review and approve content, campaigns, and workflows</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-500/10">
              <Clock className="h-6 w-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold">{pendingCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Approved</p>
              <p className="text-2xl font-bold">{approvedCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-500/10">
              <XCircle className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Rejected</p>
              <p className="text-2xl font-bold">{rejectedCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Approval Queue */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading approvals...</p>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="pending">
              Pending{" "}
              <Badge variant="secondary" className="ml-2">
                {pendingCount}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
          <TabsContent value="pending" className="mt-6">
            <ApprovalQueue 
              requests={getFilteredApprovals("pending")} 
              onApprove={handleApprove}
              onReject={handleReject}
              onView={handleView}
            />
          </TabsContent>
          <TabsContent value="approved" className="mt-6">
            <ApprovalQueue 
              requests={getFilteredApprovals("approved")} 
              onApprove={handleApprove}
              onReject={handleReject}
              onView={handleView}
            />
          </TabsContent>
          <TabsContent value="rejected" className="mt-6">
            <ApprovalQueue 
              requests={getFilteredApprovals("rejected")} 
              onApprove={handleApprove}
              onReject={handleReject}
              onView={handleView}
            />
          </TabsContent>
          <TabsContent value="all" className="mt-6">
            <ApprovalQueue 
              requests={getFilteredApprovals("all")} 
              onApprove={handleApprove}
              onReject={handleReject}
              onView={handleView}
            />
          </TabsContent>
        </Tabs>
      )}

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Approval Request Details
            </DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">{selectedRequest.title}</h3>
                <Badge variant="secondary" className="mt-1">
                  {selectedRequest.type}
                </Badge>
              </div>
              <p className="text-muted-foreground">{selectedRequest.description}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label>Requested By</Label>
                  <p>{selectedRequest.requestedBy}</p>
                </div>
                <div>
                  <Label>Requested At</Label>
                  <p>{new Date(selectedRequest.requestedAt).toLocaleDateString()}</p>
                </div>
                {selectedRequest.reviewedBy && (
                  <>
                    <div>
                      <Label>Reviewed By</Label>
                      <p>{selectedRequest.reviewedBy}</p>
                    </div>
                    <div>
                      <Label>Reviewed At</Label>
                      <p>{selectedRequest.reviewedAt ? new Date(selectedRequest.reviewedAt).toLocaleDateString() : "N/A"}</p>
                    </div>
                  </>
                )}
              </div>
              {selectedRequest.comments && (
                <div>
                  <Label>Comments</Label>
                  <p className="text-sm text-muted-foreground">{selectedRequest.comments}</p>
                </div>
              )}
              <div className="flex justify-end gap-2">
                {selectedRequest.status === "pending" && (
                  <>
                    <Button variant="outline" onClick={() => handleReject(selectedRequest)}>
                      Reject
                    </Button>
                    <Button onClick={() => handleApprove(selectedRequest)}>
                      Approve
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5" />
              Reject Request
            </DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">{selectedRequest?.title}</h3>
              <p className="text-sm text-muted-foreground">{selectedRequest?.description}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="comments">Comments</Label>
              <Textarea
                id="comments"
                placeholder="Provide feedback for the rejection..."
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmReject}>
                Reject Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
