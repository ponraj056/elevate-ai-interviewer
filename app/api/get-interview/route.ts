import { NextRequest, NextResponse } from 'next/server'
import { getDbConnection, inMemoryDb } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const db = await getDbConnection()

    if (db) {
      // 1. Fetch interview row
      const [interviewRows]: any = await db.query('SELECT * FROM interviews WHERE id = ?', [id])
      const row = interviewRows[0]

      if (!row) {
        return NextResponse.json({ error: 'Interview report not found' }, { status: 404 })
      }

      // 2. Fetch associated tables
      const [qaRows]: any = await db.query('SELECT * FROM qa_logs WHERE interview_id = ?', [id])
      const [voiceRows]: any = await db.query('SELECT * FROM voice_logs WHERE interview_id = ?', [id])
      const [codingRows]: any = await db.query('SELECT * FROM coding_logs WHERE interview_id = ?', [id])

      // 3. Assemble JSON response structure
      const reportPayload = {
        id: row.id,
        overallScore: row.overall_score,
        weightedBreakdown: typeof row.weighted_breakdown === 'string' ? JSON.parse(row.weighted_breakdown) : row.weighted_breakdown,
        technicalRating: row.overall_score ? Math.round(row.overall_score / 10) : 8,
        communicationRating: row.overall_score ? Math.round(row.overall_score / 10) : 8,
        summary: row.summary,
        strengths: typeof row.strengths === 'string' ? JSON.parse(row.strengths) : row.strengths,
        weaknesses: typeof row.weaknesses === 'string' ? JSON.parse(row.weaknesses) : row.weaknesses,
        tips: typeof row.tips === 'string' ? JSON.parse(row.tips) : row.tips,
        communicationDetails: {
          averageWpm: row.communication_details?.averageWpm || (typeof row.communication_details === 'string' ? JSON.parse(row.communication_details).averageWpm : 130),
          fillerCount: row.communication_details?.fillerCount || (typeof row.communication_details === 'string' ? JSON.parse(row.communication_details).fillerCount : 0),
          mispronounced: row.communication_details?.mispronounced || (typeof row.communication_details === 'string' ? JSON.parse(row.communication_details).mispronounced : []),
          exercises: row.communication_details?.exercises || (typeof row.communication_details === 'string' ? JSON.parse(row.communication_details).exercises : [])
        },
        codingDetails: codingRows.map((c: any) => ({
          problem: c.problem_description.split('\n')[0],
          correctness: !!c.correctness,
          complexity: c.complexity,
          score: c.score,
          codeQuality: c.code_quality,
          optimalSolution: c.optimal_solution
        })),
        integrity: typeof row.integrity === 'string' ? JSON.parse(row.integrity) : row.integrity,
      }

      return NextResponse.json(reportPayload)
    } else {
      // Fetch from in-memory fallback database
      const interview = inMemoryDb.interviews.get(id)
      if (!interview) {
        return NextResponse.json({ error: 'Interview report not found' }, { status: 404 })
      }

      const qaLog = inMemoryDb.qa_logs.get(id) || []
      const voiceLog = inMemoryDb.voice_logs.get(id) || []
      const codingLog = inMemoryDb.coding_logs.get(id) || []

      const reportPayload = {
        id: interview.id,
        overallScore: interview.overallScore,
        weightedBreakdown: interview.weightedBreakdown,
        technicalRating: interview.technicalRating,
        communicationRating: interview.communicationRating,
        summary: interview.summary,
        strengths: interview.strengths,
        weaknesses: interview.weaknesses,
        tips: interview.tips,
        communicationDetails: interview.communicationDetails,
        codingDetails: codingLog.map((c: any) => ({
          problem: c.problemDescription.split('\n')[0],
          correctness: !!c.correctness,
          complexity: c.complexity,
          score: c.score,
          codeQuality: c.codeQuality,
          optimalSolution: c.optimalSolution
        })),
        integrity: interview.integrity,
      }

      return NextResponse.json(reportPayload)
    }
  } catch (error) {
    console.error('[Get Interview Error]:', error)
    return NextResponse.json(
      { error: `Failed to fetch report: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}
