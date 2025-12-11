import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const lead = {
    id,
    name: "John Smith",
    email: "john@acme.com",
    company: "Acme Corp",
    phone: "+1 555-0101",
    status: "new",
    score: 85,
    source: "Website",
    tags: ["enterprise"],
    notes: [],
    activities: [],
    created_at: new Date().toISOString(),
  }

  return NextResponse.json(lead)
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
