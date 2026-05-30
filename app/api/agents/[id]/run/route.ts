import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json().catch(() => ({}))

  const run = {
    run_id: "run_" + Date.now(),
    agent_id: id,
    status: "running",
    started_at: new Date().toISOString(),
    input: body.input || {},
  }

  return NextResponse.json(run)
}
