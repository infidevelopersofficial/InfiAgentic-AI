import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Mock authentication - replace with real auth logic
    if (email === "admin@infidevelopers.com" && password === "admin123") {
      const user = {
        id: "user_1",
        email: email,
        name: "Admin User",
        role: "admin",
      }

      const token = {
        access_token: "mock_access_token_" + Date.now(),
        refresh_token: "mock_refresh_token_" + Date.now(),
        expires_in: 3600,
        token_type: "Bearer",
      }

      return NextResponse.json({
        user,
        ...token,
      })
    }

    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
