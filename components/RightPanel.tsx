'use client'

import { useState, useEffect } from 'react'
import type { ThinkingStep, StudyPlan } from '@/hooks/useStudyPlanStream'

interface RightPanelProps {
  steps: ThinkingStep[]
  plan: StudyPlan | null
  isStreaming: boolean
  error: string | null
}

function StepIndicator({ status }: { status: ThinkingStep['status'] }) {
  if (status === 'complete') {
    return (
      <span className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center shrink-0">
        <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      </span>
    )
  }
  if (status === 'active') {
    return (
      <span className="w-5 h-5 rounded-full border border-amber-400/50 flex items-center justify-center shrink-0">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
      </span>
    )
  }
  return <span className="w-5 h-5 rounded-full border border-white/10 shrink-0" />
}

function DayCard({ day }: { day: StudyPlan['days'][0] }) {
  const [open, setOpen] = useState(false)
  const [quizOpen, setQuizOpen] = useState<number | null>(null)

  return (
    <div className="border border-white/[0.08] rounded-xl overflow-hidden bg-white/[0.02] hover:bg-white/[0.03] transition-all">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left px-5 py-4 flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs text-amber-400/60 shrink-0">
            DAY {String(day.day).padStart(2, '0')}
          </span>
          <span className="text-sm font-medium text-white/90">{day.subtopic}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs font-mono text-white/20">{day.hoursAllocated}h</span>
          <svg
            className={`w-4 h-4 text-white/30 transition-transform ${open ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-5 border-t border-white/5">

          {day.objectives?.length > 0 && (
            <div className="pt-4 space-y-2">
              <p className="text-xs font-mono text-white/30 uppercase tracking-widest">Objectives</p>
              <ul className="space-y-1.5">
                {day.objectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-white/60">
                    <span className="text-amber-400/60 mt-0.5 shrink-0">→</span>
                    {obj}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {day.resources?.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-mono text-white/30 uppercase tracking-widest">Resources</p>
              <div className="space-y-2">
                {day.resources.map((r, i) => (
                  <a
                  key={i}
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/[0.08] hover:border-amber-400/30 hover:bg-amber-400/5 transition-all group"
                   >
                    <svg className="w-4 h-4 text-red-400/70 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.6 5.8a3 3 0 0 0 2.1 2.1C4.5 20.5 12 20.5 12 20.5s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.8 15.5V8.5l6.3 3.5-6.3 3.5z" />
                    </svg>
                    <div className="min-w-0">
                      <p className="text-sm text-white/70 group-hover:text-white/90 transition-colors truncate">{r.title}</p>
                      <p className="text-xs font-mono text-white/30">{r.channel}</p>
                    </div>
                    <svg className="w-3 h-3 text-white/20 group-hover:text-amber-400/50 ml-auto shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          )}

          {day.quiz?.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-mono text-white/30 uppercase tracking-widest">Quiz</p>
              <div className="space-y-2">
                {day.quiz.map((q, i) => (
                  <div key={i} className="rounded-lg border border-white/[0.08] overflow-hidden">
                    <button
                      onClick={() => setQuizOpen(quizOpen === i ? null : i)}
                      className="w-full text-left px-4 py-3 flex items-start gap-3"
                    >
                      <span className="text-xs font-mono text-amber-400/50 shrink-0 mt-0.5">Q{i + 1}</span>
                      <span className="text-sm text-white/70">{q.question}</span>
                      <svg
                        className={`w-3 h-3 text-white/20 ml-auto shrink-0 mt-1 transition-transform ${quizOpen === i ? 'rotate-180' : ''}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {quizOpen === i && (
                      <div className="px-4 pb-3 border-t border-white/5">
                        <p className="text-sm text-emerald-400/80 font-mono pl-6 pt-2">{q.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function RightPanel({ steps, plan, isStreaming, error }: RightPanelProps) {
  const [thinkingExpanded, setThinkingExpanded] = useState(true)
  const completedSteps = steps.filter(s => s.status === 'complete').length
  const totalSteps = steps.length

  useEffect(() => {
  if (plan) {
    // Small delay so user sees the last step complete before collapsing
    const t = setTimeout(() => setThinkingExpanded(false), 800)
    return () => clearTimeout(t)
  }
}, [plan])

  // Auto-collapse when plan arrives
//   const prevPlanRef = useState<boolean>(false)
//   if (plan && !prevPlanRef[0]) {
//     prevPlanRef[0] = true
//     // We use a ref pattern via useState to trigger collapse once
//   }

  // Derive expanded state: open while streaming, auto-close when plan arrives
  const isThinkingOpen = isStreaming ? true : thinkingExpanded

  // Add this helper at the top of RightPanel component
    const totalDurationMs = steps
    .filter(s => s.durationMs)
    .reduce((sum, s) => sum + (s.durationMs ?? 0), 0)

  return (
    <div className="flex-1 flex flex-col overflow-hidden">

      {/* Thinking stream — collapsible */}
      {steps.length > 0 && (
        <div className={`border-b border-white/5 transition-all ${isThinkingOpen && !plan ? 'flex-shrink-0' : ''}`}>
          {/* Header — always visible, clickable to toggle */}
          <button
            onClick={() => !isStreaming && setThinkingExpanded(v => !v)}
            className="w-full flex items-center justify-between px-6 py-3 hover:bg-white/[0.02] transition-colors"
            disabled={isStreaming}
          >
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-white/30 uppercase tracking-widest">
                Agent Thinking
              </span>
              {isStreaming ? (
                <span className="text-xs font-mono text-amber-400/60 animate-pulse">· live</span>
              ) : (
                <span className="text-xs font-mono text-emerald-400/50">
                  · {completedSteps}/{totalSteps} steps done
                </span>
              )}
            </div>
            {!isStreaming && totalDurationMs > 0 && (
            <span className="text-xs font-mono text-white/20 ml-2">
                · {(totalDurationMs / 1000).toFixed(1)}s total
            </span>
            )}
            {!isStreaming && (
              <svg
                className={`w-4 h-4 text-white/20 transition-transform ${isThinkingOpen ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </button>

          {/* Steps list — collapsible body */}
          {isThinkingOpen && (
            <div className="px-6 pb-4 space-y-2.5 max-h-64 overflow-y-auto">
              {steps.map(step => (
                <div key={step.id} className="flex items-start gap-3">
                  <StepIndicator status={step.status} />
                  <div className="min-w-0">
                    <span className={`text-sm font-mono ${
                      step.status === 'complete' ? 'text-white/50' :
                      step.status === 'active' ? 'text-amber-400' : 'text-white/20'
                    }`}>
                      {step.label}
                    </span>
                    {step.result && (
                      <span className="text-xs font-mono text-white/30 ml-2">— {step.result}</span>
                    )}
                    {step.durationMs && (
                      <span className="text-xs font-mono text-white/20 ml-2">
                        ({(step.durationMs / 1000).toFixed(1)}s)
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="m-6 p-4 rounded-lg border border-red-500/20 bg-red-500/5 text-red-400 text-sm font-mono">
          {error}
        </div>
      )}

      {/* Empty state */}
      {steps.length === 0 && !error && (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
          <div className="w-16 h-16 rounded-2xl border border-white/[0.08] bg-white/[0.02] flex items-center justify-center mb-6">
            <svg className="w-7 h-7 text-amber-400/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.347.347a3.06 3.06 0 01-.53.56A2.985 2.985 0 0112 21a2.985 2.985 0 01-2.337-1.093 3.06 3.06 0 01-.53-.56l-.347-.347z" />
            </svg>
          </div>
          <p className="text-white/30 text-sm font-mono mb-2">Agent ready</p>
          <p className="text-white/15 text-xs max-w-xs">Enter a topic and click Generate Plan to watch the agent think through your personalized curriculum</p>
        </div>
      )}

      {/* Day cards — gets full space when thinking is collapsed */}
      {plan && (
        <div className="flex-1 overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-5">
            <div>
                <h2 className="text-base font-semibold text-white">
                {plan.topic}
                </h2>
                <div className="flex items-center gap-3 mt-1.5">
                <span className={`text-xs font-mono px-2 py-0.5 rounded-full border ${
                    plan.skillLevel === 'beginner'
                    ? 'text-emerald-400/70 border-emerald-400/20 bg-emerald-400/5'
                    : plan.skillLevel === 'intermediate'
                    ? 'text-amber-400/70 border-amber-400/20 bg-amber-400/5'
                    : 'text-red-400/70 border-red-400/20 bg-red-400/5'
                }`}>
                    {plan.skillLevel}
                </span>
                <span className="text-xs font-mono text-white/30">
                    {plan.totalDays} days · {plan.hoursPerDay}h/day · {plan.totalDays * plan.hoursPerDay}h total
                </span>
                </div>
            </div>
            <button
                onClick={() => {
                const blob = new Blob([JSON.stringify(plan, null, 2)], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `study-plan-${plan.topic.toLowerCase().replace(/\s+/g, '-')}.json`
                a.click()
                }}
                className="text-xs font-mono text-white/20 hover:text-amber-400/60 transition-colors border border-white/[0.08] hover:border-amber-400/20 px-3 py-1.5 rounded-lg"
            >
                Export JSON
            </button>
            </div>
            <div className="space-y-3">
            {plan.days.map(day => (
                <DayCard key={day.day} day={day} />
            ))}
            </div>
        </div>
    )}
    </div>
  )
}