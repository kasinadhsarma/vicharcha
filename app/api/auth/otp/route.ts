import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({ otp: '123456' })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phoneNumber } = body
    
    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    
    // In production, this would send the OTP via SMS
    console.log(`OTP for ${phoneNumber}: ${otp}`)
    
    return NextResponse.json({ 
      success: true,
      message: 'OTP sent successfully',
      demo: true,
      otp // Only for demo purposes
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to send OTP' },
      { status: 400 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { phoneNumber, otp } = body

    // In production, this would verify against the sent OTP
    if (otp.length === 6) {
      return NextResponse.json({ 
        success: true,
        message: 'OTP verified successfully',
        user: {
          id: '123',
          phoneNumber
        }
      })
    }

    return NextResponse.json(
      { success: false, message: 'Invalid OTP' },
      { status: 400 }
    )
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Invalid request' },
      { status: 400 }
    )
  }
}
