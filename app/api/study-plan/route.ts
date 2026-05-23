// app/api/study-plan/route.ts
import { ToolLoopAgent, createAgentUIStreamResponse, stepCountIs } from 'ai'
import { agentModel, agentTools, AGENT_INSTRUCTIONS } from '@/lib/agent'

export const maxDuration = 120

export async function POST(req: Request) {
  const { topic, timeframe, hoursPerDay, skillLevel, regenerate } = await req.json()

  const daysMap: Record<string, number> = {
    '1 week': 7,
    '2 weeks': 14,
    '1 month': 30
  }
  const totalDays = daysMap[timeframe] ?? 7

  const agent = new ToolLoopAgent({
    model: agentModel,
    tools: agentTools,
    stopWhen: stepCountIs(15),
  })

  // Variation prompt — appended only on regenerate
  const variationNote = regenerate
    ? `\n\nIMPORTANT: This is a regeneration request. Use a DIFFERENT approach:
- Choose different subtopic groupings than you would by default
- Vary the pacing (front-load harder content, or build more gradually)
- Pick different YouTube search terms for resources
- Write quiz questions that test different aspects
Make this plan feel meaningfully different from a default response.`
    : ''

  return createAgentUIStreamResponse({
    agent,
    uiMessages: [
      {
        id: `user-${Date.now()}`,
        role: 'user',
        content: `Create a complete study plan for:
- Topic: ${topic}
- Skill Level: ${skillLevel}
- Timeframe: ${timeframe} (${totalDays} days)
- Hours per day: ${hoursPerDay}

Start by calling analyzeTopic, then follow the full sequence.${variationNote}`,
        parts: [
          {
            type: 'text',
            text: `Create a complete study plan for:
- Topic: ${topic}
- Skill Level: ${skillLevel}
- Timeframe: ${timeframe} (${totalDays} days)
- Hours per day: ${hoursPerDay}

Start by calling analyzeTopic, then follow the full sequence.${variationNote}`
          }
        ]
      }
    ],
    options: {
      system: AGENT_INSTRUCTIONS,
      temperature: 0.7,
    }
  })
}