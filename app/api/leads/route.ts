import { type NextRequest, NextResponse } from "next/server"

const mockLeads = [
  {
    id: "lead_1",
    name: "John Smith",
    email: "john@acme.com",
    company: "Acme Corp",
    phone: "+1 555-0101",
    status: "new",
    score: 85,
    source: "Website",
    tags: ["enterprise"],
    created_at: new Date().toISOString(),
  },
  {
    id: "lead_2",
    name: "Sarah Johnson",
    email: "sarah@tech.io",
    company: "Tech.io",
    phone: "+1 555-0102",
    status: "contacted",
    score: 72,
    source: "LinkedIn",
    tags: ["startup"],
    created_at: new Date().toISOString(),
  },
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status")
  const source = searchParams.get("source")
  const page = Number.parseInt(searchParams.get("page") || "1")
  const limit = Number.parseInt(searchParams.get("limit") || "10")

  let filtered = [...mockLeads]

  if (status) {
    filtered = filtered.filter((l) => l.status === status)
  }
  if (source) {
    filtered = filtered.filter((l) => l.source === source)
  }

  return NextResponse.json({
    items: filtered.slice((page - 1) * limit, page * limit),
    pagination: {
      page,
      limit,
      total: filtered.length,
      total_pages: Math.ceil(filtered.length / limit),
    },
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  const newLead = {
    id: "lead_" + Date.now(),
    ...body,
    status: "new",
    score: 0,
    created_at: new Date().toISOString(),
  }

  return NextResponse.json(newLead, { status: 201 })
}
