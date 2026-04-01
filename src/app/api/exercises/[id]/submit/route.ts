import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type ExerciseData = {
  options?: string[]
  answer?: string
  pairs?: Array<{ term: string; definition: string }>
  words?: string[]
  sentence?: string
  blanks?: string[]
  audio?: string
}

function scoreAnswer(
  type: string,
  data: ExerciseData,
  userAnswer: unknown
): { correct: boolean; score: number; correctAnswer: unknown } {
  switch (type) {
    case 'MULTIPLE_CHOICE': {
      const correct = userAnswer === data.answer
      return { correct, score: correct ? 1 : 0, correctAnswer: data.answer }
    }

    case 'FILL_BLANK': {
      const expected = (data.answer ?? '').toLowerCase().trim()
      const given = String(userAnswer ?? '').toLowerCase().trim()
      const correct = given === expected
      return { correct, score: correct ? 1 : 0, correctAnswer: data.answer }
    }

    case 'FLASHCARD': {
      // Self-reported: user marks themselves correct/incorrect
      const correct = userAnswer === true || userAnswer === 'correct'
      return { correct, score: correct ? 1 : 0, correctAnswer: data.answer }
    }

    case 'SORT_WORDS': {
      // data.answer is the correct full sentence; data.words are the shuffled pieces
      const expected = String(data.answer ?? '').toLowerCase().trim().replace(/[.!?,]/g, '')
      const given = Array.isArray(userAnswer)
        ? (userAnswer as string[]).join(' ').toLowerCase().trim().replace(/[.!?,]/g, '')
        : String(userAnswer).toLowerCase().trim().replace(/[.!?,]/g, '')
      const correct = given === expected
      return { correct, score: correct ? 1 : 0, correctAnswer: data.answer }
    }

    case 'DICTATION': {
      const expected = (data.sentence ?? data.answer ?? '').toLowerCase().trim()
      const given = String(userAnswer ?? '').toLowerCase().trim()
      // Partial scoring: word-level match
      const expectedWords = expected.split(/\s+/)
      const givenWords = given.split(/\s+/)
      const matchedWords = expectedWords.filter((w, i) => w === givenWords[i]).length
      const score = expectedWords.length > 0 ? matchedWords / expectedWords.length : 0
      return {
        correct: score === 1,
        score: Math.round(score * 10) / 10,
        correctAnswer: data.sentence ?? data.answer,
      }
    }

    default:
      return { correct: false, score: 0, correctAnswer: null }
  }
}

// POST /api/exercises/[id]/submit
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const { answer } = body

  if (answer === undefined || answer === null) {
    return NextResponse.json({ error: 'Missing answer' }, { status: 400 })
  }

  const exercise = await prisma.exercise.findUnique({
    where: { id },
    include: { lesson: { select: { published: true } } },
  })

  if (!exercise) return NextResponse.json({ error: 'Exercise not found' }, { status: 404 })
  if (!exercise.lesson.published && user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const data = exercise.data as ExerciseData
  const { correct, score, correctAnswer } = scoreAnswer(exercise.type, data, answer)
  const earnedPoints = Math.round(exercise.points * score)

  // Upsert progress — keep best score
  const existing = await prisma.userProgress.findUnique({
    where: { userId_exerciseId: { userId: user.userId, exerciseId: id } },
  })

  if (!existing || earnedPoints > existing.score) {
    await prisma.userProgress.upsert({
      where: { userId_exerciseId: { userId: user.userId, exerciseId: id } },
      create: {
        userId: user.userId,
        exerciseId: id,
        score: earnedPoints,
      },
      update: {
        score: earnedPoints,
        completedAt: new Date(),
      },
    })
  }

  // Check lesson completion after progress upsert
  let lessonCompleted = false
  try {
    const lessonId = exercise.lessonId
    const [allExercises, allProgress] = await Promise.all([
      prisma.exercise.findMany({ where: { lessonId }, select: { id: true, points: true } }),
      prisma.userProgress.findMany({ where: { userId: user.userId, exercise: { lessonId } }, select: { exerciseId: true, score: true } }),
    ])
    const progressMap = new Map(allProgress.map(p => [p.exerciseId, p.score]))
    const allDone = allExercises.every(e => progressMap.has(e.id))
    if (allDone) {
      const totalMax = allExercises.reduce((s, e) => s + e.points, 0)
      const totalEarned = allExercises.reduce((s, e) => s + (progressMap.get(e.id) ?? 0), 0)
      await (prisma as any).lesson_completions.upsert({
        where: { userId_lessonId: { userId: user.userId, lessonId } },
        create: { userId: user.userId, lessonId, score: totalEarned, maxScore: totalMax },
        update: { score: totalEarned, maxScore: totalMax, completedAt: new Date() },
      })
      lessonCompleted = true
    }
  } catch (e) {
    // Non-fatal — lesson completion tracking is best-effort
    console.error('lesson completion error:', e)
  }

  return NextResponse.json({
    correct,
    score: earnedPoints,
    maxPoints: exercise.points,
    correctAnswer: correct ? null : correctAnswer,
    message: correct ? '🎉 Chính xác!' : '❌ Chưa đúng, thử lại nhé!',
    lessonCompleted,
  })
}
