import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json().catch(() => ({}))

  const approved = {
    id,
    status: "approved",
    approved_by: "user_1",
    approved_at: new Date().toISOString(),
    comments: body.comments || null,
  }

  return NextResponse.json(approved)
}
