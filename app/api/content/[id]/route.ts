import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // Mock content lookup
  const content = {
    id,
    title: "The Future of AI in Marketing",
    type: "blog",
    status: "published",
    content: "AI is transforming how we approach marketing...",
    metadata: { keywords: ["AI", "marketing"], seoScore: 92 },
    created_by: "user_1",
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-20T14:30:00Z",
  }

  return NextResponse.json(content)
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()

  const updated = {
    id,
    ...body,
    updated_at: new Date().toISOString(),
  }

  return NextResponse.json(updated)
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await params
  return new NextResponse(null, { status: 204 })
}
