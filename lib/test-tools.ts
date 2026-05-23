// lib/test-tools.ts
// Run with: npx tsx lib/test-tools.ts
import 'dotenv/config'
console.log('YouTube key loaded:', process.env.YOUTUBE_API_KEY ? '✅ YES' : '❌ MISSING')
import { analyzeTopic, generateSubtopics, assignToDays, findResources, createQuiz } from './tools'

async function testAllTools() {
  console.log('\n=== Testing all 5 tools ===\n')

  // Test 1: analyzeTopic
  console.log('1️⃣  analyzeTopic...')
  // Tools expose their execute function directly
  const analysis = await analyzeTopic.execute!(
    { topic: 'Machine Learning', skillLevel: 'beginner' },
    {} as any
  )
  console.log(JSON.stringify(analysis, null, 2))

  // Test 2: generateSubtopics
  console.log('\n2️⃣  generateSubtopics...')
  const subtopics = await generateSubtopics.execute!(
    { topic: 'Machine Learning', skillLevel: 'beginner', totalDays: 7 },
    {} as any
  )
  console.log(JSON.stringify(subtopics, null, 2))

  // Test 3: assignToDays
  console.log('\n3️⃣  assignToDays...')
  const assignments = await assignToDays.execute!(
    {
      subtopics: ['Intro to ML', 'Linear Regression', 'Classification', 'Neural Nets', 'Model Evaluation'],
      totalDays: 5,
      hoursPerDay: 2
    },
    {} as any
  )
  console.log(JSON.stringify(assignments, null, 2))

  // Test 4: findResources (real YouTube API call)
  console.log('\n4️⃣  findResources (YouTube API)...')
  const resources = await findResources.execute!(
    { subtopic: 'Linear Regression', skillLevel: 'beginner' },
    {} as any
  )
  console.log(JSON.stringify(resources, null, 2))

  // Test 5: createQuiz
  console.log('\n5️⃣  createQuiz...')
  const quiz = await createQuiz.execute!(
    { subtopic: 'Linear Regression', skillLevel: 'beginner' },
    {} as any
  )
  console.log(JSON.stringify(quiz, null, 2))

  console.log('\n✅ All tools executed successfully\n')
}

testAllTools().catch(console.error)