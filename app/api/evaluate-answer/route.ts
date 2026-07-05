import { NextRequest, NextResponse } from 'next/server'
import { generateText, gateway } from 'ai'

export async function POST(request: NextRequest) {
  try {
    const { question, answer, idealAnswer } = await request.json()

    if (!question || !answer || !idealAnswer) {
      return NextResponse.json(
        { error: 'question, answer, and idealAnswer are required' },
        { status: 400 }
      )
    }

    const systemPrompt = `You are an AI interviewer evaluator. Compare the candidate's answer with the ideal/model answer for the given question.
Evaluate correctness on a scale of 0 to 2:
- 0: Completely incorrect, irrelevant, or empty answer.
- 1: Partially correct or incomplete (misses key concepts).
- 2: Correct and robust (covers main points, matches the ideal answer).

Provide ONLY valid JSON output that matches the following structure:
{
  "score": <0, 1, or 2>,
  "verdict": "<verdict_string>",
  "explanation": "<explanation_why_wrong_or_partial_or_correct>"
}

Rules for verdict_string:
- If score is 2 → "Correct" or "Good answer" (1 line max)
- If score is 1 → "That's partially correct"
- If score is 0 → "That answer is incorrect"

The explanation should explain what was missing or incorrect compared to the ideal answer in 2-3 sentences.
Do NOT wrap the JSON in markdown formatting or write any explanations.`

    let resultJson: any

    try {
      const response = await generateText({
        model: gateway('openai/gpt-4o-mini'),
        system: systemPrompt,
        prompt: `Question: ${question}\nCandidate's Answer: ${answer}\nIdeal Answer: ${idealAnswer}`,
        temperature: 0.1,
      })

      const text = response.text.trim()
      const cleanJsonStr = text.replace(/^```json\s*/i, '').replace(/```$/, '').trim()
      resultJson = JSON.parse(cleanJsonStr)
    } catch (aiError) {
      console.warn('[Evaluate Answer API] LLM evaluation failed. Falling back to heuristic match.', aiError)

      // Heuristic fallback matching keywords
      const cleanedAnswer = answer.toLowerCase()
      const idealKeywords = idealAnswer.toLowerCase().split(/\s+/).filter((w: string) => w.length > 4)
      let matches = 0
      for (const word of idealKeywords) {
        if (cleanedAnswer.includes(word)) {
          matches++
        }
      }

      const matchRatio = idealKeywords.length > 0 ? matches / idealKeywords.length : 0
      let score = 0
      let verdict = 'That answer is incorrect'
      let explanation = 'The answer does not seem to address the core requirements of the question.'

      if (cleanedAnswer.length < 5) {
        score = 0
        verdict = 'That answer is incorrect'
        explanation = 'The candidate did not provide an answer.'
      } else if (matchRatio > 0.4) {
        score = 2
        verdict = 'Good answer'
        explanation = 'Your answer covers the essential components and matches the model response.'
      } else if (matchRatio > 0.1 || cleanedAnswer.length > 20) {
        score = 1
        verdict = "That's partially correct"
        explanation = 'Your response touches on the topic but misses key technical specifics of the ideal answer.'
      }

      resultJson = {
        score,
        verdict,
        explanation
      }
    }

    return NextResponse.json(resultJson)
  } catch (error) {
    console.error('[Evaluate Answer Error]:', error)
    return NextResponse.json(
      { error: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}
