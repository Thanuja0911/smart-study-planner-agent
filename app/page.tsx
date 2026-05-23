'use client'

import { useState } from 'react'
import LeftPanel from '@/components/LeftPanel'
import RightPanel from '@/components/RightPanel'
import { useStudyPlanStream } from '@/hooks/useStudyPlanStream'

export default function Home() {
  const [topic, setTopic] = useState('')
  const [timeframe, setTimeframe] = useState('1 week')
  const [hoursPerDay, setHoursPerDay] = useState(2)
  const [skillLevel, setSkillLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner')

  const { steps, plan, isStreaming, error, generate, regenerate } = useStudyPlanStream()

  const handleGenerate = () => {
    if (!topic.trim()) return
    generate({ topic, timeframe, hoursPerDay, skillLevel })
  }

  const handleRegenerate = () => {
    if (!topic.trim()) return
    regenerate({ topic, timeframe, hoursPerDay, skillLevel })
  }

  return (
    <main className="min-h-screen bg-[#0c0c0e] text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Subtle grid background */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(251,191,36,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(251,191,36,0.03) 1px, transparent 1px)',
        backgroundSize: '48px 48px'
      }} />

      {/* Header */}
      <header className="relative border-b border-white/5 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-xs font-mono text-amber-400/70 tracking-widest uppercase">Study Planner Agent</span>
        </div>
        <span className="text-xs font-mono text-white/20">Week 3 · LLM Engineering Roadmap 2026</span>
      </header>

      {/* Two-panel layout */}
      <div className="relative flex h-[calc(100vh-57px)]">
        <LeftPanel
          topic={topic}
          setTopic={setTopic}
          timeframe={timeframe}
          setTimeframe={setTimeframe}
          hoursPerDay={hoursPerDay}
          setHoursPerDay={setHoursPerDay}
          skillLevel={skillLevel}
          setSkillLevel={setSkillLevel}
          onGenerate={handleGenerate}
          onRegenerate={handleRegenerate}
          isStreaming={isStreaming}
          hasPlan={!!plan}
        />
        <RightPanel
          steps={steps}
          plan={plan}
          isStreaming={isStreaming}
          error={error}
        />
      </div>

      {/* Google Font */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@300;400;500&display=swap" rel="stylesheet" />
    </main>
  )
}