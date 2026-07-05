'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

export interface ProctoringStats {
  fullscreenExits: number
  tabSwitches: number
  totalTimeAway: number
  screenShareContinuity: 'continuous' | 'interrupted'
}

export function useProctoring() {
  const [isScreenShared, setIsScreenShared] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [fullscreenExits, setFullscreenExits] = useState(0)
  const [tabSwitches, setTabSwitches] = useState(0)
  const [totalTimeAway, setTotalTimeAway] = useState(0)
  const [screenShareContinuity, setScreenShareContinuity] = useState<'continuous' | 'interrupted'>('continuous')
  const [screenShareDisconnections, setScreenShareDisconnections] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [pauseReason, setPauseReason] = useState<'fullscreen' | 'tab_switch' | 'screen_share' | null>(null)

  const streamRef = useRef<MediaStream | null>(null)
  const isProctoringActiveRef = useRef(false)
  const awayStartTimeRef = useRef<number | null>(null)

  const handleFullscreenChange = useCallback(() => {
    const isFull = !!document.fullscreenElement
    setIsFullscreen(isFull)
    if (!isProctoringActiveRef.current) return
    if (!isFull) {
      setFullscreenExits((prev) => prev + 1)
      setIsPaused(true)
      setPauseReason('fullscreen')
    }
  }, [])

  const handleVisibilityChange = useCallback(() => {
    if (!isProctoringActiveRef.current) return
    if (document.visibilityState === 'hidden') {
      awayStartTimeRef.current = Date.now()
    } else if (document.visibilityState === 'visible' && awayStartTimeRef.current !== null) {
      const durationSec = Math.round((Date.now() - awayStartTimeRef.current) / 1000)
      setTotalTimeAway((prev) => prev + durationSec)
      setTabSwitches((prev) => prev + 1)
      awayStartTimeRef.current = null
      setIsPaused(true)
      setPauseReason('tab_switch')
    }
  }, [])

  const handleWindowBlur = useCallback(() => {
    if (!isProctoringActiveRef.current) return
    setTabSwitches((prev) => prev + 1)
    setIsPaused(true)
    setPauseReason('tab_switch')
  }, [])

  const cleanUpScreenShare = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setIsScreenShared(false)
  }, [])

  const requestScreenShare = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      })
      streamRef.current = stream
      setIsScreenShared(true)

      const videoTrack = stream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.onended = () => {
          setIsScreenShared(false)
          setScreenShareContinuity('interrupted')
          setScreenShareDisconnections((prev) => prev + 1)
          if (isProctoringActiveRef.current) {
            setIsPaused(true)
            setPauseReason('screen_share')
          }
        }
      }
    } catch (err) {
      console.error('Screen share error:', err)
      setIsScreenShared(false)
      throw err;
    }
  }, [])

  const enterFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
        setIsFullscreen(true)
      }
    } catch (err) {
      console.error('Fullscreen request failed:', err)
      throw err;
    }
  }, [])

  const startProctoring = useCallback(async () => {
    try {
      if (!isScreenShared) {
        await requestScreenShare()
      }
    } catch (err) {
      console.error('Screen share request failed on start:', err)
    }

    try {
      if (!document.fullscreenElement) {
        await enterFullscreen()
      }
    } catch (err) {
      console.error('Fullscreen request failed on start:', err)
    }

    isProctoringActiveRef.current = true
    setIsPaused(false)
    setPauseReason(null)
  }, [isScreenShared, requestScreenShare, enterFullscreen])

  const resumeFullscreen = useCallback(async () => {
    try {
      await enterFullscreen()
      setIsPaused(false)
      setPauseReason(null)
    } catch (err) {
      console.error('Failed to resume fullscreen:', err)
    }
  }, [enterFullscreen])

  const resumeScreenShare = useCallback(async () => {
    try {
      await requestScreenShare()
      setIsPaused(false)
      setPauseReason(null)
    } catch (err) {
      console.error('Failed to resume screen share:', err)
    }
  }, [requestScreenShare])

  const clearPause = useCallback(() => {
    setIsPaused(false)
    setPauseReason(null)
    window.focus()
  }, [])

  const stopProctoring = useCallback(() => {
    isProctoringActiveRef.current = false
    cleanUpScreenShare()
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => console.error(err))
    }
    setIsFullscreen(false)
    setIsPaused(false)
    setPauseReason(null)
  }, [cleanUpScreenShare])

  const resetStats = useCallback(() => {
    setFullscreenExits(0)
    setTabSwitches(0)
    setTotalTimeAway(0)
    setScreenShareContinuity('continuous')
    setScreenShareDisconnections(0)
    setIsPaused(false)
    setPauseReason(null)
  }, [])

  useEffect(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', handleWindowBlur)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleWindowBlur)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [handleFullscreenChange, handleVisibilityChange, handleWindowBlur])

  return {
    isScreenShared,
    isFullscreen,
    fullscreenExits,
    tabSwitches,
    totalTimeAway,
    screenShareContinuity,
    screenShareDisconnections,
    isPaused,
    pauseReason,
    requestScreenShare,
    enterFullscreen,
    startProctoring,
    resumeFullscreen,
    resumeScreenShare,
    clearPause,
    stopProctoring,
    resetStats,
  }
}
