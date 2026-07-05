import { NextRequest, NextResponse } from 'next/server'
import { generateText, gateway } from 'ai'

const INTERVIEWER_SYSTEM_PROMPT = `You are an expert technical interview coach and interviewer. Your role is to conduct a two-phase interview:

PHASE 1: HR ROUND (Questions about background, experience, and problem-solving approach)
1. Start by asking what role the candidate is applying for
2. Ask progressive questions about their experience, technical skills, and past projects
3. Provide constructive feedback after each answer
4. Follow up on interesting points they mention
5. Adapt questions based on their experience level
6. Keep responses concise (1-2 sentences) and conversational
7. After 3 HR questions are asked and answered, transition to Phase 2

PHASE 2: TECHNICAL ROUND (Code challenge evaluation)
When transitioning to Phase 2, say exactly: "Great! Now let's test your coding skills. Here is your problem:"
Then provide a short, relevant coding challenge (5-10 lines to solve) based on their role.
Do not provide the solution. Wait for the user to submit their code.

WHEN USER SUBMITS CODE:
Evaluate the solution for:
- Correctness: Does it solve the problem?
- Efficiency: Is the time/space complexity reasonable?
- Code quality: Is it clean, readable, well-structured?
- Edge cases: Are they handled?

Provide:
1. A score out of 10
2. Specific feedback on strengths and improvements
3. Ask if they'd like to end the interview or try another problem

Guidelines:
- Be encouraging and supportive while maintaining professionalism
- Be honest but kind in your feedback
- Reference specific things they've mentioned
- Help them improve, not just evaluate them`

interface MessageParam {
  role: 'user' | 'assistant'
  content: string
}

interface RequestBody {
  messages: MessageParam[]
}

// Demo responses for testing without API keys
const DEMO_RESPONSES = [
  'That\'s great! Tell me about your experience with backend systems and how you\'ve handled scaling challenges.',
  'I\'m impressed with your background. What\'s your approach to writing clean, maintainable code?',
  'Can you walk me through a challenging problem you solved recently and your problem-solving approach?',
  'That\'s excellent. How do you approach debugging complex issues in production systems?',
  'Interesting! Tell me about a time you had to work with a difficult team member and how you handled it.',
  'What are you most excited about learning in this role?',
]

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json()

    if (!body.messages || !Array.isArray(body.messages)) {
      return NextResponse.json(
        { error: 'messages array is required' },
        { status: 400 }
      )
    }

    let responseText: string

    try {
      // Try to use AI SDK's generateText with the Vercel AI Gateway
      const response = await generateText({
        model: gateway('openai/gpt-4o-mini'),
        system: INTERVIEWER_SYSTEM_PROMPT,
        messages: body.messages,
        temperature: 0.7,
      })
      responseText = response.text
    } catch (aiError) {
      console.warn('[Interview API] Falling back to demo responses:', aiError)

      // Fallback to demo responses if API is not available
      responseText = DEMO_RESPONSES[Math.floor(Math.random() * DEMO_RESPONSES.length)]
    }

    return NextResponse.json({
      reply: responseText,
    })
  } catch (error) {
    console.error('[Interview API Error]:', error)

    const errorMessage =
      error instanceof Error ? error.message : 'Internal server error'

    return NextResponse.json(
      { error: `Error: ${errorMessage}` },
      { status: 500 }
    )
  }
}
