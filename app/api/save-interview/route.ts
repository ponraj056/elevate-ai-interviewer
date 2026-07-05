import { NextRequest, NextResponse } from 'next/server'
import { getDbConnection, inMemoryDb } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    const userId = user ? user.id : null

    const body = await request.json()
    const {
      id,
      resumeText,
      parsedResume,
      overallScore,
      weightedBreakdown,
      summary,
      strengths,
      weaknesses,
      tips,
      communicationDetails,
      codingDetails,
      integrity,
      questions,
      qaLog,
      voiceLog,
      codingLog,
    } = body

    if (!id) {
      return NextResponse.json({ error: 'Interview ID is required' }, { status: 400 })
    }

    const db = await getDbConnection()

    if (db) {
      // 1. Insert into interviews table
      await db.query(
        `INSERT INTO interviews (
          id, user_id, resume_text, skills, projects, experience, education, 
          overall_score, weighted_breakdown, summary, strengths, 
          weaknesses, tips, communication_details, coding_details, integrity
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
          user_id = VALUES(user_id),
          resume_text = VALUES(resume_text),
          skills = VALUES(skills),
          projects = VALUES(projects),
          experience = VALUES(experience),
          education = VALUES(education),
          overall_score = VALUES(overall_score),
          weighted_breakdown = VALUES(weighted_breakdown),
          summary = VALUES(summary),
          strengths = VALUES(strengths),
          weaknesses = VALUES(weaknesses),
          tips = VALUES(tips),
          communication_details = VALUES(communication_details),
          coding_details = VALUES(coding_details),
          integrity = VALUES(integrity)`,
        [
          id,
          userId,
          resumeText || '',
          JSON.stringify(parsedResume?.skills || []),
          JSON.stringify(parsedResume?.projects || []),
          JSON.stringify(parsedResume?.experience || []),
          JSON.stringify(parsedResume?.education || []),
          overallScore || 0,
          JSON.stringify(weightedBreakdown || {}),
          summary || '',
          JSON.stringify(strengths || []),
          JSON.stringify(weaknesses || []),
          JSON.stringify(tips || []),
          JSON.stringify(communicationDetails || {}),
          JSON.stringify(codingDetails || []),
          JSON.stringify(integrity || {}),
        ]
      )

      // 2. Clear old references to allow overrides
      await db.query('DELETE FROM questions WHERE interview_id = ?', [id])
      await db.query('DELETE FROM qa_logs WHERE interview_id = ?', [id])
      await db.query('DELETE FROM voice_logs WHERE interview_id = ?', [id])
      await db.query('DELETE FROM coding_logs WHERE interview_id = ?', [id])

      // 3. Populate questions bank
      if (Array.isArray(questions) && questions.length > 0) {
        const values = questions.map((q: any) => [id, q.section, q.question, q.idealAnswer])
        await db.query(
          'INSERT INTO questions (interview_id, section, question, ideal_answer) VALUES ?',
          [values]
        )
      }

      // 4. Populate QA Logs
      if (Array.isArray(qaLog) && qaLog.length > 0) {
        const values = qaLog.map((q: any) => [
          id,
          q.section,
          q.question,
          q.userAnswer,
          q.idealAnswer,
          q.score,
          q.explanation,
        ])
        await db.query(
          'INSERT INTO qa_logs (interview_id, section, question, user_answer, ideal_answer, score, explanation) VALUES ?',
          [values]
        )
      }

      // 5. Populate Voice Logs
      if (Array.isArray(voiceLog) && voiceLog.length > 0) {
        const values = voiceLog.map((v: any) => [
          id,
          v.prompt,
          v.transcript,
          v.fluencyScore,
          v.pronunciationScore,
          v.grammarScore,
          v.structureScore,
          v.wpm,
          JSON.stringify(v.mispronouncedWords || []),
          v.feedbackText,
        ])
        await db.query(
          'INSERT INTO voice_logs (interview_id, prompt, transcript, fluency_score, pronunciation_score, grammar_score, structure_score, wpm, mispronounced_words, feedback_text) VALUES ?',
          [values]
        )
      }

      // 6. Populate Coding Logs
      if (Array.isArray(codingLog) && codingLog.length > 0) {
        const values = codingLog.map((c: any) => [
          id,
          c.problemDescription,
          c.code,
          c.runOutput,
          c.correctness,
          c.complexity,
          c.codeQuality,
          c.score,
          c.feedback,
          c.optimalSolution,
        ])
        await db.query(
          'INSERT INTO coding_logs (interview_id, problem_description, code, run_output, correctness, complexity, code_quality, score, feedback, optimal_solution) VALUES ?',
          [values]
        )
      }

      console.log(`[save-interview API] Stored successfully in MySQL for ID: ${id}`)
    } else {
      // Offline fallback to in-memory maps
      inMemoryDb.interviews.set(id, {
        id,
        user_id: userId,
        resumeText,
        skills: parsedResume?.skills || [],
        projects: parsedResume?.projects || [],
        experience: parsedResume?.experience || [],
        education: parsedResume?.education || [],
        overallScore,
        weightedBreakdown,
        summary,
        strengths,
        weaknesses,
        tips,
        communicationDetails,
        codingDetails,
        integrity,
      })

      inMemoryDb.questions.set(id, questions || [])
      inMemoryDb.qa_logs.set(id, qaLog || [])
      inMemoryDb.voice_logs.set(id, voiceLog || [])
      inMemoryDb.coding_logs.set(id, codingLog || [])

      console.log(`[save-interview API] Stored successfully in-memory for ID: ${id}`)
    }

    return NextResponse.json({ success: true, id })
  } catch (error) {
    console.error('[Save Interview Error]:', error)
    return NextResponse.json(
      { error: `Failed to save interview: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}
