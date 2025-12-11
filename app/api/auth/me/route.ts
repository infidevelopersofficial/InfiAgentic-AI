import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Mock user data - replace with real user lookup
  const user = {
    id: "user_1",
    email: "admin@infidevelopers.com",
    name: "Admin User",
    role: "admin",
    avatar: null,
    created_at: new Date().toISOString(),
  }

  return NextResponse.json(user)
}
