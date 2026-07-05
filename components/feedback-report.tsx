'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'
import { RotateCcw, Download, ShieldAlert, Award, FileText, CheckCircle, XCircle, Terminal, HelpCircle, LayoutDashboard } from 'lucide-react'

interface FeedbackReportProps {
  feedback: {
    id?: string
    overallScore: number
    weightedBreakdown: {
      technical: number
      project: number
      hr: number
      communication: number
      coding: number
    }
    technicalRating: number
    communicationRating: number
    summary: string
    strengths: string[]
    weaknesses: string[]
    tips: string[]
    communicationDetails?: {
      averageWpm: number
      fillerCount: number
      mispronounced: string[]
      exercises: string[]
    }
    codingDetails?: {
      problem: string
      correctness: boolean
      complexity: string
      score: number
      codeQuality: string
      optimalSolution: string
    }[]
    integrity?: {
      fullscreenExits: number
      tabSwitches: number
      totalTimeAway: number
      screenShareContinuity: 'continuous' | 'interrupted'
      screenShareDisconnections?: number
      disqualified?: boolean
      disqualificationReason?: string
    }
  }
  onStartNew: () => void
}

export function FeedbackReport({ feedback, onStartNew }: FeedbackReportProps) {
  useEffect(() => {
    if (feedback.integrity?.disqualified) return // Skip confetti if disqualified
    // Trigger confetti on mount
    const duration = 2000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min
    }

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.9), y: Math.random() - 0.2 },
      })
    }, 250)

    return () => clearInterval(interval)
  }, [])

  const radarData = [
    {
      subject: 'Tech Q&A',
      value: feedback.weightedBreakdown.technical,
      fullMark: 100,
    },
    {
      subject: 'Projects',
      value: feedback.weightedBreakdown.project,
      fullMark: 100,
    },
    {
      subject: 'Behavioral/HR',
      value: feedback.weightedBreakdown.hr,
      fullMark: 100,
    },
    {
      subject: 'Communication',
      value: feedback.weightedBreakdown.communication,
      fullMark: 100,
    },
    {
      subject: 'Coding DSA',
      value: feedback.weightedBreakdown.coding,
      fullMark: 100,
    },
  ]

  const handleDownload = () => {
    const reportText = `
ELEVATE AI INTERVIEWER ASSESSMENT REPORT
=========================================

OVERALL COMPOSITE SCORE: ${feedback.overallScore}/100

SECTION RATINGS (Out of 100):
- Technical Q&A: ${feedback.weightedBreakdown.technical}/100
- Project Deep-Dive: ${feedback.weightedBreakdown.project}/100
- Behavioral/HR: ${feedback.weightedBreakdown.hr}/100
- Voice & Communication: ${feedback.weightedBreakdown.communication}/100
- Coding DSA: ${feedback.weightedBreakdown.coding}/100

-----------------------------------------
EXECUTIVE SUMMARY:
${feedback.summary}

-----------------------------------------
KEY STRENGTHS:
${feedback.strengths.map((s, i) => `${i + 1}. ${s}`).join('\n')}

-----------------------------------------
AREAS FOR IMPROVEMENT:
${feedback.weaknesses.map((w, i) => `${i + 1}. ${w}`).join('\n')}

-----------------------------------------
TIPS FOR NEXT INTERVIEW:
${feedback.tips.map((t, i) => `${i + 1}. ${t}`).join('\n')}

-----------------------------------------
COMMUNICATION ASSESSMENT:
- Average Pace: ${feedback.communicationDetails?.averageWpm || 0} WPM
- Filler Word Count: ${feedback.communicationDetails?.fillerCount || 0}
- Mispronounced Words: ${feedback.communicationDetails?.mispronounced.join(', ') || 'None'}
- Suggested Exercises:
${feedback.communicationDetails?.exercises.map((e, i) => `  * ${e}`).join('\n') || 'None'}

-----------------------------------------
CODING ASSESSMENT DETAIL:
${feedback.codingDetails?.map((item, idx) => `
Problem ${idx + 1}: ${item.problem}
- Correctness: ${item.correctness ? 'PASSED' : 'FAILED'}
- Complexity: ${item.complexity}
- Score: ${item.score}/10
- Code Quality Review: ${item.codeQuality}
`).join('\n') || 'None'}

-----------------------------------------
INTEGRITY & PROCTORING SUMMARY:
- Fullscreen Exits: ${feedback.integrity?.fullscreenExits || 0}
- Tab Switches: ${feedback.integrity?.tabSwitches || 0}
- Time Away: ${feedback.integrity?.totalTimeAway || 0} seconds
- Screen Share: ${feedback.integrity?.screenShareContinuity === 'continuous' ? 'Stable Connection' : 'Interrupted Connection'}
    `.trim()

    const element = document.createElement('a')
    element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(reportText)}`)
    element.setAttribute('download', 'interview-assessment-report.txt')
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background py-8 px-4"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Top Header Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center space-y-2"
        >
          {feedback.integrity?.disqualified ? (
            <div className="relative inline-block py-2">
              <ShieldAlert className="w-16 h-16 text-destructive mx-auto animate-pulse" />
              <div className="absolute inset-0 bg-destructive/20 rounded-full blur-xl animate-pulse" />
            </div>
          ) : (
            <Award className="w-16 h-16 text-primary mx-auto animate-bounce" />
          )}
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {feedback.integrity?.disqualified ? 'Assessment Disqualified' : 'Interview Assessment Report'}
          </h1>
          <p className="text-muted-foreground text-base max-w-xl mx-auto">
            {feedback.integrity?.disqualified 
              ? 'This session was automatically terminated due to multiple proctoring/integrity violations.'
              : 'Review detailed execution scores, communication metrics, coding complexities, and integrity logs.'
            }
          </p>
        </motion.div>

        {/* Proctoring Warning Banner */}
        {feedback.integrity?.disqualified && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-5 border border-destructive/50 bg-destructive/10 rounded-xl space-y-2 text-destructive-foreground"
          >
            <div className="flex items-center gap-2 font-bold text-lg text-red-500">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
              <span>Critical Proctoring Termination Notice</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The candidate was automatically disqualified because they exceeded the proctoring thresholds. Specifically: 
              <strong className="text-red-400"> {feedback.integrity.disqualificationReason}</strong>. 
              Subsequent sections of this report reflect metrics captured prior to the termination.
            </p>
          </motion.div>
        )}

        {/* Compound Score dashboard Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Composite Score Card */}
          <Card className={`border-border/50 bg-card/70 backdrop-blur-sm p-6 text-center space-y-4 ${
            feedback.integrity?.disqualified ? 'border-destructive/45 bg-destructive/5 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : ''
          }`}>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {feedback.integrity?.disqualified ? 'Assessment Status' : 'Overall Composite Score'}
            </h3>
            {feedback.integrity?.disqualified ? (
              <div className="text-3xl sm:text-4xl font-black text-red-500 animate-pulse tracking-wide font-mono py-3">
                DISQUALIFIED
              </div>
            ) : (
              <div className="text-6xl font-extrabold text-primary">
                {feedback.overallScore}
                <span className="text-3xl text-muted-foreground">/100</span>
              </div>
            )}
            <div className="w-full bg-muted rounded-full h-3">
              <div
                className={`rounded-full h-3 transition-all duration-1000 ${
                  feedback.integrity?.disqualified ? 'bg-destructive' : 'bg-primary'
                }`}
                style={{ width: feedback.integrity?.disqualified ? '100%' : `${feedback.overallScore}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground font-mono">
              {feedback.integrity?.disqualified 
                ? 'Integrity Check: FAILED' 
                : 'Weighted: Tech Q&A (40%), Projects (15%), HR (10%), Voice (20%), Coding (15%)'
              }
            </p>
          </Card>

          {/* Section Score Breakdown */}
          <Card className="md:col-span-2 border-border/50 bg-card/70 backdrop-blur-sm p-6 space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Section Breakdown
            </h3>
            <div className="space-y-3 font-mono text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span>Technical Q&A</span>
                  <span>{feedback.weightedBreakdown.technical}/100</span>
                </div>
                <div className="w-full bg-muted h-2 rounded-full">
                  <div className="bg-accent h-2 rounded-full" style={{ width: `${feedback.weightedBreakdown.technical}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span>Project Deep-Dive</span>
                  <span>{feedback.weightedBreakdown.project}/100</span>
                </div>
                <div className="w-full bg-muted h-2 rounded-full">
                  <div className="bg-accent h-2 rounded-full" style={{ width: `${feedback.weightedBreakdown.project}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span>Behavioral / HR</span>
                  <span>{feedback.weightedBreakdown.hr}/100</span>
                </div>
                <div className="w-full bg-muted h-2 rounded-full">
                  <div className="bg-accent h-2 rounded-full" style={{ width: `${feedback.weightedBreakdown.hr}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span>Voice & Communication</span>
                  <span>{feedback.weightedBreakdown.communication}/100</span>
                </div>
                <div className="w-full bg-muted h-2 rounded-full">
                  <div className="bg-accent h-2 rounded-full" style={{ width: `${feedback.weightedBreakdown.communication}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span>Coding Round</span>
                  <span>{feedback.weightedBreakdown.coding}/100</span>
                </div>
                <div className="w-full bg-muted h-2 rounded-full">
                  <div className="bg-accent h-2 rounded-full" style={{ width: `${feedback.weightedBreakdown.coding}%` }} />
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {feedback.id && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
          >
            <Card className="border-border/50 bg-card/70 backdrop-blur-sm p-6 text-center space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Shareable Report Link
              </h3>
              <div className="flex gap-2 justify-center items-center font-mono text-xs bg-background/50 border border-border/50 p-3 rounded-lg max-w-xl mx-auto flex-wrap">
                <span className="truncate max-w-xs sm:max-w-md">
                  {typeof window !== 'undefined' ? `${window.location.origin}/?reportId=${feedback.id}` : ''}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      navigator.clipboard.writeText(`${window.location.origin}/?reportId=${feedback.id}`)
                      alert('Shareable report link copied to clipboard!')
                    }
                  }}
                  className="text-primary hover:text-primary-foreground hover:bg-primary font-semibold text-xs"
                >
                  Copy Link
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Executive Summary & Radar Diagram */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-border/50 bg-card/70 backdrop-blur-sm p-6 space-y-4">
            <h2 className="text-xl font-bold text-foreground">Executive Assessment</h2>
            <p className="text-sm text-foreground/90 leading-relaxed">
              {feedback.summary}
            </p>
            
            <div className="space-y-2 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Top 3 Priorities Before Next Interview</h3>
              <ul className="space-y-2 text-xs">
                {feedback.tips.map((tip, idx) => (
                  <li key={idx} className="flex gap-2 text-foreground/95">
                    <span className="font-bold text-primary">{idx + 1}.</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>

          <Card className="border-border/50 bg-card/70 backdrop-blur-sm p-6 flex flex-col justify-center items-center">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider self-start mb-4">
              Competency Radar
            </h2>
            <div className="w-full h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--muted-foreground))" opacity={0.15} />
                  <PolarAngleAxis dataKey="subject" stroke="hsl(var(--muted-foreground))" style={{ fontSize: '11px' }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="hsl(var(--muted-foreground))" />
                  <Radar
                    name="Competency"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.4}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Detailed Sections: Strengths / Weaknesses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Strengths */}
          <Card className="border-border/50 bg-card/70 backdrop-blur-sm p-6 border-l-4 border-l-primary space-y-4">
            <h2 className="text-lg font-bold text-foreground">Core Strengths</h2>
            <ul className="space-y-3">
              {feedback.strengths.map((str, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-foreground/95">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Weaknesses / Gaps */}
          <Card className="border-border/50 bg-card/70 backdrop-blur-sm p-6 border-l-4 border-l-accent space-y-4">
            <h2 className="text-lg font-bold text-foreground">Technical & Skill Gaps</h2>
            <ul className="space-y-3">
              {feedback.weaknesses.map((weak, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-foreground/95">
                  <HelpCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span>{weak}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Communication assessment details */}
        {feedback.communicationDetails && (
          <Card className="border-border/50 bg-card/70 backdrop-blur-sm p-6 space-y-6">
            <h2 className="text-xl font-bold text-foreground">Communication & Voice Analysis</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center font-mono">
              <div className="p-4 bg-background/50 border border-border/50 rounded-xl">
                <p className="text-xs text-muted-foreground uppercase mb-1">Average Pace</p>
                <p className="text-2xl font-bold text-primary">{feedback.communicationDetails.averageWpm} WPM</p>
                <p className="text-[10px] text-muted-foreground mt-1">Goal: 110 - 140 WPM</p>
              </div>

              <div className="p-4 bg-background/50 border border-border/50 rounded-xl">
                <p className="text-xs text-muted-foreground uppercase mb-1">Filler Word Usage</p>
                <p className="text-2xl font-bold text-primary">{feedback.communicationDetails.fillerCount}</p>
                <p className="text-[10px] text-muted-foreground mt-1">um, uh, like, you know</p>
              </div>

              <div className="p-4 bg-background/50 border border-border/50 rounded-xl">
                <p className="text-xs text-muted-foreground uppercase mb-1">Mispronounced Words</p>
                <p className="text-sm font-bold text-primary truncate">
                  {feedback.communicationDetails.mispronounced.length > 0
                    ? feedback.communicationDetails.mispronounced.join(', ')
                    : 'None Identified'}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">Review clarity patterns</p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Targeted Speech Training Exercises</h3>
              <ul className="space-y-2 text-xs font-mono">
                {feedback.communicationDetails.exercises.map((ex, idx) => (
                  <li key={idx} className="p-3 bg-accent/5 border border-accent/10 rounded-lg text-foreground/90">
                    * {ex}
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        )}

        {/* Coding Assessment details */}
        {feedback.codingDetails && feedback.codingDetails.length > 0 && (
          <Card className="border-border/50 bg-card/70 backdrop-blur-sm p-6 space-y-6">
            <h2 className="text-xl font-bold text-foreground">Coding Round Assessments</h2>
            <div className="space-y-6 font-mono text-xs">
              {feedback.codingDetails.map((codeItem, idx) => (
                <div key={idx} className="p-4 bg-background/50 border border-border/50 rounded-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-border/50 pb-2">
                    <span className="font-bold text-sm text-foreground">{codeItem.problem}</span>
                    <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                      codeItem.correctness ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10'
                    }`}>
                      {codeItem.correctness ? 'SUCCESS' : 'FAILED'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-muted-foreground uppercase text-[10px]">Algorithm Complexity</p>
                      <p className="font-bold text-primary">{codeItem.complexity}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground uppercase text-[10px]">Code Score</p>
                      <p className="font-bold text-primary">{codeItem.score}/10</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-muted-foreground uppercase text-[10px] mb-1">Code Quality Review</p>
                    <p className="text-foreground/90 leading-relaxed">{codeItem.codeQuality}</p>
                  </div>

                  <div>
                    <p className="text-muted-foreground uppercase text-[10px] mb-1">Optimal Approach</p>
                    <pre className="p-3 bg-black/80 rounded-lg text-green-400 overflow-x-auto whitespace-pre">
                      {codeItem.optimalSolution}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Proctoring & Integrity Summary */}
        {feedback.integrity && (
          <Card className={`backdrop-blur-sm p-6 border-l-4 space-y-4 ${
            feedback.integrity.disqualified 
              ? 'border-destructive/60 border border-l-destructive bg-destructive/5 shadow-[0_0_20px_rgba(239,68,68,0.15)] animate-pulse'
              : 'border-border/50 bg-card/70 border-l-destructive'
          }`}>
            <div className={`flex items-center gap-3 ${feedback.integrity.disqualified ? 'text-red-500 font-bold' : 'text-destructive'}`}>
              <ShieldAlert className="w-6 h-6 animate-pulse" />
              <h2 className="text-lg font-bold">
                Proctoring & Integrity Summary {feedback.integrity.disqualified && '— DISQUALIFIED'}
              </h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center text-xs font-mono">
              <div className={`p-3 bg-background/50 border rounded-lg ${
                feedback.integrity.disqualified && feedback.integrity.fullscreenExits > 3 
                  ? 'border-destructive/50 bg-destructive/10 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.15)]' 
                  : 'border-border/50 text-foreground'
              }`}>
                <p className="text-[10px] text-muted-foreground uppercase">Fullscreen Exits</p>
                <p className="text-lg font-bold">{feedback.integrity.fullscreenExits}</p>
                {feedback.integrity.disqualified && feedback.integrity.fullscreenExits > 3 && (
                  <span className="text-[9px] font-bold text-red-500 uppercase block mt-1">(Limit Exceeded)</span>
                )}
              </div>

              <div className={`p-3 bg-background/50 border rounded-lg ${
                feedback.integrity.disqualified && feedback.integrity.tabSwitches > 2 
                  ? 'border-destructive/50 bg-destructive/10 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.15)]' 
                  : 'border-border/50 text-foreground'
              }`}>
                <p className="text-[10px] text-muted-foreground uppercase">Tab Switches</p>
                <p className="text-lg font-bold">{feedback.integrity.tabSwitches}</p>
                {feedback.integrity.disqualified && feedback.integrity.tabSwitches > 2 && (
                  <span className="text-[9px] font-bold text-red-500 uppercase block mt-1">(Limit Exceeded)</span>
                )}
              </div>

              <div className={`p-3 bg-background/50 border rounded-lg ${
                feedback.integrity.disqualified && (feedback.integrity.screenShareDisconnections || 0) > 3 
                  ? 'border-destructive/50 bg-destructive/10 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.15)]' 
                  : 'border-border/50 text-foreground'
              }`}>
                <p className="text-[10px] text-muted-foreground uppercase">Screen Share Stops</p>
                <p className="text-lg font-bold">{feedback.integrity.screenShareDisconnections || 0}</p>
                {feedback.integrity.disqualified && (feedback.integrity.screenShareDisconnections || 0) > 3 && (
                  <span className="text-[9px] font-bold text-red-500 uppercase block mt-1">(Limit Exceeded)</span>
                )}
              </div>

              <div className="p-3 bg-background/50 border border-border/50 rounded-lg text-foreground">
                <p className="text-[10px] text-muted-foreground uppercase">Time Away</p>
                <p className="text-lg font-bold">{feedback.integrity.totalTimeAway}s</p>
              </div>

              <div className="p-3 bg-background/50 border border-border/50 rounded-lg text-foreground">
                <p className="text-[10px] text-muted-foreground uppercase">Screen Share</p>
                <p className={`text-xs font-bold ${
                  feedback.integrity.screenShareContinuity === 'continuous' ? 'text-green-500' : 'text-red-500'
                }`}>
                  {feedback.integrity.screenShareContinuity === 'continuous' ? 'STABLE' : 'INTERRUPTED'}
                </p>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed italic">
              Note: This is a factual log representing tab focus events and share session status, used to verify focus stability.
            </p>
          </Card>
        )}

        {/* Action Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            onClick={handleDownload}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download Full Assessment Report
          </Button>
          <Button
            onClick={onStartNew}
            className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2 font-semibold"
          >
            <LayoutDashboard className="w-4 h-4" />
            Return to Dashboard
          </Button>
        </motion.div>

      </div>
    </motion.div>
  )
}
