import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
    }
    return NextResponse.json({ user })
  } catch (error) {
    console.error('[Get Me Auth Error]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
