import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const agent = {
    id,
    name: "Content Writer Agent",
    type: "content",
    status: "running",
    description: "Generates high-quality blog posts and marketing copy",
    last_run: new Date().toISOString(),
    config: { model: "gpt-4", temperature: 0.7 },
    metrics: {
      tasks_completed: 247,
      success_rate: 98.5,
      avg_response_time: 1.2,
    },
  }

  return NextResponse.json(agent)
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()

  return NextResponse.json({
    id,
    ...body,
    updated_at: new Date().toISOString(),
  })
}
