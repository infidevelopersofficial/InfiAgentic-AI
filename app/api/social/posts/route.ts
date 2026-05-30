import { type NextRequest, NextResponse } from "next/server"

const mockPosts = [
  {
    id: "post_1",
    platform: "twitter",
    content: "Excited to announce our new AI-powered content generator!",
    status: "published",
    published_at: new Date().toISOString(),
    metrics: { likes: 245, comments: 32, shares: 18, impressions: 12400 },
  },
  {
    id: "post_2",
    platform: "linkedin",
    content: "We're hiring! Join our team of innovative marketers.",
    status: "scheduled",
    scheduled_for: new Date(Date.now() + 7200000).toISOString(),
  },
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const platform = searchParams.get("platform")
  const status = searchParams.get("status")

  let filtered = [...mockPosts]
  if (platform) filtered = filtered.filter((p) => p.platform === platform)
  if (status) filtered = filtered.filter((p) => p.status === status)

  return NextResponse.json({ items: filtered })
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  const newPost = {
    id: "post_" + Date.now(),
    ...body,
    status: "draft",
    created_at: new Date().toISOString(),
  }

  return NextResponse.json(newPost, { status: 201 })
}
