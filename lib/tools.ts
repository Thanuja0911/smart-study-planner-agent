import { tool } from 'ai'
import { z } from 'zod'

// ─────────────────────────────────────────────
// TOOL 1: analyzeTopic
// Claude calls this first to understand scope
// ─────────────────────────────────────────────
export const analyzeTopic = tool({
  description: 'Analyze a learning topic and identify its scope, prerequisites, and complexity for a given skill level',
  inputSchema: z.object({
    topic: z.string(),
    skillLevel: z.enum(['beginner', 'intermediate', 'advanced'])
  }),
  execute: async ({ topic, skillLevel }) => {
    // This tool uses Claude's own knowledge — no external API needed.
    // We return a structured object that the next tool (generateSubtopics) can use.
    const complexityMap = {
      beginner: 'foundational',
      intermediate: 'applied',
      advanced: 'expert'
    }

    return {
      topic,
      skillLevel,
      complexity: complexityMap[skillLevel],
      estimatedSubtopics: skillLevel === 'beginner' ? 5 : skillLevel === 'intermediate' ? 7 : 9,
      prerequisites: skillLevel === 'beginner'
        ? ['No prior experience needed']
        : skillLevel === 'intermediate'
        ? ['Basic understanding of fundamentals']
        : ['Strong foundational knowledge required'],
      analysisNote: `Topic "${topic}" analyzed for ${skillLevel} level. Proceeding to generate subtopics.`
    }
  }
})

// ─────────────────────────────────────────────
// TOOL 2: generateSubtopics
// Breaks topic into ordered learning units
// ─────────────────────────────────────────────
export const generateSubtopics = tool({
  description: 'Break a topic into ordered subtopics from foundational to advanced, appropriate for the skill level',
  inputSchema: z.object({
    topic: z.string(),
    skillLevel: z.enum(['beginner', 'intermediate', 'advanced']),
    totalDays: z.number()
  }),
  execute: async ({ topic, skillLevel, totalDays }) => {
    // We return a placeholder structure here.
    // The AGENT (Claude) will actually populate this with real subtopics
    // in its reasoning — this tool signals to Claude what shape to produce.
    // Claude fills in the actual content using its knowledge.
    const count = Math.min(totalDays, skillLevel === 'beginner' ? 5 : skillLevel === 'intermediate' ? 7 : 9)

    return {
      topic,
      totalDays,
      subtopicCount: count,
      subtopics: Array.from({ length: count }, (_, i) => ({
        index: i + 1,
        name: `Subtopic ${i + 1} for ${topic}`,
        estimatedHours: skillLevel === 'beginner' ? 2 : skillLevel === 'intermediate' ? 3 : 4,
        difficulty: i < count / 3 ? 'foundational' : i < (2 * count) / 3 ? 'intermediate' : 'advanced'
      })),
      note: 'Claude will replace placeholder subtopic names with real topic-specific content in final output'
    }
  }
})

// ─────────────────────────────────────────────
// TOOL 3: assignToDays
// Maps subtopics → specific calendar days
// ─────────────────────────────────────────────
export const assignToDays = tool({
  description: 'Assign subtopics to specific days based on available hours and complexity',
  inputSchema: z.object({
    subtopics: z.array(z.string()),
    totalDays: z.number(),
    hoursPerDay: z.number()
  }),
  execute: async ({ subtopics, totalDays, hoursPerDay }) => {
    const assignments: Array<{
      day: number
      subtopic: string
      hoursAllocated: number
      objectives: string[]
    }> = []

    const daysToUse = Math.min(subtopics.length, totalDays)

    for (let i = 0; i < daysToUse; i++) {
      assignments.push({
        day: i + 1,
        subtopic: subtopics[i],
        hoursAllocated: hoursPerDay,
        objectives: [
          `Understand core concepts of ${subtopics[i]}`,
          `Practice with hands-on examples`,
          `Complete the day's quiz`
        ]
      })
    }

    return {
      totalDaysAssigned: daysToUse,
      hoursPerDay,
      totalHours: daysToUse * hoursPerDay,
      assignments
    }
  }
})

// ─────────────────────────────────────────────
// TOOL 4: findResources
// THE REAL EXTERNAL TOOL — calls YouTube API
// This is what makes this an agent, not a chatbot
// ─────────────────────────────────────────────
export const findResources = tool({
  description: 'Find real YouTube video resources for a specific subtopic using YouTube API',
  inputSchema: z.object({
    subtopic: z.string(),
    skillLevel: z.enum(['beginner', 'intermediate', 'advanced'])
  }),
  execute: async ({ subtopic, skillLevel }) => {
    const apiKey = process.env.YOUTUBE_API_KEY

    if (!apiKey) {
      return {
        subtopic,
        resources: [
          {
            title: 'YouTube API key not configured',
            url: 'https://youtube.com',
            channel: 'N/A',
            duration: 'N/A'
          }
        ],
        error: 'YOUTUBE_API_KEY missing from environment'
      }
    }

    try {
      const query = encodeURIComponent(`${subtopic} ${skillLevel} tutorial`)
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&maxResults=2&videoDuration=medium&key=${apiKey}`

      const response = await fetch(url)

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err?.error?.message || 'YouTube API error')
      }

      const data = await response.json()

      const resources = (data.items || []).map((item: {
        id: { videoId: string }
        snippet: { title: string; channelTitle: string }
      }) => ({
        title: item.snippet.title,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        channel: item.snippet.channelTitle,
        duration: 'Watch on YouTube'
      }))

      return {
        subtopic,
        resources: resources.length > 0 ? resources : [{
          title: `Search: ${subtopic} ${skillLevel} tutorial`,
          url: `https://www.youtube.com/results?search_query=${query}`,
          channel: 'YouTube Search',
          duration: 'Various'
        }]
      }
    } catch (error) {
      // Graceful fallback — never crash the agent loop over a resource lookup
      return {
        subtopic,
        resources: [{
          title: `${subtopic} — ${skillLevel} tutorial`,
          url: `https://www.youtube.com/results?search_query=${encodeURIComponent(subtopic + ' ' + skillLevel)}`,
          channel: 'YouTube Search',
          duration: 'Various'
        }],
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
})

// ─────────────────────────────────────────────
// TOOL 5: createQuiz
// Generates 3 questions to test understanding
// ─────────────────────────────────────────────
export const createQuiz = tool({
  description: 'Generate 3 quiz questions with answers for a subtopic to test understanding',
  inputSchema: z.object({
    subtopic: z.string(),
    skillLevel: z.enum(['beginner', 'intermediate', 'advanced'])
  }),
  execute: async ({ subtopic, skillLevel }) => {
    // Like analyzeTopic, this scaffolds the shape.
    // Claude populates it with real questions in the final text output.
    return {
      subtopic,
      skillLevel,
      questions: [
        {
          id: 1,
          question: `What is the core concept behind ${subtopic}?`,
          answer: `Claude will generate a specific answer for ${subtopic} at ${skillLevel} level`,
          difficulty: 'recall'
        },
        {
          id: 2,
          question: `How would you apply ${subtopic} in a real-world scenario?`,
          answer: `Claude will generate a practical ${skillLevel}-appropriate answer`,
          difficulty: 'application'
        },
        {
          id: 3,
          question: `What is a common mistake when learning ${subtopic}, and how do you avoid it?`,
          answer: `Claude will generate a ${skillLevel}-specific pitfall and solution`,
          difficulty: 'analysis'
        }
      ],
      note: 'Claude replaces placeholder answers with real content in final structured output'
    }
  }
})