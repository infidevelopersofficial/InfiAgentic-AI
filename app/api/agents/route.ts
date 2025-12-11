import { type NextRequest, NextResponse } from "next/server"

const mockAgents = [
  {
    id: "agent_1",
    name: "Content Writer Agent",
    type: "content",
    status: "running",
    description: "Generates high-quality blog posts and marketing copy",
    last_run: new Date().toISOString(),
    config: { model: "gpt-4", temperature: 0.7 },
  },
  {
    id: "agent_2",
    name: "Social Media Agent",
    type: "social",
    status: "running",
    description: "Schedules and optimizes social media posts",
    last_run: new Date().toISOString(),
    config: { platforms: ["twitter", "linkedin"] },
  },
  {
    id: "agent_3",
    name: "Lead Scoring Agent",
    type: "analytics",
    status: "idle",
    description: "Evaluates and scores leads based on engagement",
    last_run: new Date(Date.now() - 86400000).toISOString(),
    config: { scoring_model: "ml-v2" },
  },
]

export async function GET() {
  return NextResponse.json({ items: mockAgents })
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  const newAgent = {
    id: "agent_" + Date.now(),
    ...body,
    status: "idle",
    created_at: new Date().toISOString(),
  }

  return NextResponse.json(newAgent, { status: 201 })
}
