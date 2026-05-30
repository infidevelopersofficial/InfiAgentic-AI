import { type NextRequest, NextResponse } from "next/server"

const mockCampaigns = [
  {
    id: "campaign_1",
    name: "Product Launch Newsletter",
    subject: "Introducing Our Latest Feature",
    status: "active",
    audience_id: "segment_1",
    metrics: {
      sent: 15420,
      delivered: 15100,
      opened: 8234,
      clicked: 2156,
    },
    created_at: new Date().toISOString(),
  },
  {
    id: "campaign_2",
    name: "Weekly Digest",
    subject: "Your Weekly Update",
    status: "scheduled",
    audience_id: "segment_2",
    scheduled_for: new Date(Date.now() + 86400000).toISOString(),
    created_at: new Date().toISOString(),
  },
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status")

  let filtered = [...mockCampaigns]
  if (status) {
    filtered = filtered.filter((c) => c.status === status)
  }

  return NextResponse.json({ items: filtered })
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  const newCampaign = {
    id: "campaign_" + Date.now(),
    ...body,
    status: "draft",
    created_at: new Date().toISOString(),
  }

  return NextResponse.json(newCampaign, { status: 201 })
}
