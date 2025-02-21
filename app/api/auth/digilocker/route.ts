import { NextRequest, NextResponse } from "next/server"

// DigiLocker OAuth2 configuration
// These would typically come from environment variables
const DIGILOCKER_CLIENT_ID = process.env.DIGILOCKER_CLIENT_ID
const DIGILOCKER_CLIENT_SECRET = process.env.DIGILOCKER_CLIENT_SECRET
const DIGILOCKER_REDIRECT_URI = process.env.DIGILOCKER_REDIRECT_URI || "http://localhost:3000/api/auth/digilocker/callback"
const DIGILOCKER_AUTH_URL = "https://api.digitallocker.gov.in/public/oauth2/1/authorize"

export async function POST(req: NextRequest) {
  try {
    if (!DIGILOCKER_CLIENT_ID) {
      throw new Error("DigiLocker client ID not configured")
    }

    const { username } = await req.json()
    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      )
    }

    // Generate state parameter to prevent CSRF
    const state = Buffer.from(JSON.stringify({
      username,
      timestamp: Date.now()
    })).toString("base64")

    // Store state in session/database for verification during callback
    // This should be implemented based on your session management approach

    // Construct DigiLocker authorization URL
    const authUrl = new URL(DIGILOCKER_AUTH_URL)
    authUrl.searchParams.set("response_type", "code")
    authUrl.searchParams.set("client_id", DIGILOCKER_CLIENT_ID)
    authUrl.searchParams.set("redirect_uri", DIGILOCKER_REDIRECT_URI)
    authUrl.searchParams.set("state", state)
    // Request specific document access if needed
    // authUrl.searchParams.set("documents", "...")

    return NextResponse.json({ redirectUrl: authUrl.toString() })
  } catch (error) {
    console.error("DigiLocker auth error:", error)
    return NextResponse.json(
      { error: "Failed to initiate DigiLocker authentication" },
      { status: 500 }
    )
  }
}

// Handle DigiLocker callback
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const code = searchParams.get("code")
    const state = searchParams.get("state")

    if (!code || !state) {
      throw new Error("Missing required parameters")
    }

    // Verify state parameter to prevent CSRF
    // This should be implemented based on your session management approach

    // Exchange authorization code for access token
    const tokenResponse = await fetch("https://api.digitallocker.gov.in/public/oauth2/1/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${DIGILOCKER_CLIENT_ID}:${DIGILOCKER_CLIENT_SECRET}`
        ).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: DIGILOCKER_REDIRECT_URI,
      }),
    })

    if (!tokenResponse.ok) {
      throw new Error("Failed to exchange code for token")
    }

    const { access_token } = await tokenResponse.json()

    // Verify user identity with DigiLocker
    const userResponse = await fetch("https://api.digitallocker.gov.in/public/oauth2/1/user", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    })

    if (!userResponse.ok) {
      throw new Error("Failed to verify user identity")
    }

    const userData = await userResponse.json()

    // Update user verification status in your database
    // This should be implemented based on your database schema

    // Redirect back to the application with success message
    return NextResponse.redirect(new URL("/?verified=true", req.url))
  } catch (error) {
    console.error("DigiLocker callback error:", error)
    return NextResponse.redirect(new URL("/?error=digilocker_verification_failed", req.url))
  }
}
