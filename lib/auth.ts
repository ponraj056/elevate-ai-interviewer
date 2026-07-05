import { SignJWT, jwtVerify } from 'jose'
import { NextRequest } from 'next/server'
import { getDbConnection, inMemoryDb } from '@/lib/db'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'elevate-ai-interviewer-secret-key-12345-never-share-this'
)

export async function signToken(userId: string) {
  return await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as { userId: string }
  } catch (error) {
    return null
  }
}

export async function getUserFromRequest(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value
  if (!token) return null

  const payload = await verifyToken(token)
  if (!payload) return null

  const userId = payload.userId

  // Fetch user from DB
  const pool = await getDbConnection()
  if (pool) {
    try {
      const [rows]: any = await pool.query('SELECT id, name, email FROM users WHERE id = ?', [userId])
      if (rows && rows.length > 0) {
        return rows[0]
      }
    } catch (dbError) {
      console.error('Failed to fetch user from MySQL in auth helper:', dbError)
    }
  }
  
  // In-memory fallback if MySQL fails or isn't connected
  const user = inMemoryDb.users.get(userId)
  if (user) {
    return { id: user.id, name: user.name, email: user.email }
  }

  return null
}
