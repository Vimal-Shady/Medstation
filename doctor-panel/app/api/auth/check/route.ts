import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET() {
  const sessionId = cookies().get("session_id")?.value
  const userId = cookies().get("user_id")?.value

  if (!sessionId || !userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  return NextResponse.json({ authenticated: true })
}
