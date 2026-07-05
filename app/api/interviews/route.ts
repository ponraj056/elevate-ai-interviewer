import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { getDbConnection, inMemoryDb } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
    }

    const pool = await getDbConnection()
    if (pool) {
      try {
        const [rows]: any = await pool.query(
          'SELECT id, overall_score, summary, created_at FROM interviews WHERE user_id = ? ORDER BY created_at DESC',
          [user.id]
        )
        return NextResponse.json({ interviews: rows })
      } catch (dbError) {
        console.error('MySQL select interviews failed:', dbError)
        return NextResponse.json({ error: 'Database query failed' }, { status: 500 })
      }
    } else {
      // In-memory fallback
      const list: any[] = []
      for (const item of inMemoryDb.interviews.values()) {
        if (item.user_id === user.id) {
          list.push({
            id: item.id,
            overall_score: item.overallScore || 0,
            summary: item.summary || '',
            created_at: item.created_at || new Date().toISOString()
          })
        }
      }
      // Sort list by created_at desc
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      return NextResponse.json({ interviews: list })
    }
  } catch (error) {
    console.error('[Get Interviews Error]:', error)
    return NextResponse.json({ error: 'Failed to fetch interviews' }, { status: 500 })
  }
}
