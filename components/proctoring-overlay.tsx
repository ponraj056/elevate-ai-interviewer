'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShieldAlert, Maximize, Monitor, Play } from 'lucide-react'

interface ProctoringOverlayProps {
  pauseReason: 'fullscreen' | 'tab_switch' | 'screen_share' | null
  onResumeFullscreen: () => void
  onResumeScreenShare: () => void
  onClearPause: () => void
}

export function ProctoringOverlay({
  pauseReason,
  onResumeFullscreen,
  onResumeScreenShare,
  onClearPause,
}: ProctoringOverlayProps) {
  if (!pauseReason) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="max-w-md w-full p-8 border-destructive/50 bg-card/90 shadow-2xl space-y-6 text-center">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
              <ShieldAlert className="w-8 h-8" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Interview Paused
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {pauseReason === 'fullscreen' &&
                'Fullscreen mode was exited. To ensure test integrity, you must remain in fullscreen mode during the interview.'}
              {pauseReason === 'screen_share' &&
                'Screen sharing was disconnected. You must share your screen to continue the interview.'}
              {pauseReason === 'tab_switch' &&
                'You switched tabs or left the active interview window. Please focus back and resume.'}
            </p>
          </div>

          <div className="pt-2">
            {pauseReason === 'fullscreen' && (
              <Button
                onClick={onResumeFullscreen}
                className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground flex items-center justify-center gap-2"
              >
                <Maximize className="w-4 h-4" />
                Return to Fullscreen
              </Button>
            )}
            {pauseReason === 'screen_share' && (
              <Button
                onClick={onResumeScreenShare}
                className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground flex items-center justify-center gap-2"
              >
                <Monitor className="w-4 h-4" />
                Restart Screen Share
              </Button>
            )}
            {pauseReason === 'tab_switch' && (
              <Button
                onClick={onClearPause}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" />
                Resume Interview
              </Button>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
