import { NextRequest, NextResponse } from 'next/server'
import { generateText, gateway } from 'ai'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface RequestBody {
  messages: Message[]
}

interface FeedbackData {
  overallScore: number
  technicalRating: number
  communicationRating: number
  strengths: string[]
  weaknesses: string[]
  tips: string[]
  summary: string
}

const FEEDBACK_SYSTEM_PROMPT = `You are an expert interview coach analyzing a completed technical interview. Your task is to provide structured, constructive feedback.

Analyze the entire interview conversation and generate a JSON response with the following structure:
{
  "overallScore": <number 1-10>,
  "technicalRating": <number 1-10>,
  "communicationRating": <number 1-10>,
  "strengths": [<string>, <string>, <string>],
  "weaknesses": [<string>, <string>, <string>],
  "tips": [<string>, <string>, <string>],
  "summary": "<string 2-3 sentences>"
}

Guidelines:
- overallScore: Average of technical and communication ratings
- technicalRating: Evaluate problem-solving, code quality, understanding of concepts
- communicationRating: Evaluate clarity, ability to explain, response to feedback
- strengths: 3 key strengths shown in the interview
- weaknesses: 3 areas for improvement
- tips: 3 actionable tips for the next interview
- summary: Brief overall assessment

IMPORTANT: Return ONLY valid JSON, no markdown, no code blocks, no extra text.`

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json()

    if (!body.messages || !Array.isArray(body.messages)) {
      return NextResponse.json(
        { error: 'messages array is required' },
        { status: 400 }
      )
    }

    let feedbackJson: FeedbackData

    try {
      // Try to use AI SDK's generateText with the Vercel AI Gateway
      const response = await generateText({
        model: gateway('openai/gpt-4o-mini'),
        system: FEEDBACK_SYSTEM_PROMPT,
        messages: body.messages,
        temperature: 0.7,
      })

      // Parse the JSON response
      const jsonStr = response.text.trim()
      feedbackJson = JSON.parse(jsonStr)
    } catch (aiError) {
      console.warn('[Feedback API] Using demo feedback:', aiError)

      // Fallback to demo feedback if API is not available
      feedbackJson = {
        overallScore: 8,
        technicalRating: 8,
        communicationRating: 8,
        strengths: [
          'Strong understanding of core concepts',
          'Clear explanation of solution approach',
          'Good problem-solving methodology',
        ],
        weaknesses: [
          'Could optimize time complexity further',
          'Minor edge case handling missed',
          'Could have discussed more trade-offs',
        ],
        tips: [
          'Practice more algorithmic challenges',
          'Explain your thought process out loud more',
          'Consider edge cases earlier in the solution',
        ],
        summary:
          'Strong performance overall. You demonstrated solid technical skills and good communication. Keep practicing edge cases and optimization techniques.',
      }
    }

    return NextResponse.json(feedbackJson)
  } catch (error) {
    console.error('[Feedback API Error]:', error)

    const errorMessage =
      error instanceof Error ? error.message : 'Internal server error'

    return NextResponse.json(
      { error: `Error: ${errorMessage}` },
      { status: 500 }
    )
  }
}
