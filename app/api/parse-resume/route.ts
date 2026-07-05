import { NextRequest, NextResponse } from 'next/server'
import { generateText, gateway } from 'ai'
import { generateDynamicData } from '@/lib/dynamic-question-generator'

export async function POST(request: NextRequest) {
  try {
    const { resumeText } = await request.json()

    if (!resumeText || typeof resumeText !== 'string') {
      return NextResponse.json(
        { error: 'resumeText string is required' },
        { status: 400 }
      )
    }

    const systemPrompt = `You are an AI resume parser and interviewer setup agent. Analyze the provided resume text and generate:
1. Structured details: skills (languages, frameworks, tools), projects (name, tech stack, key features), experience (internships, roles), education (degree, batch, college).
2. A customized Question Bank specifically tailored for this candidate. Do NOT generate generic questions when you can frame specific ones based on their actual projects, skills, or experience.
The Question Bank MUST contain:
- technical_fundamentals (10 questions covering DSA, OOP, DBMS, OS, Networks calibrated to their branch/skills)
- skills_deep_dive (10 questions on frameworks, tools, or languages mentioned in their resume)
- project_deep_dive (at least 1 architectural/challenge question per major project listed in their resume)
- behavioral_hr (5 questions about teamwork, conflicts, why-this-role, etc.)

Each question in the Question Bank must have:
- question: The text of the question
- section: one of 'technical_fundamentals', 'skills_deep_dive', 'project_deep_dive', 'behavioral_hr'
- idealAnswer: A concise 2-3 sentence description of what a perfect answer contains

Provide ONLY valid JSON output that matches the following structure:
{
  "skills": ["React", "Node.js", ...],
  "projects": [{"name": "StudentVault", "techStack": ["Next.js", "MongoDB"], "description": "..."}],
  "experience": ["Software Engineer Intern at XYZ"],
  "education": ["B.Tech in Computer Science, ABC College"],
  "questionBank": {
    "technical_fundamentals": [
      { "question": "...", "section": "technical_fundamentals", "idealAnswer": "..." }
    ],
    "skills_deep_dive": [
      { "question": "...", "section": "skills_deep_dive", "idealAnswer": "..." }
    ],
    "project_deep_dive": [
      { "question": "...", "section": "project_deep_dive", "idealAnswer": "..." }
    ],
    "behavioral_hr": [
      { "question": "...", "section": "behavioral_hr", "idealAnswer": "..." }
    ]
  }
}
Do NOT wrap the JSON in markdown formatting or write any explanations.`

    let resultJson: any

    try {
      const response = await generateText({
        model: gateway('openai/gpt-4o-mini'),
        system: systemPrompt,
        prompt: `Resume Content:\n${resumeText}`,
        temperature: 0.2,
      })

      const text = response.text.trim()
      // Strip markdown code fences if LLM accidentally outputted them
      const cleanJsonStr = text.replace(/^```json\s*/i, '').replace(/```$/, '').trim()
      resultJson = JSON.parse(cleanJsonStr)
    } catch (aiError) {
      console.warn('[Parse Resume API] LLM call failed or returned invalid JSON. Using dynamic parser fallback.', aiError)
      resultJson = generateDynamicData(resumeText)
    }

    return NextResponse.json(resultJson)
  } catch (error) {
    console.error('[Parse Resume Error]:', error)
    return NextResponse.json(
      { error: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}
