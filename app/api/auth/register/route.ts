import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getDbConnection, inMemoryDb } from '@/lib/db'
import { signToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const pool = await getDbConnection()
    if (pool) {
      try {
        // Check if user already exists
        const [existing]: any = await pool.query('SELECT id FROM users WHERE email = ?', [email])
        if (existing && existing.length > 0) {
          return NextResponse.json({ error: 'Email is already registered' }, { status: 409 })
        }

        // Insert new user
        await pool.query(
          'INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)',
          [userId, name, email, passwordHash]
        )
      } catch (dbError: any) {
        console.error('MySQL register failed:', dbError)
        return NextResponse.json({ error: 'Database operation failed' }, { status: 500 })
      }
    } else {
      // In-memory fallback
      for (const user of inMemoryDb.users.values()) {
        if (user.email === email) {
          return NextResponse.json({ error: 'Email is already registered' }, { status: 409 })
        }
      }

      inMemoryDb.users.set(userId, {
        id: userId,
        name,
        email,
        password_hash: passwordHash,
        created_at: new Date()
      })
    }

    // Auto-login: sign JWT and set auth cookie
    const token = await signToken(userId)

    const response = NextResponse.json({
      success: true,
      user: { id: userId, name, email }
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
    console.error('[Register Auth Error]:', error)
    return NextResponse.json(
      { error: `Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}
