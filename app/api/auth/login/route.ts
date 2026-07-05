import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getDbConnection, inMemoryDb } from '@/lib/db'
import { signToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    let user: any = null

    const pool = await getDbConnection()
    if (pool) {
      try {
        const [rows]: any = await pool.query('SELECT * FROM users WHERE email = ?', [email])
        if (rows && rows.length > 0) {
          user = rows[0]
        }
      } catch (dbError) {
        console.error('MySQL login search failed:', dbError)
      }
    }

    // In-memory fallback if user not found in MySQL and MySQL is offline
    if (!user && !pool) {
      for (const u of inMemoryDb.users.values()) {
        if (u.email === email) {
          user = u
          break
        }
      }
    }

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash)
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    // Sign JWT
    const token = await signToken(user.id)

    // Set cookie
    const response = NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email }
    })

    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    return response
  } catch (error) {
    console.error('[Login Auth Error]:', error)
    return NextResponse.json(
      { error: `Login failed: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}
