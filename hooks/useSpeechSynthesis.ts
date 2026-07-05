'use client'

import { useCallback, useState, useEffect } from 'react'

interface UseSpeechSynthesisReturn {
  speak: (text: string) => void
  isSpeaking: boolean
  isSupported: boolean
  stop: () => void
}

export function useSpeechSynthesis(): UseSpeechSynthesisReturn {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isSupported, setIsSupported] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const synth = window.speechSynthesis
    if (!synth) {
      setIsSupported(false)
    }

    return () => {
      if (synth) {
        synth.cancel()
      }
    }
  }, [])

  const speak = useCallback((text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      console.warn('Speech Synthesis not supported in this browser')
      return
    }

    const synth = window.speechSynthesis

    // Cancel any ongoing speech
    synth.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1
    utterance.pitch = 1
    utterance.volume = 1

    utterance.onstart = () => {
      setIsSpeaking(true)
    }

    utterance.onend = () => {
      setIsSpeaking(false)
    }

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error)
      setIsSpeaking(false)
    }

    synth.speak(utterance)
  }, [])

  const stop = useCallback(() => {
    if (typeof window === 'undefined') return
    const synth = window.speechSynthesis
    if (synth) {
      synth.cancel()
      setIsSpeaking(false)
    }
  }, [])

  return {
    speak,
    isSpeaking,
    isSupported,
    stop,
  }
}
