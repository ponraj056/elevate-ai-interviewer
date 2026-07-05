'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send,
  Mic,
  Square,
  LogOut,
  Shield,
  FileText,
  Play,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Code,
  Volume2,
  Sparkles,
  RefreshCw,
  Maximize,
  Monitor,
  Lock,
  MessageSquare,
  AlertCircle,
  Upload,
  LayoutDashboard,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { FloatingLeaves } from '@/components/floating-leaves'
import { AnimatedBackground } from '@/components/animated-background'
import { ChatMessage } from '@/components/chat-message'
import { ThemeToggle } from '@/components/theme-toggle'
import { CodeEditor, EditorLanguage } from '@/components/code-editor'
import { FeedbackReport } from '@/components/feedback-report'
import { TypingIndicator } from '@/components/typing-indicator'
import { useSpeech } from '@/hooks/useSpeech'
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis'
import { useProctoring } from '@/hooks/useProctoring'
import { ProctoringOverlay } from '@/components/proctoring-overlay'

// ----------------------------------------------------
// Core Types & Constants
// ----------------------------------------------------
type InterviewPhase =
  | 'DASHBOARD'
  | 'SETUP'            // Proctoring permissions & configuration
  | 'PHASE_0_RESUME'   // Resume input and parsing
  | 'PHASE_1_QA'       // Progressive 20 questions
  | 'PHASE_2_VOICE'    // 5 JAM voice communication questions
  | 'PHASE_3_CODING'   // 2 coding challenges
  | 'PHASE_4_FEEDBACK' // Incorrect/partial answers walkthrough
  | 'COMPLETED_REPORT' // Final detailed assessment report

interface Message {
  id: string
  content: string
  isUser: boolean
  verdict?: 'Correct' | 'Partial' | 'Incorrect'
}

interface QALogItem {
  section: 'technical_fundamentals' | 'skills_deep_dive' | 'project_deep_dive' | 'behavioral_hr'
  question: string
  userAnswer: string
  idealAnswer: string
  score: number // 0, 1, 2
  explanation: string
}

interface VoiceLogItem {
  prompt: string
  transcript: string
  fluencyScore: number
  pronunciationScore: number
  grammarScore: number
  structureScore: number
  wpm: number
  mispronouncedWords: string[]
  feedbackText: string
}

interface CodingLogItem {
  problemDescription: string
  code: string
  runOutput: string
  correctness: boolean
  complexity: string
  codeQuality: string
  score: number // 0-10
  feedback: string
  optimalSolution: string
}

const SAMPLE_RESUMES = {
  frontend: `John Doe
johndoe@email.com | +1 555-0199 | San Francisco, CA
GitHub: github.com/johndoe | LinkedIn: linkedin.com/in/johndoe

EDUCATION
B.Tech in Computer Science & Engineering | ABC Institute of Technology | Batch of 2026
GPA: 9.1/10

TECHNICAL SKILLS
Languages: JavaScript (ES6+), TypeScript, HTML5, CSS3, SQL
Frameworks & Libraries: React.js, Next.js, TailwindCSS, Redux Toolkit, Framer Motion
Tools & Databases: Git, Node.js, Express, PostgreSQL, MongoDB, Vite, Vercel

PROJECTS
1. StudentVault | React, TailwindCSS, Next.js, MongoDB
- Developed a secure digital repository for students to store and organize study resources.
- Integrated Groq API for semantic search queries, handling rate-limiting through exponential backoff.
- Implemented state management using Redux Toolkit, reducing page load times by 25%.

2. DevComm: Realtime Developer Forum | Next.js, TailwindCSS, Socket.io
- Built a realtime developer discussion forum supporting channels, markdown code snippets, and active users tracking.
- Optimized Socket.io connections in client-side useEffect cleanup hook to avoid memory leaks.

EXPERIENCE
Software Engineer Intern | InnovateTech Labs | June 2025 - August 2025
- Contributed to frontend codebase of customer service portal using Next.js.
- Worked in Agile environment, collaborating with designers to implement custom theme systems.`,

  backend: `Jane Smith
janesmith@email.com | +1 555-0144 | Seattle, WA
GitHub: github.com/janesmith | LinkedIn: linkedin.com/in/janesmith

EDUCATION
B.Tech in Information Technology | XYZ University | Batch of 2026
GPA: 8.8/10

TECHNICAL SKILLS
Languages: Python, Go, Java, SQL, Bash
Frameworks: Django, FastAPI, Spring Boot, Pytest
Databases & Cloud: PostgreSQL, Redis, Docker, AWS (S3, EC2), Git

PROJECTS
1. FileDistribute: Distributed File Sync | Python, Go, Docker
- Built a distributed file syncing service that synchronizes files across multiple nodes.
- Implemented a custom consensus mechanism inspired by Raft to coordinate active node health.
- Optimized sync speeds using concurrent execution pools in Go.

2. HealthApi: FastAPI Health Management Portal | FastAPI, PostgreSQL, Redis
- Engineered high-performance backend API for processing patient telemetry records.
- Configured Redis caching layers, reducing average read response times from 350ms to 24ms.`
}

const CODING_PROBLEMS = [
  {
    title: 'Coding Problem 1: Reverse String (Easy)',
    description: 'Write a program or function that takes a string `s` and returns its reverse. Example: `"hello"` should return `"olleh"`. Ensure you print or return the result.',
    templates: {
      javascript: `function reverseString(s) {\n  // Write your code here\n  return s.split("").reverse().join("");\n}\n\nconsole.log(reverseString("hello"));`,
      python: `def reverse_string(s):\n    # Write your code here\n    return s[::-1]\n\nprint(reverse_string("hello"))`,
      c: `#include <stdio.h>\n#include <string.h>\n\nvoid reverse_string(char *s) {\n    int len = strlen(s);\n    for (int i = 0; i < len / 2; i++) {\n        char temp = s[i];\n        s[i] = s[len - i - 1];\n        s[len - i - 1] = temp;\n    }\n}\n\nint main() {\n    char str[] = "hello";\n    reverse_string(str);\n    printf("%s\\n", str);\n    return 0;\n}`,
      cpp: `#include <iostream>\n#include <string>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    string s = "hello";\n    reverse(s.begin(), s.end());\n    cout << s << endl;\n    return 0;\n}`,
      csharp: `using System;\n\npublic class Program {\n    public static void Main() {\n        string s = "hello";\n        char[] arr = s.ToCharArray();\n        Array.Reverse(arr);\n        Console.WriteLine(new string(arr));\n    }\n}`,
      java: `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        String s = "hello";\n        StringBuilder sb = new StringBuilder(s);\n        System.out.println(sb.reverse().toString());\n    }\n}`
    }
  },
  {
    title: 'Coding Problem 2: Two Sum (Medium)',
    description: 'Write a program or function that finds two numbers in a list/array that add up to a target value, returning their indices. Example: For array `[2, 7, 11, 15]` and target `9`, the indices are `[0, 1]`.',
    templates: {
      javascript: `function twoSum(nums, target) {\n  // Write your code here\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}\n\nconsole.log(twoSum([2, 7, 11, 15], 9));`,
      python: `def two_sum(nums, target):\n    # Write your code here\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i\n    return []\n\nprint(two_sum([2, 7, 11, 15], 9))`,
      c: `#include <stdio.h>\n\nint main() {\n    int nums[] = {2, 7, 11, 15};\n    int target = 9;\n    // Write your code here\n    printf("[0, 1]\\n");\n    return 0;\n}`,
      cpp: `#include <iostream>\n#include <vector>\n#include <unordered_map>\nusing namespace std;\n\nvector<int> twoSum(vector<int>& nums, int target) {\n    unordered_map<int, int> seen;\n    for (int i = 0; i < nums.size(); ++i) {\n        int complement = target - nums[i];\n        if (seen.count(complement)) {\n            return {seen[complement], i};\n        }\n        seen[nums[i]] = i;\n    }\n    return {};\n}\n\nint main() {\n    vector<int> nums = {2, 7, 11, 15};\n    vector<int> res = twoSum(nums, 9);\n    if (res.size() == 2) {\n        cout << "[" << res[0] << ", " << res[1] << "]" << endl;\n    }\n    return 0;\n}`,
      csharp: `using System;\nusing System.Collections.Generic;\n\npublic class Program {\n    public static void Main() {\n        int[] nums = {2, 7, 11, 15};\n        int target = 9;\n        // Write your code here\n        Console.WriteLine("[0, 1]");\n    }\n}`,
      java: `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        int[] nums = {2, 7, 11, 15};\n        int target = 9;\n        // Write your code here\n        System.out.println("[0, 1]");\n    }\n}`
    }
  }
]

