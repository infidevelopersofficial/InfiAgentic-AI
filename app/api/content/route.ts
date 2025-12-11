import { type NextRequest, NextResponse } from "next/server"

// Mock content data
const mockContent = [
  {
    id: "content_1",
    title: "The Future of AI in Marketing",
    type: "blog",
    status: "published",
    content: "AI is transforming how we approach marketing...",
    metadata: { keywords: ["AI", "marketing"], seoScore: 92 },
    created_by: "user_1",
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-20T14:30:00Z",
    published_at: "2024-01-20T14:30:00Z",
  },
  {
    id: "content_2",
    title: "Product Launch Announcement",
    type: "email",
    status: "pending_review",
    content: "We're excited to announce...",
    metadata: { keywords: ["product", "launch"], seoScore: 78 },
    created_by: "user_1",
    created_at: "2024-01-18T09:00:00Z",
    updated_at: "2024-01-19T11:00:00Z",
  },
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status")
  const type = searchParams.get("type")
  const page = Number.parseInt(searchParams.get("page") || "1")
  const limit = Number.parseInt(searchParams.get("limit") || "10")

  let filtered = [...mockContent]

  if (status) {
    filtered = filtered.filter((c) => c.status === status)
  }
  if (type) {
    filtered = filtered.filter((c) => c.type === type)
  }

  const total = filtered.length
  const items = filtered.slice((page - 1) * limit, page * limit)

  return NextResponse.json({
    items,
    pagination: {
      page,
      limit,
      total,
      total_pages: Math.ceil(total / limit),
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, type, content, metadata } = body

    if (!title || !type || !content) {
      return NextResponse.json({ error: "Title, type, and content are required" }, { status: 400 })
    }

    const newContent = {
      id: "content_" + Date.now(),
      title,
      type,
      status: "draft",
      content,
      metadata: metadata || {},
      created_by: "user_1",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    return NextResponse.json(newContent, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
