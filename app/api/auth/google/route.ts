export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'

/**
 * /api/auth/google
 * 
 * Called after Google OAuth login to register/fetch user tier.
 * Currently returns 'free' tier as default since we don't have a database.
 * The actual tier upgrade happens through license key verification.
 * 
 * In the future, this could be connected to a database (Supabase, etc.)
 * to persist user tier information across sessions.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, avatar } = body

    if (!email?.trim()) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // For now, return free tier as default.
    // License key verification will upgrade the tier.
    return NextResponse.json({
      tier: 'free',
      email: email.trim(),
      name: name || '',
      avatar: avatar || '',
    })
  } catch (error) {
    console.error('Google auth error:', error)
    return NextResponse.json(
      { error: 'Authentication service unavailable' },
      { status: 500 }
    )
  }
}
