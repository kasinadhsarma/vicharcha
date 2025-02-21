import { NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/cassandra"
import { v4 as uuidv4 } from "uuid"
import { createOTP, verifyOTP } from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    const { phoneNumber, username } = await req.json()

    if (!phoneNumber || !username) {
      return NextResponse.json(
        { error: "Phone number and username are required" },
        { status: 400 }
      )
    }

    // Check if username is available
    const existingUsername = await executeQuery(
      "SELECT id FROM social_network.users WHERE username = ? ALLOW FILTERING",
      [username]
    ) || { rowLength: 0, rows: [] }

    if (existingUsername.rowLength > 0) {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 409 }
      )
    }

    // Get pending user data
    const pendingUser = await executeQuery(
      "SELECT id FROM social_network.pending_users WHERE phone_number = ? ALLOW FILTERING",
      [phoneNumber]
    ) || { rowLength: 0, rows: [] }

    if (pendingUser.rowLength === 0) {
      return NextResponse.json(
        { error: "No pending registration found" },
        { status: 404 }
      )
    }

    const userId = pendingUser.rows[0].id

    // Create user with verified phone number
    await executeQuery(
      `INSERT INTO social_network.users (
        id, username, phone_number, created_at, last_active, is_verified, phone_verified
      ) VALUES (?, ?, ?, dateof(now()), dateof(now()), false, true)`,
      [userId, username, phoneNumber]
    )

    // Delete from pending users
    await executeQuery(
      "DELETE FROM social_network.pending_users WHERE id = ?",
      [userId]
    )

    // Get new user data
    const userData = await executeQuery(
      "SELECT id, username, phone_number, is_verified FROM social_network.users WHERE id = ?",
      [userId]
    ) || { rowLength: 0, rows: [{}] }

    return NextResponse.json({ 
      success: true,
      user: userData.rows[0],
      message: "Registration completed successfully" 
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Failed to complete registration" },
      { status: 500 }
    )
  }
}
