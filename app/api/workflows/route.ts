import { type NextRequest, NextResponse } from "next/server"

const mockWorkflows = [
  {
    id: "workflow_1",
    name: "New Lead Nurture Sequence",
    description: "Automatically nurture new leads with personalized content",
    status: "active",
    trigger: { type: "event", event: "lead.created" },
    steps: [
      { id: "step_1", type: "email", config: { template: "welcome" } },
      { id: "step_2", type: "delay", config: { duration: "2d" } },
      { id: "step_3", type: "email", config: { template: "value_prop" } },
    ],
    runs: 1247,
    success_rate: 94,
    created_at: new Date().toISOString(),
  },
  {
    id: "workflow_2",
    name: "Content Publishing Pipeline",
    description: "Review, optimize, and publish content across channels",
    status: "active",
    trigger: { type: "event", event: "content.ready" },
    steps: [
      { id: "step_1", type: "agent", config: { agent: "seo_optimizer" } },
      { id: "step_2", type: "approval", config: { approvers: ["editor"] } },
      { id: "step_3", type: "action", config: { action: "publish" } },
    ],
    runs: 342,
    success_rate: 98,
    created_at: new Date().toISOString(),
  },
]

export async function GET() {
  return NextResponse.json({ items: mockWorkflows })
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  const newWorkflow = {
    id: "workflow_" + Date.now(),
    ...body,
    status: "draft",
    runs: 0,
    success_rate: 0,
    created_at: new Date().toISOString(),
  }

  return NextResponse.json(newWorkflow, { status: 201 })
}
