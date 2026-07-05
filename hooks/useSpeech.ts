'use client'

import { useState, useCallback, useEffect, useRef } from 'react'

interface WordConfidence {
  word: string
  confidence: number
}

interface UseSpeechReturn {
  isListening: boolean
  transcript: string
  wordConfidences: WordConfidence[]
  startListening: () => void
  stopListening: () => void
  resetTranscript: () => void
  isSupported: boolean
  error: string | null
  hasMicPermission: boolean | null
  requestMicPermission: () => Promise<boolean>
}

export function useSpeech(): UseSpeechReturn {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [wordConfidences, setWordConfidences] = useState<WordConfidence[]>([])
  const [isSupported, setIsSupported] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null)
  const recognitionRef = useRef<any>(null)
  const finalTranscriptRef = useRef<string>('')

  // Request microphone permission explicitly
  const requestMicPermission = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      // Stop all tracks immediately — we just needed the permission grant
      stream.getTracks().forEach(track => track.stop())
      setHasMicPermission(true)
      setError(null)
      return true
    } catch (err) {
      console.error('Microphone permission denied:', err)
      setHasMicPermission(false)
      setError('Microphone access denied. Please allow microphone access in your browser settings.')
      return false
    }
  }, [])

  // Check microphone permission status on mount
  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.permissions) return
    navigator.permissions.query({ name: 'microphone' as PermissionName })
      .then((result) => {
        setHasMicPermission(result.state === 'granted')
        result.onchange = () => {
          setHasMicPermission(result.state === 'granted')
        }
      })
      .catch(() => {
        // permissions API not supported for microphone in some browsers
      })
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      setIsSupported(false)
      return
    }

    recognitionRef.current = new SpeechRecognition()
    const recognition = recognitionRef.current

    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setIsListening(true)
      setError(null)
    }

    recognition.onresult = (event: any) => {
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const text = result[0].transcript
        const confidence = result[0].confidence || 0.9

        if (result.isFinal) {
          // Accumulate finalized text
          finalTranscriptRef.current += text + ' '

          // Extract real word-level confidences from finalized results
          const words = text.split(/\s+/).filter((w: string) => w.length > 0)
          const newConfidences: WordConfidence[] = words.map((word: string) => ({
            word,
            confidence: confidence // Use actual recognition confidence
          }))

          setWordConfidences(prev => [...prev, ...newConfidences])
        } else {
          interimTranscript += text
        }
      }

      // Show finalized text + current interim text
      setTranscript(finalTranscriptRef.current + interimTranscript)
    }

    recognition.onerror = (event: any) => {
      if (event.error === 'not-allowed') {
        setHasMicPermission(false)
        setError('Microphone access denied. Please allow microphone access and try again.')
      } else if (event.error === 'no-speech') {
        // This is common and not a critical error, just no speech detected
        setError(null)
      } else if (event.error === 'aborted') {
        setError(null)
      } else {
        setError(`Speech recognition error: ${event.error}`)
      }
      console.error('Speech recognition error:', event.error)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    return () => {
      if (recognition) {
        recognition.abort()
      }
    }
  }, [])

  const startListening = useCallback(() => {
    if (!recognitionRef.current || !isSupported) return
    // Don't clear existing transcript — allow accumulation across pause/resume
    setError(null)
    try {
      recognitionRef.current.start()
    } catch (err) {
      console.error('Failed to start listening:', err)
    }
  }, [isSupported])

  const stopListening = useCallback(() => {
    if (!recognitionRef.current || !isSupported) return
    try {
      recognitionRef.current.stop()
    } catch (err) {
      console.error('Failed to stop listening:', err)
    }
  }, [isSupported])

  const resetTranscript = useCallback(() => {
    setTranscript('')
    setWordConfidences([])
    finalTranscriptRef.current = ''
  }, [])

  return {
    isListening,
    transcript,
    wordConfidences,
    startListening,
    stopListening,
    resetTranscript,
    isSupported,
    error,
    hasMicPermission,
    requestMicPermission,
  }
}
