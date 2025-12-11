"use client"

import { ApprovalQueue } from "@/components/dashboard/approval-queue"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, XCircle } from "lucide-react"
import type { ApprovalRequest } from "@/lib/types"

const mockApprovals: ApprovalRequest[] = [
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
  const pendingCount = mockApprovals.filter((a) => a.status === "pending").length
  const approvedCount = mockApprovals.filter((a) => a.status === "approved").length
  const rejectedCount = mockApprovals.filter((a) => a.status === "rejected").length

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
      <Tabs defaultValue="pending">
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
          <ApprovalQueue requests={mockApprovals.filter((a) => a.status === "pending")} />
        </TabsContent>
        <TabsContent value="approved" className="mt-6">
          <ApprovalQueue requests={mockApprovals.filter((a) => a.status === "approved")} />
        </TabsContent>
        <TabsContent value="rejected" className="mt-6">
          <ApprovalQueue requests={mockApprovals.filter((a) => a.status === "rejected")} />
        </TabsContent>
        <TabsContent value="all" className="mt-6">
          <ApprovalQueue requests={mockApprovals} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