export default function Home() {
  const router = useRouter()
  const [phase, setPhase] = useState<InterviewPhase>('DASHBOARD')
  const [user, setUser] = useState<any>(null)
  const [interviews, setInterviews] = useState<any[]>([])
  const [isDashboardLoading, setIsDashboardLoading] = useState(true)

  // Check auth and load interviews
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => {
        if (!res.ok) {
          router.push('/login')
          return null
        }
        return res.json()
      })
      .then((data) => {
        if (!data) return
        setUser(data.user)
        fetch('/api/interviews')
          .then((res) => {
            if (res && res.ok) return res.json()
            return { interviews: [] }
          })
          .then((data) => {
            if (data) {
              setInterviews(data.interviews || [])
            }
          })
          .catch((err) => {
            console.error('Failed to load interviews:', err)
          })
      })
      .catch((err) => {
        console.error('Dashboard load failed:', err)
      })
      .finally(() => {
        setIsDashboardLoading(false)
      })
  }, [router])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
      router.refresh()
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }

  const handleViewReport = async (id: string) => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/get-interview?id=${id}`)
      if (!res.ok) throw new Error('Report not found')
      const data = await res.json()
      setFeedbackReportData(data)
      setPhase('COMPLETED_REPORT')
    } catch (err) {
      console.error(err)
      alert('Could not retrieve this interview report.')
    } finally {
      setIsLoading(false)
    }
  }
  
  // Resume & parsing states
  const [resumeText, setResumeText] = useState('')
  const [fileName, setFileName] = useState<string | null>(null)
  const [parsedData, setParsedData] = useState<any>(null)
  const [isParsing, setIsParsing] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const [questionBank, setQuestionBank] = useState<any>(null)
  const [interviewId, setInterviewId] = useState<string>('')

  // Load report from URL parameter if present
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const reportId = params.get('reportId')
    
    if (reportId) {
      setIsLoading(true)
      fetch(`/api/get-interview?id=${reportId}`)
        .then((res) => {
          if (!res.ok) throw new Error('Report not found')
          return res.json()
        })
        .then((data) => {
          setFeedbackReportData(data)
          setPhase('COMPLETED_REPORT')
        })
        .catch((err) => {
          console.error(err)
          alert('Could not retrieve the shared mock interview report.')
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }, [])

  // Proctoring states
  const proctoring = useProctoring()
  const [devBypass, setDevBypass] = useState(false)

  // Chat states (Phase 1)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [qaIndex, setQaIndex] = useState(0)
  const [qaSequence, setQaSequence] = useState<any[]>([])
  const [qaLog, setQaLog] = useState<QALogItem[]>([])

  // Configuration states
  const [qaQuestionCount, setQaQuestionCount] = useState<number>(10)
  
  // Timer states for Phase 1 (Technical/Aptitude)
  const [qaTimeRemaining, setQaTimeRemaining] = useState<number>(60)
  const [isQaTimerActive, setIsQaTimerActive] = useState<boolean>(false)
  const qaTimerRef = useRef<NodeJS.Timeout | null>(null)

  const [isVoicePrepTimerActive, setIsVoicePrepTimerActive] = useState(false)
  const [isVoiceSpeakTimerActive, setIsVoiceSpeakTimerActive] = useState(false)

  // Voice States (Phase 2)
  const [voiceIndex, setVoiceIndex] = useState(0)
  const [voicePrompts, setVoicePrompts] = useState<string[]>([])
  const [voicePrepTime, setVoicePrepTime] = useState(45)
  const [voiceSpeakTime, setVoiceSpeakTime] = useState(120)
  const [isSpeakingActive, setIsSpeakingActive] = useState(false)
  const [isPrepActive, setIsPrepActive] = useState(false)
  const [voiceLog, setVoiceLog] = useState<VoiceLogItem[]>([])
  const [tempVoiceTranscript, setTempVoiceTranscript] = useState('')
  const [wordConfidenceList, setWordConfidenceList] = useState<{ word: string; confidence: number }[]>([])
  const [isVoiceEvaluating, setIsVoiceEvaluating] = useState(false)
  const [latestVoiceFeedback, setLatestVoiceFeedback] = useState<string | null>(null)

  // Coding States (Phase 3)
  const [codingIndex, setCodingIndex] = useState(0)
  const [codingProblems, setCodingProblems] = useState<any[]>([])
  const [userCode, setUserCode] = useState('')
  const [codeLanguage, setCodeLanguage] = useState<EditorLanguage>('javascript')
  const [codingLog, setCodingLog] = useState<CodingLogItem[]>([])
  const [codingFeedback, setCodingFeedback] = useState<any>(null)
  const [isCodingEvaluating, setIsCodingEvaluating] = useState(false)

  // Walkthrough Feedback States (Phase 4 Part A)
  const [walkthroughIndex, setWalkthroughIndex] = useState(0)
  const [failedQuestions, setFailedQuestions] = useState<any[]>([])

  // Final Feedback data (Phase 4 Part B)
  const [feedbackReportData, setFeedbackReportData] = useState<any>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Voice recognition & speech synthesis hooks
  const {
    isListening,
    transcript,
    wordConfidences: speechWordConfidences,
    startListening,
    stopListening,
    resetTranscript,
    isSupported: isSpeechSupported,
    error: speechError,
    hasMicPermission,
    requestMicPermission,
  } = useSpeech()
  
  const { speak, stop: stopSpeaking } = useSpeechSynthesis()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Track speech to text real-time transcript updates
  useEffect(() => {
    if (phase === 'PHASE_2_VOICE' && isListening) {
      setTempVoiceTranscript(transcript)
      // Use real word confidence scores from the SpeechRecognition API
      setWordConfidenceList(speechWordConfidences)
    }
  }, [transcript, isListening, phase, speechWordConfidences])

  // Monitor proctoring violations and automatically disqualify if limits exceeded
  const handleDisqualification = useCallback((reason: string) => {
    console.warn('[Proctoring Violation] Disqualifying candidate:', reason)
    
    // 1. Stop proctoring immediately to release locks
    proctoring.stopProctoring()

    // 2. Compile current logs to show partial data
    const qaFundamentals = qaLog.filter(item => item.section === 'technical_fundamentals')
    const qaSkills = qaLog.filter(item => item.section === 'skills_deep_dive')
    const qaProjects = qaLog.filter(item => item.section === 'project_deep_dive')
    const qaHr = qaLog.filter(item => item.section === 'behavioral_hr')

    const getAverageScorePercent = (list: QALogItem[]) => {
      if (list.length === 0) return 0
      const total = list.reduce((acc, item) => acc + item.score, 0)
      return (total / (list.length * 2)) * 100
    }

    const technicalScore = getAverageScorePercent([...qaFundamentals, ...qaSkills])
    const projectScore = getAverageScorePercent(qaProjects)
    const hrScore = getAverageScorePercent(qaHr)

    const avgVoiceScore = voiceLog.length > 0
      ? voiceLog.reduce((acc, item) => acc + (item.fluencyScore + item.pronunciationScore + item.grammarScore + item.structureScore) / 4, 0) / voiceLog.length
      : 0

    const avgCodingScore = codingLog.length > 0
      ? (codingLog.reduce((acc, item) => acc + item.score, 0) / codingLog.length) * 10
      : 0

    const reportPayload = {
      overallScore: 0,
      weightedBreakdown: {
        technical: Math.round(technicalScore),
        project: Math.round(projectScore),
        hr: Math.round(hrScore),
        communication: Math.round(avgVoiceScore),
        coding: Math.round(avgCodingScore)
      },
      technicalRating: 0,
      communicationRating: 0,
      summary: `This interview assessment was automatically terminated and disqualified due to integrity violations: ${reason}`,
      strengths: ['None (Disqualified)'],
      weaknesses: [`Integrity Violation: ${reason}`],
      tips: [
        'Ensure you remain in fullscreen mode and avoid changing tabs during proctored assessments.',
        'Close other applications and browser tabs before beginning the interview.'
      ],
      communicationDetails: {
        averageWpm: voiceLog.length > 0 ? Math.round(voiceLog.reduce((acc, item) => acc + item.wpm, 0) / voiceLog.length) : 0,
        fillerCount: voiceLog.reduce((acc, item) => {
          const words = item.transcript.split(/\s+/)
          const fillers = ['um', 'uh', 'like', 'you know', 'so', 'actually', 'basically']
          return acc + words.filter(w => fillers.includes(w.toLowerCase())).length
        }, 0),
        mispronounced: Array.from(new Set(voiceLog.flatMap(item => item.mispronouncedWords))),
        exercises: [
          'Familiarize yourself with proctoring rules before starting any assessment.'
        ]
      },
      codingDetails: codingLog.map(item => ({
        problem: item.problemDescription.split('\n')[0],
        correctness: item.correctness,
        complexity: item.complexity,
        score: item.score,
        codeQuality: item.codeQuality,
        optimalSolution: item.optimalSolution
      })),
      integrity: {
        fullscreenExits: proctoring.fullscreenExits,
        tabSwitches: proctoring.tabSwitches,
        totalTimeAway: proctoring.totalTimeAway,
        screenShareContinuity: proctoring.screenShareContinuity,
        screenShareDisconnections: proctoring.screenShareDisconnections,
        disqualified: true,
        disqualificationReason: reason
      }
    }

    const finalReport = {
      id: interviewId,
      ...reportPayload
    }

    // Save disqualified interview to MySQL
    fetch('/api/save-interview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: interviewId,
        resumeText,
        parsedResume: parsedData,
        overallScore: 0,
        weightedBreakdown: reportPayload.weightedBreakdown,
        summary: reportPayload.summary,
        strengths: reportPayload.strengths,
        weaknesses: reportPayload.weaknesses,
        tips: reportPayload.tips,
        communicationDetails: reportPayload.communicationDetails,
        codingDetails: reportPayload.codingDetails,
        integrity: reportPayload.integrity,
        questions: qaSequence,
        qaLog,
        voiceLog,
        codingLog
      })
    })
    .then((res) => res.json())
    .then((data) => {
      console.log('[MySQL] Saved disqualified session:', data.id)
    })
    .catch((err) => {
      console.error('[MySQL] Failed to save disqualified session:', err)
    })

    setFeedbackReportData(finalReport)
    setPhase('COMPLETED_REPORT')
  }, [
    proctoring,
    qaLog,
    voiceLog,
    codingLog,
    interviewId,
    resumeText,
    parsedData,
    qaSequence
  ])

  useEffect(() => {
    if (devBypass) return
    const isTestActive = ['PHASE_1_QA', 'PHASE_2_VOICE', 'PHASE_3_CODING'].includes(phase)
    if (isTestActive) {
      if (proctoring.tabSwitches > 2) {
        handleDisqualification('Multiple tab switching violations (exceeded 2 tab switches).')
      } else if (proctoring.fullscreenExits > 3) {
        handleDisqualification('Multiple fullscreen exit violations (exceeded 3 exits).')
      } else if (proctoring.screenShareDisconnections > 3) {
        handleDisqualification('Multiple screen share disconnection violations (exceeded 3 disconnects).')
      }
    }
  }, [proctoring.tabSwitches, proctoring.fullscreenExits, proctoring.screenShareDisconnections, phase, handleDisqualification, devBypass])

  // QA Timer Countdown Effect
  useEffect(() => {
    if (phase === 'PHASE_1_QA' && isQaTimerActive && qaTimeRemaining > 0 && !isLoading && !proctoring.isPaused) {
      qaTimerRef.current = setTimeout(() => {
        setQaTimeRemaining((prev) => prev - 1)
      }, 1000)
    } else if (phase === 'PHASE_1_QA' && isQaTimerActive && qaTimeRemaining === 0 && !isLoading && !proctoring.isPaused) {
      console.log(`[Timer Expired] Auto-submitting response for QA question ${qaIndex + 1}`)
      handleSendQAAnswer(undefined, input.trim() || 'Unanswered')
    }

    return () => {
      if (qaTimerRef.current) clearTimeout(qaTimerRef.current)
    }
  }, [phase, isQaTimerActive, qaTimeRemaining, qaIndex, input, isLoading, proctoring.isPaused])

  // Voice Prep Timer countdown effect
  useEffect(() => {
    let t: NodeJS.Timeout | null = null
    if (phase === 'PHASE_2_VOICE' && isVoicePrepTimerActive && voicePrepTime > 0 && !proctoring.isPaused) {
      t = setTimeout(() => {
        setVoicePrepTime((prev) => prev - 1)
      }, 1000)
    } else if (phase === 'PHASE_2_VOICE' && isVoicePrepTimerActive && voicePrepTime === 0 && !proctoring.isPaused) {
      setIsVoicePrepTimerActive(false)
      startSpeakingTimer()
    }
    return () => {
      if (t) clearTimeout(t)
    }
  }, [phase, isVoicePrepTimerActive, voicePrepTime, proctoring.isPaused])

  // Voice Speaking Timer countdown effect
  useEffect(() => {
    let t: NodeJS.Timeout | null = null
    if (phase === 'PHASE_2_VOICE' && isVoiceSpeakTimerActive && voiceSpeakTime > 0 && !proctoring.isPaused) {
      t = setTimeout(() => {
        setVoiceSpeakTime((prev) => prev - 1)
      }, 1000)
    } else if (phase === 'PHASE_2_VOICE' && isVoiceSpeakTimerActive && voiceSpeakTime === 0 && !proctoring.isPaused) {
      setIsVoiceSpeakTimerActive(false)
      handleEvaluateSpeech()
    }
    return () => {
      if (t) clearTimeout(t)
    }
  }, [phase, isVoiceSpeakTimerActive, voiceSpeakTime, proctoring.isPaused])

  // Speech Recognition listener toggle based on pause state
  useEffect(() => {
    if (phase === 'PHASE_2_VOICE' && isSpeakingActive) {
      if (proctoring.isPaused) {
        stopListening()
      } else {
        if (isSpeechSupported) {
          startListening()
        }
      }
    }
  }, [phase, isSpeakingActive, proctoring.isPaused, isSpeechSupported])

  // ----------------------------------------------------
  // Phase 0: Resume Intake & Parsing
  // ----------------------------------------------------
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setIsExtracting(true)
    setResumeText('Extracting text content from file, please wait...')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/extract-text', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to extract text')
      }

      const data = await response.json()
      setResumeText(data.text)
    } catch (err) {
      console.error(err)
      alert(`Text extraction failed: ${err instanceof Error ? err.message : 'Unknown error'}. You can still paste your resume text manually.`)
      setResumeText('')
      setFileName(null)
    } finally {
      setIsExtracting(false)
    }
  }

  const handleParseResume = async () => {
    if (!resumeText.trim()) return
    setIsParsing(true)
    try {
      const response = await fetch('/api/parse-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText })
      })
      if (!response.ok) throw new Error('Parsing failed')
      const data = await response.json()
      setParsedData({
        skills: data.skills || [],
        projects: data.projects || [],
        experience: data.experience || [],
        education: data.education || []
      })
      setQuestionBank(data.questionBank)

      // Create sequence of questions (20 total):
      // - 8 technical fundamentals
      // - 6 skills deep dive
      // - 3 project deep dive
      // - 3 behavioral hr
      const fundamentals = (data.questionBank.technical_fundamentals || []).slice(0, 8)
      const skills = (data.questionBank.skills_deep_dive || []).slice(0, 6)
      const projects = (data.questionBank.project_deep_dive || []).slice(0, 3)
      const hr = (data.questionBank.behavioral_hr || []).slice(0, 3)

      setQaSequence([...fundamentals, ...skills, ...projects, ...hr])

      // Auto-detect code language preference
      const isPythonPreferred = /python/i.test(resumeText)
      setCodeLanguage(isPythonPreferred ? 'python' : 'javascript')

      // Set up voice Prompts
      const defaultPrompts = [
        `Walk me through your most significant technical project in 2 minutes. Explain the architectural choices.`,
        `Describe a scenario where you had to adapt to a new developer framework or API in under a week.`,
        `Just A Minute: Explain the core concepts of asynchronous execution vs synchronous threading.`,
        `How do you handle team disagreements regarding software design patterns or code styles?`,
        `Discuss what interests you most about cloud architecture and distributed scale systems.`
      ]
      setVoicePrompts(defaultPrompts)

    } catch (err) {
      console.error(err)
      alert('Error parsing resume. Please try again.')
    } finally {
      setIsParsing(false)
    }
  }

  const handleStartInterview = async () => {
    if (!questionBank) {
      alert('Question bank is not generated yet. Please parse a resume first.')
      return
    }

    // Start proctoring checks
    try {
      if (!devBypass) {
        await proctoring.startProctoring()
      }

      // Proportional distribution logic
      const totalRequested = qaQuestionCount
      const poolFundamentals = [...(questionBank.technical_fundamentals || [])]
      const poolSkills = [...(questionBank.skills_deep_dive || [])]
      const poolProjects = [...(questionBank.project_deep_dive || [])]
      const poolHr = [...(questionBank.behavioral_hr || [])]

      const countFundamentals = Math.max(1, Math.round(totalRequested * 0.40))
      const countSkills = Math.max(1, Math.round(totalRequested * 0.30))
      const countProjects = Math.max(1, Math.round(totalRequested * 0.15))
      const countHr = Math.max(1, totalRequested - (countFundamentals + countSkills + countProjects))

      const fundamentals = poolFundamentals.slice(0, countFundamentals)
      const skills = poolSkills.slice(0, countSkills)
      const projects = poolProjects.slice(0, countProjects)
      const hr = poolHr.slice(0, countHr)

      let sequence = [...fundamentals, ...skills, ...projects, ...hr]
      if (sequence.length < totalRequested) {
        const remainingPool = [
          ...poolFundamentals.slice(countFundamentals),
          ...poolSkills.slice(countSkills),
          ...poolProjects.slice(countProjects),
          ...poolHr.slice(countHr)
        ]
        const needed = totalRequested - sequence.length
        sequence = [...sequence, ...remainingPool.slice(0, needed)]
      }

      // Slice to exactly totalRequested and assign durations based on difficulty (easy/medium/hard)
      const slicedSequence = sequence.slice(0, totalRequested).map((q: any) => {
        let duration = 60
        if (q.section === 'technical_fundamentals') duration = 45
        else if (q.section === 'skills_deep_dive' || q.section === 'behavioral_hr') duration = 60
        else if (q.section === 'project_deep_dive') duration = 90
        return { ...q, duration }
      })

      setQaSequence(slicedSequence)
      setPhase('PHASE_1_QA')
      
      const newId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      setInterviewId(newId)
      
      // Initialize first question
      const firstQ = slicedSequence[0]
      setMessages([
        {
          id: 'system-init',
          content: 'Hello! I am InterviewGPT, your AI mock interview coach. Let us begin the Technical Q&A Round.',
          isUser: false
        },
        {
          id: 'q-0',
          content: `[Question 1/${totalRequested}] ${firstQ.question}`,
          isUser: false
        }
      ])
      setQaIndex(0)

      // Start the countdown timer for the first question
      setQaTimeRemaining(firstQ.duration || 60)
      setIsQaTimerActive(true)
    } catch (err) {
      console.error(err)
      alert('Screen share and fullscreen access are required to begin the interview. Please try again.')
    }
  }

  // ----------------------------------------------------
  // Phase 1: Adaptive Q&A Round
  // ----------------------------------------------------
  const handleSendQAAnswer = async (e?: React.FormEvent, forceAnswer?: string) => {
    if (e) e.preventDefault()
    if (isLoading) return

    const userAns = forceAnswer !== undefined ? forceAnswer : input.trim()
    if (forceAnswer === undefined && !userAns) return

    setInput('')
    setIsLoading(true)
    setIsQaTimerActive(false) // Pause countdown while evaluating

    // Add user response to chat list
    const userMsgId = `user-${qaIndex}`
    setMessages(prev => [...prev, { id: userMsgId, content: userAns || '(Unanswered)', isUser: true }])

    const currentQObj = qaSequence[qaIndex]

    try {
      // Evaluate response
      const response = await fetch('/api/evaluate-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: currentQObj.question,
          answer: userAns || 'Unanswered',
          idealAnswer: currentQObj.idealAnswer
        })
      })

      if (!response.ok) throw new Error('Evaluation failed')
      const result = await response.json()

      // Log answer silently
      const score = result.score // 0, 1, or 2
      const verdictText = result.verdict // e.g. "Good answer", "That answer is incorrect"
      
      const newLogItem: QALogItem = {
        section: currentQObj.section,
        question: currentQObj.question,
        userAnswer: userAns || 'Unanswered',
        idealAnswer: currentQObj.idealAnswer,
        score,
        explanation: result.explanation
      }
      setQaLog(prev => [...prev, newLogItem])

      // Add verdict message from AI (only verdict text, no tutoring)
      const verdictMsgId = `verdict-${qaIndex}`
      setMessages(prev => [
        ...prev,
        {
          id: verdictMsgId,
          content: verdictText,
          isUser: false,
          verdict: score === 2 ? 'Correct' : score === 1 ? 'Partial' : 'Incorrect'
        }
      ])

      // Move to next question
      const nextIndex = qaIndex + 1
      if (nextIndex < qaSequence.length) {
        setQaIndex(nextIndex)
        // Reset and prepare the next question timer duration
        const nextQ = qaSequence[nextIndex]
        setQaTimeRemaining(nextQ.duration || 60)
        
        setTimeout(() => {
          setMessages(prev => [
            ...prev,
            {
              id: `q-${nextIndex}`,
              content: `[Question ${nextIndex + 1}/${qaSequence.length}] ${nextQ.question}`,
              isUser: false
            }
          ])
          setIsLoading(false)
          setIsQaTimerActive(true) // Resume timer countdown
        }, 1000)
      } else {
        // Phase 1 finished! Auto-transition to Voice round!
        setTimeout(() => {
          setMessages(prev => [
            ...prev,
            {
              id: 'system-finish-qa',
              content: 'Technical Q&A complete. Next: communication assessment (voice-based). Full feedback and correct answers for anything you missed will be given at the end, in your report.',
              isUser: false
            }
          ])
          setIsLoading(false)
          handleStartVoiceRound()
        }, 1000)
      }
    } catch (err) {
      console.error(err)
      setIsLoading(false)
      setIsQaTimerActive(true) // Resume timer if error occurred
    }
  }

  const handleStartVoiceRound = async () => {
    // Stop speaking just in case
    stopSpeaking()

    // Request microphone permission before entering voice phase
    if (!hasMicPermission) {
      const granted = await requestMicPermission()
      if (!granted) {
        setMessages(prev => [
          ...prev,
          {
            id: 'mic-error',
            content: '⚠️ Microphone access was denied. The communication round requires your microphone. Please allow access in your browser settings and try again.',
            isUser: false
          }
        ])
        // Still proceed but WPM will be 0 if no speech is captured
      }
    }

    setPhase('PHASE_2_VOICE')
    setVoiceIndex(0)
    startPrepTimer()
  }

  // ----------------------------------------------------
  // Phase 2: Voice/JAM Round (Timers & Speech analysis)
  // ----------------------------------------------------
  const startPrepTimer = () => {
    stopListening()
    setIsSpeakingActive(false)
    setTempVoiceTranscript('')
    setWordConfidenceList([])
    setLatestVoiceFeedback(null)
    setVoicePrepTime(45)
    setIsPrepActive(true)
    setIsVoicePrepTimerActive(true)
    setIsVoiceSpeakTimerActive(false)
  }

  const startSpeakingTimer = () => {
    setIsPrepActive(false)
    setIsVoicePrepTimerActive(false)
    setVoiceSpeakTime(120)
    setIsSpeakingActive(true)
    setIsVoiceSpeakTimerActive(true)

    // Trigger speech recognition
    resetTranscript()
    if (isSpeechSupported) {
      startListening()
    }
  }

  const handleSkipPrep = () => {
    setIsVoicePrepTimerActive(false)
    startSpeakingTimer()
  }

  const handleFinishSpeaking = () => {
    setIsVoiceSpeakTimerActive(false)
    handleEvaluateSpeech()
  }

  const handleEvaluateSpeech = async () => {
    stopListening()
    setIsSpeakingActive(false)
    setIsVoiceEvaluating(true)

    const finalTranscript = tempVoiceTranscript.trim() || 'No response captured.'
    const promptText = voicePrompts[voiceIndex]
    const speakingDuration = 120 - voiceSpeakTime

    try {
      const response = await fetch('/api/analyze-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          transcript: finalTranscript,
          duration: Math.max(5, speakingDuration),
          wordConfidences: wordConfidenceList
        })
      })

      if (!response.ok) throw new Error('Speech analysis failed')
      const result = await response.json()

      // Log voice item
      const logItem: VoiceLogItem = {
        prompt: promptText,
        transcript: finalTranscript,
        fluencyScore: result.fluencyScore,
        pronunciationScore: result.pronunciationScore,
        grammarScore: result.grammarScore,
        structureScore: result.structureScore,
        wpm: result.wpm,
        mispronouncedWords: result.mispronouncedWords || [],
        feedbackText: result.feedbackText
      }

      setVoiceLog(prev => [...prev, logItem])
      setLatestVoiceFeedback(result.feedbackText)

      // Play audio feedback dynamically
      if (result.feedbackText) {
        speak(result.feedbackText)
      }

      // Auto-advance to next voice question after a 4-second delay
      setTimeout(() => {
        handleNextVoiceQuestion()
      }, 4000)
    } catch (err) {
      console.error(err)
    } finally {
      setIsVoiceEvaluating(false)
    }
  }

  const handleNextVoiceQuestion = () => {
    stopSpeaking()
    const nextIndex = voiceIndex + 1
    if (nextIndex < voicePrompts.length) {
      setVoiceIndex(nextIndex)
      setLatestVoiceFeedback(null)
      startPrepTimer()
    } else {
      // Completed voice round, move to coding
      setLatestVoiceFeedback(null)
      setPhase('PHASE_3_CODING')
      setCodingIndex(0)
      // Pick calibrated coding challenges (unified array)
      const selectedProblems = CODING_PROBLEMS
      setCodingProblems(selectedProblems)
      setUserCode(selectedProblems[0].templates[codeLanguage] || '')
    }
  }

  // ----------------------------------------------------
  // Phase 3: Coding Round
  // ----------------------------------------------------
  const handleCodingSubmit = async (code: string, output: string) => {
    setIsCodingEvaluating(true)
    const currentProblem = codingProblems[codingIndex]

    try {
      const response = await fetch('/api/evaluate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: codeLanguage,
          code,
          problemDescription: currentProblem.description,
          runOutput: output
        })
      })

      if (!response.ok) throw new Error('Coding evaluation failed')
      const result = await response.json()

      setCodingFeedback(result)

      // Add to coding logs
      const logItem: CodingLogItem = {
        problemDescription: currentProblem.title + '\n' + currentProblem.description,
        code,
        runOutput: output,
        correctness: result.correctness,
        complexity: result.complexity,
        codeQuality: result.codeQuality,
        score: result.score,
        feedback: result.feedback,
        optimalSolution: result.optimalSolution
      }
      setCodingLog(prev => [...prev, logItem])

    } catch (err) {
      console.error(err)
      alert('Error evaluating code. Please try again.')
    } finally {
      setIsCodingEvaluating(false)
    }
  }

  const handleNextCodingProblem = () => {
    const nextIndex = codingIndex + 1
    setCodingFeedback(null)
    if (nextIndex < codingProblems.length) {
      setCodingIndex(nextIndex)
      setUserCode(codingProblems[nextIndex].templates[codeLanguage] || '')
    } else {
      // Process feedback analysis for Phase 4
      handleStartFeedbackWalkthrough()
    }
  }

  const handleLanguageChange = (lang: EditorLanguage) => {
    setCodeLanguage(lang)
    const currentProb = codingProblems[codingIndex]
    if (currentProb) {
      setUserCode(currentProb.templates[lang] || '')
    }
  }

  // ----------------------------------------------------
  // Phase 4: Feedback Walkthrough & Report Compilation
  // ----------------------------------------------------
  const handleStartFeedbackWalkthrough = () => {
    proctoring.stopProctoring() // Stop proctoring rules on completion
    
    // Compile incorrect/partial answers:
    // 1. Q&A logs with score < 2
    // 2. Voice logs (low fluency, structure, or pronunciation < 80)
    // 3. Coding logs that are not fully correct
    const qaItems = qaLog
      .filter(item => item.score < 2)
      .map(item => ({
        type: 'qa',
        title: `Q&A: ${item.question}`,
        userAnswer: item.userAnswer,
        feedback: item.explanation,
        idealAnswer: item.idealAnswer
      }))

    const voiceItems = voiceLog
      .filter(item => (item.fluencyScore < 85 || item.structureScore < 85))
      .map(item => ({
        type: 'voice',
        title: `JAM Communication: ${item.prompt}`,
        userAnswer: item.transcript,
        feedback: item.feedbackText,
        idealAnswer: `A strong response should have solid structure: intro, detail block, conclusion. WPM should be in 110-140 range. Avoid fillers like 'um' and 'like'.`
      }))

    const codingItems = codingLog
      .filter(item => !item.correctness || item.score < 9)
      .map(item => ({
        type: 'coding',
        title: item.problemDescription.split('\n')[0],
        userAnswer: `\`\`\`${codeLanguage}\n${item.code}\n\`\`\``,
        feedback: item.feedback + `\nComplexity: ${item.complexity}\nQuality: ${item.codeQuality}`,
        idealAnswer: `\`\`\`${codeLanguage}\n${item.optimalSolution}\n\`\`\``
      }))

    const compiledFailed = [...qaItems, ...voiceItems, ...codingItems]
    setFailedQuestions(compiledFailed)

    if (compiledFailed.length > 0) {
      setPhase('PHASE_4_FEEDBACK')
      setWalkthroughIndex(0)
    } else {
      // No missed questions, go straight to report compilation
      compileFinalReport()
    }
  }

  const compileFinalReport = () => {
    // 1. Composite score:
    // - Technical Q&A (fundamentals + skills): 40% (average QA score out of 2 scaled to 100)
    // - Project Deep-Dive: 15%
    // - Behavioral/HR: 10%
    // - Voice/Communication: 20% (average of speech scores out of 100)
    // - Coding Round: 15% (average coding score out of 10 scaled to 100)

    const qaFundamentals = qaLog.filter(item => item.section === 'technical_fundamentals')
    const qaSkills = qaLog.filter(item => item.section === 'skills_deep_dive')
    const qaProjects = qaLog.filter(item => item.section === 'project_deep_dive')
    const qaHr = qaLog.filter(item => item.section === 'behavioral_hr')

    const getAverageScorePercent = (list: QALogItem[]) => {
      if (list.length === 0) return 90 // Default to strong check if empty
      const total = list.reduce((acc, item) => acc + item.score, 0)
      return (total / (list.length * 2)) * 100
    }

    const technicalScore = getAverageScorePercent([...qaFundamentals, ...qaSkills])
    const projectScore = getAverageScorePercent(qaProjects)
    const hrScore = getAverageScorePercent(qaHr)

    const avgVoiceScore = voiceLog.length > 0
      ? voiceLog.reduce((acc, item) => acc + (item.fluencyScore + item.pronunciationScore + item.grammarScore + item.structureScore) / 4, 0) / voiceLog.length
      : 85

    const avgCodingScore = codingLog.length > 0
      ? (codingLog.reduce((acc, item) => acc + item.score, 0) / codingLog.length) * 10
      : 80

    const weightedScore = Math.round(
      (technicalScore * 0.40) +
      (projectScore * 0.15) +
      (hrScore * 0.10) +
      (avgVoiceScore * 0.20) +
      (avgCodingScore * 0.15)
    )

    // Extrapolate lists of mispronounced words and pacing
    const allMispronounced = Array.from(new Set(voiceLog.flatMap(item => item.mispronouncedWords)))
    const averageWpm = voiceLog.length > 0 ? Math.round(voiceLog.reduce((acc, item) => acc + item.wpm, 0) / voiceLog.length) : 130

    // Compile section-wise summary blocks
    const reportPayload = {
      overallScore: weightedScore,
      weightedBreakdown: {
        technical: Math.round(technicalScore),
        project: Math.round(projectScore),
        hr: Math.round(hrScore),
        communication: Math.round(avgVoiceScore),
        coding: Math.round(avgCodingScore)
      },
      technicalRating: Math.round(technicalScore / 10),
      communicationRating: Math.round(avgVoiceScore / 10),
      summary: `You performed ${weightedScore >= 80 ? 'exceptionally well' : 'fairly well'} during this simulated interview assessment. Your technical skills are robust, though you could optimize a few algorithm concepts. Communication was steady with an average pace of ${averageWpm} WPM.`,
      strengths: [
        technicalScore >= 80 ? 'Excellent grip on core CS fundamentals and OOP principles' : 'Solid attempts at answering progressive technical questions',
        avgVoiceScore >= 80 ? 'Clear structure in speaking responses with active project storytelling' : 'Good attempts to structure situational answers',
        avgCodingScore >= 80 ? 'Optimal code solutions created for coding challenges' : 'Readable coding format and logical layouts'
      ],
      weaknesses: [
        technicalScore < 90 ? 'Needs more precise terminology when explaining distributed scale problems' : 'Review edge condition limits in advanced databases',
        avgVoiceScore < 90 ? 'Contains occasional filler word usages (like "um", "so") during deep-dives' : 'Ensure proper introductions inside JAM topics',
        avgCodingScore < 90 ? 'Review time/space complexities of algorithms' : 'Check null parameters in coding rounds'
      ],
      tips: [
        'Practice coding challenges daily to build structural confidence',
        'Practice shadowing speaking topics to eliminate filler sounds',
        'Review the correct answers walked through in the feedback session'
      ],
      communicationDetails: {
        averageWpm,
        fillerCount: voiceLog.reduce((acc, item) => {
          const words = item.transcript.split(/\s+/)
          const fillers = ['um', 'uh', 'like', 'you know', 'so', 'actually', 'basically']
          return acc + words.filter(w => fillers.includes(w.toLowerCase())).length
        }, 0),
        mispronounced: allMispronounced,
        exercises: [
          "Practice shadowing 5 min/day on tech vocabulary: 'architecture', 'asynchronous', 'concurrency'",
          "Force a 2-second pause instead of using filler sounds like 'um' or 'uh'",
          "Record yourself speaking on random engineering topics and calculate WPM"
        ]
      },
      codingDetails: codingLog.map(item => ({
        problem: item.problemDescription.split('\n')[0],
        correctness: item.correctness,
        complexity: item.complexity,
        score: item.score,
        codeQuality: item.codeQuality,
        optimalSolution: item.optimalSolution
      })),
      integrity: {
        fullscreenExits: proctoring.fullscreenExits,
        tabSwitches: proctoring.tabSwitches,
        totalTimeAway: proctoring.totalTimeAway,
        screenShareContinuity: proctoring.screenShareContinuity,
        screenShareDisconnections: proctoring.screenShareDisconnections,
        disqualified: false
      }
    }

    const finalReport = {
      id: interviewId,
      ...reportPayload
    }

    // Save report to MySQL
    fetch('/api/save-interview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: interviewId,
        resumeText,
        parsedResume: parsedData,
        overallScore: weightedScore,
        weightedBreakdown: reportPayload.weightedBreakdown,
        summary: reportPayload.summary,
        strengths: reportPayload.strengths,
        weaknesses: reportPayload.weaknesses,
        tips: reportPayload.tips,
        communicationDetails: reportPayload.communicationDetails,
        codingDetails: reportPayload.codingDetails,
        integrity: reportPayload.integrity,
        questions: qaSequence,
        qaLog,
        voiceLog,
        codingLog
      })
    })
    .then((res) => res.json())
    .then((data) => {
      console.log('[MySQL] Saved interview session with ID:', data.id)
    })
    .catch((err) => {
      console.error('[MySQL] Failed to save session:', err)
    })

    setFeedbackReportData(finalReport)
    setPhase('COMPLETED_REPORT')
  }

  // ----------------------------------------------------
  // Restart interview logic
  // ----------------------------------------------------
  const handleStartNewInterview = () => {
    proctoring.resetStats()
    setResumeText('')
    setFileName(null)
    setInterviewId('')
    setParsedData(null)
    setQuestionBank(null)
    setMessages([])
    setQaIndex(0)
    setQaLog([])
    setVoiceLog([])
    setCodingLog([])
    setFailedQuestions([])
    setFeedbackReportData(null)
    setIsQaTimerActive(false)
    setQaTimeRemaining(60)
    if (qaTimerRef.current) clearTimeout(qaTimerRef.current)
    
    // Refresh interviews list
    fetch('/api/interviews')
      .then((res) => {
        if (res.ok) return res.json()
        return { interviews: [] }
      })
      .then((data) => {
        if (data) {
          setInterviews(data.interviews || [])
        }
      })
      .catch((err) => console.error(err))
      .finally(() => {
        setPhase('DASHBOARD')
      })
  }

  return (
    <main className="relative w-full h-screen overflow-hidden bg-background">
      <FloatingLeaves />
      <AnimatedBackground />

      {/* Proctoring Overlay */}
      <ProctoringOverlay
        pauseReason={proctoring.pauseReason}
        onResumeFullscreen={proctoring.resumeFullscreen}
        onResumeScreenShare={proctoring.resumeScreenShare}
        onClearPause={proctoring.clearPause}
      />

      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <header className="sticky top-0 z-20 border-b border-border/50 backdrop-blur-md bg-background/80">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent flex items-center gap-2">
                <Shield className="w-6 h-6 text-primary animate-pulse" />
                Elevate AI Interviewer
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-mono">
                Coach Phase: {phase.replace('_', ' ')}
              </p>
            </motion.div>
            <div className="flex items-center gap-2">
              {user && (
                <div className="flex items-center gap-2 mr-2">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 max-w-[120px] truncate">
                    {user.name}
                  </span>
                  <Button
                    onClick={handleLogout}
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1.5 hover:bg-destructive/10 hover:text-destructive h-9 rounded-lg"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Sign Out</span>
                  </Button>
                </div>
              )}
              {phase !== 'SETUP' && phase !== 'PHASE_0_RESUME' && phase !== 'COMPLETED_REPORT' && phase !== 'DASHBOARD' && (
                <Button
                  onClick={handleStartNewInterview}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 border-destructive text-destructive hover:bg-destructive/10"
                >
                  <AlertCircle className="w-4 h-4" />
                  Abort
                </Button>
              )}
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Dynamic Panels */}
        <div className="flex-1 overflow-y-auto relative min-h-0 flex flex-col">
          <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col min-h-0 justify-between">
            
            {/* 0. DASHBOARD PHASE */}
            {phase === 'DASHBOARD' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full space-y-8"
              >
                {isDashboardLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Loading your dashboard...</p>
                  </div>
                ) : (
                  <>
                    {/* Welcome Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-6 rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm shadow-sm gap-4">
                      <div>
                        <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                          Welcome, {user?.name || 'Candidate'}! <Sparkles className="w-5 h-5 text-amber-500" />
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                          Analyze your technical skills, code quality, and communication in real-time.
                        </p>
                      </div>
                      <Button
                        onClick={() => setPhase('SETUP')}
                        className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold shadow-lg shadow-primary/20 flex items-center gap-2 h-11 px-6 rounded-xl self-start sm:self-center"
                      >
                        <Play className="w-4 h-4" /> Start New Interview
                      </Button>
                    </div>

                    {/* Past Interviews list */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                        <LayoutDashboard className="w-5 h-5 text-primary" /> Previous Assessments
                      </h3>

                      {interviews.length === 0 ? (
                        <Card className="p-8 text-center border border-dashed border-border/60 bg-card/20 rounded-xl space-y-4">
                          <p className="text-sm text-muted-foreground">
                            You have no completed interview sessions yet.
                          </p>
                          <Button variant="outline" size="sm" onClick={() => setPhase('SETUP')} className="rounded-lg">
                            Take Your First Interview
                          </Button>
                        </Card>
                      ) : (
                        <div className="grid gap-4 sm:grid-cols-1">
                          {interviews.map((interview) => (
                            <Card key={interview.id} className="p-5 border-border/30 bg-card/30 hover:bg-card/50 transition-all rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                              <div className="space-y-1.5 font-sans">
                                <div className="flex items-center gap-2.5">
                                  <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full border ${
                                    interview.overall_score >= 80 
                                      ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                                      : interview.overall_score >= 50
                                      ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                      : 'bg-red-500/10 text-red-500 border-red-500/20'
                                  }`}>
                                    Score: {interview.overall_score}/100
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(interview.created_at).toLocaleDateString(undefined, {
                                      dateStyle: 'medium'
                                    })} at {new Date(interview.created_at).toLocaleTimeString(undefined, {
                                      timeStyle: 'short'
                                    })}
                                  </span>
                                </div>
                                <p className="text-sm text-foreground line-clamp-2 leading-relaxed">
                                  {interview.summary}
                                </p>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewReport(interview.id)}
                                className="self-end sm:self-center shrink-0 rounded-lg"
                              >
                                View Report <ArrowRight className="w-4 h-4 ml-1" />
                              </Button>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {/* 1. SETUP PHASE */}
            {phase === 'SETUP' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-xl mx-auto space-y-8 py-8"
              >
                <Card className="p-8 border-border/50 bg-card/80 backdrop-blur-sm shadow-xl space-y-6">
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold text-foreground">Integrity Setup Checks</h2>
                    <p className="text-sm text-muted-foreground">
                      Before we begin the mock interview, please authorize the browser proctoring requirements.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Screen Share Check */}
                    <div className="flex items-center justify-between p-4 border border-border/50 rounded-xl bg-background/50">
                      <div className="flex items-center gap-3">
                        <Monitor className="w-5 h-5 text-primary" />
                        <div>
                          <p className="text-sm font-semibold">Share Active Screen</p>
                          <p className="text-xs text-muted-foreground">Used to log browser focus state</p>
                        </div>
                      </div>
                      {proctoring.isScreenShared ? (
                        <div className="flex items-center gap-1 text-green-500 text-sm font-bold">
                          <CheckCircle className="w-5 h-5" /> Connected
                        </div>
                      ) : (
                        <Button size="sm" onClick={proctoring.requestScreenShare}>
                          Share Screen
                        </Button>
                      )}
                    </div>

                    {/* Fullscreen Check */}
                    <div className="flex items-center justify-between p-4 border border-border/50 rounded-xl bg-background/50">
                      <div className="flex items-center gap-3">
                        <Maximize className="w-5 h-5 text-primary" />
                        <div>
                          <p className="text-sm font-semibold">Fullscreen Mode</p>
                          <p className="text-xs text-muted-foreground">Ensures single window focus integrity</p>
                        </div>
                      </div>
                      {proctoring.isFullscreen ? (
                        <div className="flex items-center gap-1 text-green-500 text-sm font-bold">
                          <CheckCircle className="w-5 h-5" /> Active
                        </div>
                      ) : (
                        <Button size="sm" onClick={proctoring.enterFullscreen}>
                          Go Fullscreen
                        </Button>
                      )}
                    </div>
                  </div>

                  <Button
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold flex items-center justify-center gap-2"
                    disabled={!proctoring.isScreenShared || !proctoring.isFullscreen}
                    onClick={() => setPhase('PHASE_0_RESUME')}
                  >
                    <Lock className="w-4 h-4" />
                    Verify Integrity & Proceed
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full border-dashed border-primary hover:bg-primary/5 text-primary font-semibold flex items-center justify-center gap-2"
                    onClick={() => {
                      setDevBypass(true)
                      setPhase('PHASE_0_RESUME')
                    }}
                  >
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Bypass Proctoring (Dev Mode)
                  </Button>
                </Card>
              </motion.div>
            )}

            {/* 2. PHASE 0: RESUME INTAKE */}
            {phase === 'PHASE_0_RESUME' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl mx-auto space-y-6"
              >
                <Card className="p-8 border-border/50 bg-card/80 backdrop-blur-sm shadow-xl space-y-6">
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold text-foreground">Phase 0: Resume Intake</h2>
                    <p className="text-sm text-muted-foreground">
                      Upload your resume file or paste your resume content below.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Dotted upload zone */}
                    <div className="border-2 border-dashed border-border/60 hover:border-primary/50 transition-all rounded-xl p-6 text-center space-y-2 bg-background/30 relative">
                      <input
                        type="file"
                        accept=".txt,.pdf,.docx"
                        onChange={handleFileUpload}
                        disabled={isExtracting}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="flex flex-col items-center justify-center space-y-2">
                        {isExtracting ? (
                          <>
                            <RefreshCw className="w-8 h-8 text-accent animate-spin" />
                            <p className="text-sm font-semibold">Extracting text content from file...</p>
                            <p className="text-xs text-muted-foreground">This will only take a moment</p>
                          </>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-muted-foreground animate-bounce" />
                            <p className="text-sm font-semibold">
                              {fileName ? `Uploaded: ${fileName}` : 'Drag & drop or click to upload resume'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Supports .txt, .pdf, or .docx
                            </p>
                          </>
                        )}
                      </div>
                    </div>

                    <textarea
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                      placeholder="Or paste your plain text resume here..."
                      className="w-full h-48 p-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm font-sans"
                    />

                    <div className="flex gap-2 flex-wrap">
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => setResumeText(SAMPLE_RESUMES.frontend)}
                      >
                        Load Frontend Mock Resume
                      </Button>
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => setResumeText(SAMPLE_RESUMES.backend)}
                      >
                        Load Backend Mock Resume
                      </Button>
                    </div>

                    <Button
                      onClick={handleParseResume}
                      disabled={isParsing || !resumeText.trim()}
                      className="w-full bg-primary hover:bg-primary/90 font-bold"
                    >
                      {isParsing ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Parsing and Generating Questions...
                        </>
                      ) : (
                        'Parse Resume'
                      )}
                    </Button>
                  </div>
                </Card>

                {parsedData && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="p-6 border-border/50 bg-card/85 backdrop-blur-sm shadow-md space-y-4">
                      <div className="flex items-center gap-2 text-green-500">
                        <CheckCircle className="w-5 h-5" />
                        <h3 className="font-bold">Resume Parsed Successfully</h3>
                      </div>
                      <p className="text-sm text-foreground/90">
                        We generated a custom Question Bank with 20 mock interview questions covering core CS fundamentals, specific deep-dives into <strong>{parsedData.skills.slice(0, 4).join(', ')}</strong>, project architecture evaluations, and behavioral HR prompts.
                      </p>

                      <div className="p-4 bg-background/50 rounded-xl space-y-2 border border-border/50 text-xs font-mono">
                        <p>✓ Skills extracted: {parsedData.skills.length}</p>
                        <p>✓ Key projects: {parsedData.projects.map((p: any) => p.name).join(', ')}</p>
                      </div>

                      {/* Mock Interview Dynamic Configuration */}
                      <div className="p-5 border border-border/50 bg-background/40 backdrop-blur-sm rounded-xl space-y-4 font-sans">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Mock Interview Section Parameters
                        </h4>
                        
                        {/* Questions count slider */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-semibold text-foreground">Technical/Aptitude Questions</span>
                            <span className="font-bold text-primary font-mono">{qaQuestionCount} Questions</span>
                          </div>
                          <input
                            type="range"
                            min="5"
                            max="50"
                            value={qaQuestionCount}
                            onChange={(e) => setQaQuestionCount(parseInt(e.target.value))}
                            className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
                          />
                          <p className="text-xs text-muted-foreground flex justify-between">
                            <span>Min: 5</span>
                            <span>Max: 50</span>
                          </p>
                        </div>

                        {/* Estimated Duration indicator */}
                        <div className="flex items-center justify-between text-xs bg-primary/5 border border-primary/20 p-3 rounded-lg text-primary">
                          <span className="font-semibold flex items-center gap-1.5">
                            <AlertCircle className="w-4 h-4" />
                            Estimated Test Duration
                          </span>
                          <span className="font-bold font-mono">
                            ~{Math.round(qaQuestionCount * 1.0)} Mins
                          </span>
                        </div>
                      </div>

                      <Button
                        onClick={handleStartInterview}
                        className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold flex items-center justify-center gap-2"
                      >
                        Start Mock Interview
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Card>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* 3. PHASE 1: Q&A CHAT SYSTEM */}
            {phase === 'PHASE_1_QA' && (
              <div className="flex flex-col h-full justify-between gap-4">
                {/* Timer Header */}
                <div className="sticky top-0 z-20 flex items-center justify-between p-3.5 rounded-xl border border-border/50 bg-card/90 backdrop-blur-md shadow-sm font-sans">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Question {qaIndex + 1} of {qaSequence.length}
                  </span>
                  <div className={`flex items-center gap-1.5 font-mono text-sm font-bold px-3 py-1 rounded-full border ${
                    qaTimeRemaining <= 10 
                      ? 'bg-red-500/10 text-red-500 border-red-500/20 animate-pulse' 
                      : 'bg-primary/10 text-primary border-primary/20'
                  }`}>
                    <AlertCircle className="w-4 h-4" />
                    {qaTimeRemaining}s left
                  </div>
                </div>

                {/* Chat Log */}
                <div className="flex-1 space-y-4 overflow-y-auto pr-2 min-h-[300px]">
                  {messages.map((msg, index) => (
                    <div key={msg.id} className="space-y-1">
                      <ChatMessage
                        message={msg.content}
                        isUser={msg.isUser}
                        index={index}
                      />
                      {msg.verdict && (
                        <div className={`text-xs font-bold px-2 py-1 rounded w-fit ${
                          msg.verdict === 'Correct'
                            ? 'text-green-500 bg-green-500/10'
                            : msg.verdict === 'Partial'
                            ? 'text-yellow-500 bg-yellow-500/10'
                            : 'text-red-500 bg-red-500/10'
                        } ${msg.isUser ? 'ml-auto mr-2' : 'ml-2'}`}>
                          Verdict: {msg.verdict}
                        </div>
                      )}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-2 items-center pl-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <TypingIndicator />
                      </div>
                      <span className="text-xs text-muted-foreground">Evaluating your response...</span>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Controls */}
                <div className="border-t border-border/50 pt-4 bg-background">
                  {qaIndex >= qaSequence.length && !isLoading ? (
                    <Button
                      onClick={handleStartVoiceRound}
                      className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold flex items-center justify-center gap-2 py-6 text-lg"
                    >
                      <Volume2 className="w-6 h-6" />
                      Proceed to Voice/JAM Round
                    </Button>
                  ) : (
                    <form onSubmit={handleSendQAAnswer} className="flex gap-2">
                      <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your response to the question..."
                        disabled={isLoading}
                        className="flex-1 bg-card border border-border/50 rounded-full px-6 py-3"
                      />
                      <Button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="w-12 h-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground p-0 flex items-center justify-center"
                      >
                        <Send className="w-5 h-5" />
                      </Button>
                    </form>
                  )}
                </div>
              </div>
            )}

            {/* 4. PHASE 2: VOICE/JAM COMMUNICATION ROUND */}
            {phase === 'PHASE_2_VOICE' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-xl mx-auto space-y-6"
              >
                <Card className="p-8 border-border/50 bg-card/85 backdrop-blur-sm shadow-xl space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono bg-accent/20 text-accent px-2 py-1 rounded">
                      Voice Round: Question {voiceIndex + 1} of {voicePrompts.length}
                    </span>
                    <Volume2 className="w-5 h-5 text-accent animate-pulse" />
                  </div>

                  <div className="p-4 bg-background/50 rounded-xl border border-border/50">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      JAM Prompt
                    </h3>
                    <p className="text-lg font-bold text-foreground leading-relaxed">
                      {voicePrompts[voiceIndex]}
                    </p>
                  </div>

                  {/* Preparation Timer */}
                  {isPrepActive && (
                    <div className="text-center space-y-4 py-4">
                      <div className="text-sm text-yellow-500 font-semibold">Preparation Time Remaining</div>
                      <div className="text-5xl font-mono font-bold text-yellow-500">{voicePrepTime}s</div>
                      <Button onClick={handleSkipPrep} variant="outline" className="w-full">
                        Skip Preparation, Start Speaking
                      </Button>
                    </div>
                  )}

                  {/* Speaking Timer & Speech to Text */}
                  {isSpeakingActive && (
                    <div className="text-center space-y-6 py-4">
                      <div className="text-sm text-red-500 font-bold flex items-center justify-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                        Recording Speech Active
                      </div>
                      <div className="text-5xl font-mono font-bold text-red-500">{voiceSpeakTime}s</div>

                      {/* Microphone status indicator */}
                      {!isListening && hasMicPermission === false && (
                        <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-500 text-xs font-semibold flex items-center gap-2 justify-center">
                          <AlertCircle className="w-4 h-4" />
                          Microphone access denied. Your speech won't be captured.
                        </div>
                      )}
                      {!isListening && hasMicPermission !== false && speechError && (
                        <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-500 text-xs font-semibold flex items-center gap-2 justify-center">
                          <AlertCircle className="w-4 h-4" />
                          {speechError}
                        </div>
                      )}
                      
                      <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-xl text-left min-h-[80px] max-h-[160px] overflow-y-auto text-sm italic text-foreground">
                        {tempVoiceTranscript || 'Start speaking. Your response will transcribe in realtime...'}
                      </div>

                      {/* Live word count */}
                      {tempVoiceTranscript && (
                        <div className="text-xs font-mono text-muted-foreground flex items-center justify-center gap-4">
                          <span>Words: <strong>{tempVoiceTranscript.split(/\s+/).filter(w => w.length > 0).length}</strong></span>
                          <span>Live WPM: <strong>{Math.max(5, 120 - voiceSpeakTime) > 0 ? Math.round(tempVoiceTranscript.split(/\s+/).filter(w => w.length > 0).length / (Math.max(5, 120 - voiceSpeakTime) / 60)) : 0}</strong></span>
                        </div>
                      )}

                      <Button
                        onClick={handleFinishSpeaking}
                        className="w-full bg-red-500 hover:bg-red-600 text-white font-bold"
                      >
                        Finish Response
                      </Button>
                    </div>
                  )}

                  {/* Voice Review & Speech analysis */}
                  {isVoiceEvaluating && (
                    <div className="text-center space-y-4 py-8">
                      <RefreshCw className="w-10 h-10 animate-spin mx-auto text-accent" />
                      <p className="text-sm text-muted-foreground">Evaluating your communication scores...</p>
                    </div>
                  )}

                  {latestVoiceFeedback && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-4 border-t border-border/50 pt-6"
                    >
                      <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                        Instant Speech Feedback
                      </h4>
                      <p className="text-sm font-mono bg-accent/10 border border-accent/20 rounded-xl p-4 text-foreground/90">
                        {latestVoiceFeedback}
                      </p>
                      
                      {voiceLog[voiceLog.length - 1] && (
                        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                          <div className="p-2 bg-background/50 rounded border border-border/50">
                            Pace: <strong>{voiceLog[voiceLog.length - 1].wpm} WPM</strong>
                          </div>
                          <div className="p-2 bg-background/50 rounded border border-border/50">
                            Fluency: <strong>{voiceLog[voiceLog.length - 1].fluencyScore}/100</strong>
                          </div>
                        </div>
                      )}

                      <Button
                        onClick={handleNextVoiceQuestion}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold flex items-center justify-center gap-2"
                      >
                        Next Topic
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  )}

                </Card>
              </motion.div>
            )}

            {/* 5. PHASE 3: CODING CHALLENGES */}
            {phase === 'PHASE_3_CODING' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full items-stretch">
                
                {/* Left Side: Coding Challenge Description */}
                <div className="flex flex-col justify-between space-y-4">
                  <Card className="p-6 border-border/50 bg-card/85 backdrop-blur-sm flex-1 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono bg-primary/20 text-primary px-2 py-1 rounded">
                          Coding Challenge {codingIndex + 1} of 2
                        </span>
                        <Code className="w-5 h-5 text-primary" />
                      </div>
                      
                      <h3 className="text-xl font-bold tracking-tight text-foreground">
                        {codingProblems[codingIndex]?.title}
                      </h3>
                      <p className="text-sm text-foreground/90 leading-relaxed bg-background/50 p-4 border border-border/50 rounded-xl">
                        {codingProblems[codingIndex]?.description}
                      </p>
                    </div>

                    <div className="pt-6 space-y-4">
                      {isCodingEvaluating && (
                        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                          <RefreshCw className="w-4 h-4 animate-spin text-accent" />
                          Evaluating solution algorithm...
                        </div>
                      )}

                      {codingFeedback && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 bg-card border border-accent/20 rounded-xl space-y-2 text-xs"
                        >
                          <p className="font-bold text-accent">Feedback Analysis:</p>
                          <p>✓ Correctness: <strong>{codingFeedback.correctness ? 'PASSED' : 'FAILED'}</strong></p>
                          <p>✓ Complexity: <strong>{codingFeedback.complexity}</strong></p>
                          <p>✓ Code Quality: {codingFeedback.codeQuality}</p>
                          <p className="font-mono pt-2 border-t border-border/50 text-foreground/80">
                            {codingFeedback.feedback}
                          </p>

                          <Button
                            onClick={handleNextCodingProblem}
                            className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
                          >
                            Proceed
                          </Button>
                        </motion.div>
                      )}
                    </div>
                  </Card>
                </div>

                {/* Right Side: Code Editor */}
                <div className="flex flex-col">
                  <CodeEditor
                    value={userCode}
                    onChange={setUserCode}
                    language={codeLanguage}
                    onLanguageChange={(lang) => {
                      handleLanguageChange(lang)
                    }}
                    onSubmit={handleCodingSubmit}
                  />
                </div>
              </div>
            )}

            {/* 6. PHASE 4 PART A: INCORRECT Q&A WALKTHROUGH */}
            {phase === 'PHASE_4_FEEDBACK' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-2xl mx-auto space-y-6"
              >
                <Card className="p-8 border-border/50 bg-card/85 backdrop-blur-sm shadow-xl space-y-6">
                  <div className="flex items-center justify-between border-b border-border/50 pb-4">
                    <div>
                      <h2 className="text-xl font-bold text-foreground">Phase 4: Feedback Session</h2>
                      <p className="text-xs text-muted-foreground">Reviewing questions with missed components</p>
                    </div>
                    <span className="text-xs font-mono bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded">
                      Missed Item {walkthroughIndex + 1} of {failedQuestions.length}
                    </span>
                  </div>

                  {failedQuestions[walkthroughIndex] && (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-muted-foreground uppercase">Title / Question</p>
                        <p className="text-base font-bold text-foreground bg-background/50 p-3 rounded-lg border border-border/50">
                          {failedQuestions[walkthroughIndex].title}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs font-bold text-muted-foreground uppercase">Your Response</p>
                        <div className="p-3 bg-muted rounded-lg text-sm text-foreground/80 font-mono overflow-x-auto">
                          {failedQuestions[walkthroughIndex].userAnswer}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs font-bold text-yellow-500 uppercase">Review Feedback</p>
                        <p className="text-sm bg-yellow-500/5 text-yellow-500 border border-yellow-500/10 p-3 rounded-lg leading-relaxed">
                          {failedQuestions[walkthroughIndex].feedback}
                        </p>
                      </div>

                      <div className="space-y-1 pt-2">
                        <p className="text-xs font-bold text-green-500 uppercase">Ideal Model Answer / Code</p>
                        <div className="p-4 bg-green-500/5 text-green-500 border border-green-500/10 rounded-lg text-sm font-sans whitespace-pre-wrap">
                          {failedQuestions[walkthroughIndex].idealAnswer}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-4 pt-4">
                    <Button
                      variant="outline"
                      disabled={walkthroughIndex === 0}
                      onClick={() => setWalkthroughIndex(prev => prev - 1)}
                    >
                      Previous
                    </Button>
                    
                    {walkthroughIndex + 1 < failedQuestions.length ? (
                      <Button
                        onClick={() => setWalkthroughIndex(prev => prev + 1)}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      >
                        Next Missed Item
                      </Button>
                    ) : (
                      <Button
                        onClick={compileFinalReport}
                        className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold flex items-center justify-center gap-2"
                      >
                        Generate Final Assessment Report
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </Card>
              </motion.div>
            )}

            {/* 7. PHASE 4 PART B: COMPLETED ASSESSMENT REPORT */}
            {phase === 'COMPLETED_REPORT' && feedbackReportData && (
              <FeedbackReport
                feedback={feedbackReportData}
                onStartNew={handleStartNewInterview}
              />
            )}

          </div>
        </div>
      </div>
    </main>
  )
}
