import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
  // Clear session cookies
  cookies().delete("session_id")
  cookies().delete("user_id")

  return NextResponse.json({ message: "Logged out successfully" })
}
