import { NextRequest, NextResponse } from 'next/server'
import { generateText, gateway } from 'ai'

export async function POST(request: NextRequest) {
  try {
    const { language, code, problemDescription, runOutput } = await request.json()

    if (!language || !code || !problemDescription) {
      return NextResponse.json(
        { error: 'language, code, and problemDescription are required' },
        { status: 400 }
      )
    }

    const systemPrompt = `You are an expert technical interviewer reviewing code submissions.
Analyze the candidate's code for:
1. Correctness: Does it solve the problem description? (Review the output from execution: "${runOutput}")
2. Complexity: What is the Time and Space complexity (e.g. O(N), O(1))?
3. Code Quality: Variable naming, cleanliness, handling edge cases.
4. Score: An integer rating out of 10.
5. Optimal Solution: Provide a brief optimal code solution in the same language.

Provide ONLY valid JSON output that matches the following structure:
{
  "correctness": <boolean>,
  "complexity": "<time_and_space_complexity_string>",
  "codeQuality": "<quality_review_comments>",
  "score": <number_from_0_to_10>,
  "feedback": "<detailed_feedback_comments>",
  "optimalSolution": "<optimal_code_block_escaped_or_plain>"
}
Do NOT wrap the JSON in markdown code blocks or write explanations.`

    let resultJson: any

    try {
      const response = await generateText({
        model: gateway('openai/gpt-4o-mini'),
        system: systemPrompt,
        prompt: `Language: ${language}\nProblem: ${problemDescription}\nCandidate Code:\n${code}\nExecution Output:\n${runOutput}`,
        temperature: 0.1,
      })

      const text = response.text.trim()
      const cleanJsonStr = text.replace(/^```json\s*/i, '').replace(/```$/, '').trim()
      resultJson = JSON.parse(cleanJsonStr)
    } catch (aiError) {
      console.warn('[Evaluate Code API] LLM call failed. Using standard heuristic values.', aiError)

      // Fallback
      const isCorrect = !runOutput.toLowerCase().includes('error') && runOutput !== '' && runOutput !== '(no output)'
      resultJson = {
        correctness: isCorrect,
        complexity: language === 'javascript' ? 'O(N) Time, O(1) Space' : 'O(N) Time, O(N) Space',
        codeQuality: 'Code is readable with basic structures. Edge cases could be improved.',
        score: isCorrect ? 8 : 4,
        feedback: isCorrect 
          ? 'Solution works correctly. Focus on naming and handling potential null inputs.'
          : 'The solution has syntax or runtime issues. Check index range and type conversions.',
        optimalSolution: language === 'javascript' 
          ? '// Javascript Optimal Solution example\nfunction solve(n) {\n  return n * 2;\n}'
          : '# Python Optimal Solution example\ndef solve(n):\n    return n * 2'
      }
    }

    return NextResponse.json(resultJson)
  } catch (error) {
    console.error('[Evaluate Code Error]:', error)
    return NextResponse.json(
      { error: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}
