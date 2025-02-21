import { NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/cassandra"
import { digilocker } from "@/lib/digilocker-service"
import { ApiResponse, DatabaseResult, DBUser, DigiLockerDocument, DigiLockerAuth } from "@/lib/types"

interface DigiLockerVerifyResponse extends ApiResponse {
  verified?: boolean;
  documents?: DigiLockerDocument[];
}

export async function POST(req: NextRequest) {
  try {
    const { userId, documentId } = await req.json()

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    const isDevelopment = process.env.NODE_ENV === 'development'
    let verificationResult;

    // Get access token from headers
    const accessToken = req.headers.get('authorization')?.split(' ')[1];
    if (!accessToken) {
      return NextResponse.json(
        { error: "Authorization token is required" },
        { status: 401 }
      );
    }

    if (isDevelopment) {
      // Mock response in development
      verificationResult = {
        verified: true,
        documents: [{
          id: 'mock-doc-1',
          type: 'mock-type',
          name: 'Mock Document',
          date: new Date().toISOString(),
          issuer: 'Mock Issuer',
          uri: 'mock-uri',
          verificationStatus: 'verified' as const
        }]
      };
    } else {
      // Verify document in production
      const isVerified = await digilocker.verifyDocument(accessToken, documentId);
      const documents = await digilocker.getUserDocuments(accessToken);
      verificationResult = {
        verified: isVerified,
        documents
      };
    }

    if (verificationResult.verified) {
      // Update user's DigiLocker verification status in database
      await executeQuery(
        'UPDATE social_network.users SET digilocker_verified = ? WHERE id = ?',
        [true, userId]
      )

      // Store verified documents
      for (const doc of verificationResult.documents) {
        await executeQuery(
          `INSERT INTO social_network.digilocker_auth 
          (user_id, document_id, document_type, issuer, verification_status, verified_at)
          VALUES (?, ?, ?, ?, ?, ?)`,
          [
            userId,
            doc.id,
            doc.type,
            doc.issuer,
            doc.verificationStatus,
            new Date()
          ]
        )
      }

      return NextResponse.json({
        success: true,
        verified: true,
        documents: verificationResult.documents
      })
    }

    return NextResponse.json({
      success: false,
      verified: false,
      error: "Document verification failed"
    })

  } catch (error) {
    console.error("DigiLocker verification error:", error)
    return NextResponse.json(
      { error: "Failed to verify documents" },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    // Get user's verification status
    const result = await executeQuery(
      'SELECT digilocker_verified, username FROM social_network.users WHERE id = ?',
      [userId]
    ) as DatabaseResult

    if (!result?.rows?.length) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      )
    }

    const user = result.rows[0] as DBUser

    // Get verified documents if user is verified
    let documents: DigiLockerAuth[] = []
    if (user.digilocker_verified) {
      const docsResult = await executeQuery(
        'SELECT * FROM social_network.digilocker_auth WHERE user_id = ?',
        [userId]
      ) as DatabaseResult
      documents = (docsResult?.rows || []) as DigiLockerAuth[]
    }

    const response: DigiLockerVerifyResponse = {
      success: true,
      verified: user.digilocker_verified,
      data: {
        username: user.username,
        documents
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error("DigiLocker status check error:", error)
    return NextResponse.json(
      { error: "Failed to check verification status" },
      { status: 500 }
    )
  }
}
