'use client'

import { useState, useCallback } from 'react'

export interface ThinkingStep {
  id: string
  toolName: string
  label: string
  status: 'pending' | 'active' | 'complete'
  result?: string
  durationMs?: number
  startedAt?: number
}

export interface DayPlan {
  day: number
  subtopic: string
  objectives: string[]
  resources: { title: string; url: string; channel: string }[]
  quiz: { question: string; answer: string }[]
  hoursAllocated: number
}

export interface StudyPlan {
  topic: string
  skillLevel: string
  totalDays: number
  hoursPerDay: number
  days: DayPlan[]
}

const TOOL_LABELS: Record<string, string> = {
  analyzeTopic: 'Analyzing topic scope and complexity',
  generateSubtopics: 'Breaking topic into ordered subtopics',
  assignToDays: 'Assigning subtopics to daily schedule',
  findResources: 'Finding YouTube resources',
  createQuiz: 'Generating quiz questions',
}

export function useStudyPlanStream() {
  const [steps, setSteps] = useState<ThinkingStep[]>([])
  const [plan, setPlan] = useState<StudyPlan | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generate = useCallback(async (params: {
    topic: string
    timeframe: string
    hoursPerDay: number
    skillLevel: string
    }, isRegenerate = false) => {   // add isRegenerate param
    setSteps([])
    setPlan(null)
    setError(null)
    setIsStreaming(true)

    const toolCallMap: Record<string, string> = {}
    const activeStepTimes: Record<string, number> = {}

    // Collect all tool outputs — we build the plan from these
    const toolOutputs: Record<string, unknown[]> = {
      analyzeTopic: [],
      generateSubtopics: [],
      assignToDays: [],
      findResources: [],
      createQuiz: [],
    }

    try {
        const response = await fetch('/api/study-plan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...params, regenerate: isRegenerate })
        })

      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      if (!response.body) throw new Error('No response body')

      const reader = response.body
        .pipeThrough(new TextDecoderStream())
        .getReader()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const lines = value.split('\n')

        for (const line of lines) {
          if (!line.startsWith('data:')) continue
          const raw = line.slice(5).trim()
          if (!raw || raw === '[DONE]') continue

          let parsed: Record<string, unknown>
          try { parsed = JSON.parse(raw) } catch { continue }

          const type = parsed.type as string

          // Tool started
          if (type === 'tool-input-start') {
            const toolName = (parsed.toolName ?? '') as string
            const toolCallId = (parsed.toolCallId ?? '') as string
            toolCallMap[toolCallId] = toolName
            activeStepTimes[toolCallId] = Date.now()

            setSteps(prev => [...prev, {
              id: toolCallId,
              toolName,
              label: TOOL_LABELS[toolName] ?? toolName,
              status: 'active',
              startedAt: Date.now()
            }])
          }

          // Tool completed — store result + mark complete
          if (type === 'tool-output-available') {
            const toolCallId = (parsed.toolCallId ?? '') as string
            const toolName = toolCallMap[toolCallId] ?? ''
            const output = parsed.output
            const durationMs = activeStepTimes[toolCallId]
              ? Date.now() - activeStepTimes[toolCallId]
              : undefined

            // Store every tool output by tool name
            if (toolName && toolOutputs[toolName]) {
              toolOutputs[toolName].push(output)
            }

            let resultSummary = ''
            if (toolName === 'analyzeTopic' && output && typeof output === 'object') {
              const r = output as Record<string, unknown>
              resultSummary = `"${r.topic}" — ${r.complexity} complexity`
            } else if (toolName === 'generateSubtopics' && output && typeof output === 'object') {
              const r = output as Record<string, unknown>
              resultSummary = `${r.subtopicCount} subtopics generated`
            } else if (toolName === 'assignToDays' && output && typeof output === 'object') {
              const r = output as Record<string, unknown>
              resultSummary = `${r.totalDaysAssigned} days scheduled`
            } else if (toolName === 'findResources' && output && typeof output === 'object') {
              const r = output as Record<string, unknown>
              resultSummary = `Resources found for "${r.subtopic}"`
            } else if (toolName === 'createQuiz' && output && typeof output === 'object') {
              const r = output as Record<string, unknown>
              resultSummary = `3 questions for "${r.subtopic}"`
            }

            setSteps(prev => {
              const idx = prev.findIndex(s => s.id === toolCallId)
              if (idx === -1) return prev
              const updated = [...prev]
              updated[idx] = {
                ...updated[idx],
                status: 'complete',
                result: resultSummary,
                durationMs
              }
              return updated
            })
          }

          // Stream finished — assemble plan from tool outputs
          if (type === 'finish') {
            const analyze = toolOutputs.analyzeTopic[0] as Record<string, unknown> | undefined
            const assign = toolOutputs.assignToDays[0] as {
              assignments: Array<{ day: number; subtopic: string; hoursAllocated: number; objectives: string[] }>
              totalDaysAssigned: number
            } | undefined

            if (!assign?.assignments?.length) {
              console.warn('[plan] No assignment data found in tool outputs')
              break
            }

            // Build a lookup: subtopic name → resources + quiz
            const resourcesBySubtopic: Record<string, { title: string; url: string; channel: string }[]> = {}
            for (const r of toolOutputs.findResources as Array<{ subtopic: string; resources: { title: string; url: string; channel: string }[] }>) {
              if (r?.subtopic) resourcesBySubtopic[r.subtopic] = r.resources ?? []
            }

            const quizBySubtopic: Record<string, { question: string; answer: string }[]> = {}
            for (const q of toolOutputs.createQuiz as Array<{ subtopic: string; questions: { question: string; answer: string }[] }>) {
              if (q?.subtopic) quizBySubtopic[q.subtopic] = q.questions ?? []
            }

            // Match resources/quiz to assignments by closest subtopic name
            const days: DayPlan[] = assign.assignments.map(a => {
              // Find best matching key in resourcesBySubtopic
              const resourceKey = Object.keys(resourcesBySubtopic).find(k =>
                k.toLowerCase().includes(a.subtopic.toLowerCase().split(' ')[0]) ||
                a.subtopic.toLowerCase().includes(k.toLowerCase().split(' ')[0])
              ) ?? Object.keys(resourcesBySubtopic)[a.day - 1] ?? ''

              const quizKey = Object.keys(quizBySubtopic).find(k =>
                k.toLowerCase().includes(a.subtopic.toLowerCase().split(' ')[0]) ||
                a.subtopic.toLowerCase().includes(k.toLowerCase().split(' ')[0])
              ) ?? Object.keys(quizBySubtopic)[a.day - 1] ?? ''

              return {
                day: a.day,
                subtopic: a.subtopic,
                objectives: a.objectives ?? [],
                resources: resourcesBySubtopic[resourceKey] ?? [],
                quiz: quizBySubtopic[quizKey] ?? [],
                hoursAllocated: a.hoursAllocated ?? params.hoursPerDay
              }
            })

            const builtPlan: StudyPlan = {
              topic: (analyze?.topic as string) ?? params.topic,
              skillLevel: params.skillLevel,
              totalDays: assign.totalDaysAssigned,
              hoursPerDay: params.hoursPerDay,
              days
            }

            console.log('[plan built from tools]', builtPlan)
            setPlan(builtPlan)
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsStreaming(false)
    }
  }, [])

    const regenerate = useCallback((params: Parameters<typeof generate>[0]) => {
    return generate(params, true)  // pass regenerate=true
    }, [generate])

  return { steps, plan, isStreaming, error, generate, regenerate }
}