import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type ExerciseData = {
  options?: string[]
  answer?: string
  answers?: string[]   // MULTIPLE_CHOICE_PARTIAL / MULTIPLE_CHOICE_ALL
  pairs?: Array<{ term: string; definition: string }>
  words?: string[]
  sentence?: string
  blanks?: string[]
  audio?: string
  audio_text?: string
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

    case 'MULTIPLE_CHOICE_PARTIAL': {
      // Score = max(0, correctSelected - wrongSelected) / totalCorrect
      const correctAnswers: string[] = Array.isArray(data.answers) ? data.answers as unknown as string[] : []
      let selected: string[] = []
      try { selected = Array.isArray(userAnswer) ? userAnswer as string[] : JSON.parse(String(userAnswer)) } catch { selected = [] }
      const correctSelected = selected.filter(s => correctAnswers.includes(s)).length
      const wrongSelected = selected.filter(s => !correctAnswers.includes(s)).length
      const net = Math.max(0, correctSelected - wrongSelected)
      const score = correctAnswers.length > 0 ? net / correctAnswers.length : 0
      return {
        correct: score === 1,
        score: Math.round(score * 10) / 10,
        correctAnswer: correctAnswers,
      }
    }

    case 'MULTIPLE_CHOICE_ALL': {
      // All or nothing: phải chọn đúng và đủ
      const correctAnswers: string[] = Array.isArray(data.answers) ? data.answers as unknown as string[] : []
      let selected: string[] = []
      try { selected = Array.isArray(userAnswer) ? userAnswer as string[] : JSON.parse(String(userAnswer)) } catch { selected = [] }
      const allCorrect = selected.length === correctAnswers.length &&
        correctAnswers.every(a => selected.includes(a)) &&
        selected.every(a => correctAnswers.includes(a))
      return { correct: allCorrect, score: allCorrect ? 1 : 0, correctAnswer: correctAnswers }
    }

    case 'FILL_BLANK': {
      const normalize = (s: string) => s.toLowerCase().trim().replace(/\s+/g, ' ').replace(/[.!?,;:]/g, '').replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
      const given = normalize(String(userAnswer ?? ''))
      const allAnswers: string[] = Array.isArray(data.answers) && data.answers.length > 0
        ? data.answers
        : data.answer ? [data.answer] : []
      const correct = allAnswers.some(a => normalize(a) === given)
      const primary = allAnswers[0] ?? data.answer ?? ''
      return { correct, score: correct ? 1 : 0, correctAnswer: correct ? null : primary }
    }

    case 'FLASHCARD': {
      // Self-reported: ExerciseRunner gửi 'known' hoặc 'unknown'
      const correct = userAnswer === true || userAnswer === 'correct' || userAnswer === 'known'
      return { correct, score: correct ? 1 : 0, correctAnswer: data.answer }
    }

    case 'SORT_WORDS': {
      // data.answer is the correct full sentence; data.words are the shuffled pieces
      const normalize = (s: string) => s.toLowerCase().trim().replace(/\s+/g, ' ').replace(/[.!?,;:]/g, '').replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
      const expected = normalize(String(data.answer ?? ''))
      const given = Array.isArray(userAnswer)
        ? normalize((userAnswer as string[]).join(' '))
        : normalize(String(userAnswer))
      const correct = given === expected
      return { correct, score: correct ? 1 : 0, correctAnswer: data.answer }
    }

    case 'DICTATION': {
      const normalize = (s: string) => s.toLowerCase().trim().replace(/\s+/g, ' ').replace(/[.!?,;:]/g, '').replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
      const expected = normalize(data.audio_text ?? data.sentence ?? data.answer ?? '')
      const given = normalize(String(userAnswer ?? ''))
      // Partial scoring: word-level match
      const expectedWords = expected.split(/\s+/)
      const givenWords = given.split(/\s+/)
      const matchedWords = expectedWords.filter((w, i) => w === givenWords[i]).length
      const score = expectedWords.length > 0 ? matchedWords / expectedWords.length : 0
      return {
        correct: score === 1,
        score: Math.round(score * 10) / 10,
        correctAnswer: data.audio_text ?? data.sentence ?? data.answer,
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
    include: { lesson: { select: { published: true, courseId: true } } },
  })

  if (!exercise) return NextResponse.json({ error: 'Exercise not found' }, { status: 404 })
  if (!exercise.lesson.published && user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Enrollment check — ADMIN bypasses; guest (no courseId) blocked
  if (user.role !== 'ADMIN') {
    const courseId = exercise.lesson.courseId
    if (courseId) {
      const course = await prisma.course.findUnique({ where: { id: courseId }, select: { freeForAll: true } })
      if (!course?.freeForAll) {
        const enrolled = await prisma.courseEnrollment.findUnique({
          where: { userId_courseId: { userId: user.userId, courseId } },
        })
        if (!enrolled) {
          return NextResponse.json({ error: 'Not enrolled in this course' }, { status: 403 })
        }
      }
    }
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
      await prisma.lessonCompletion.upsert({
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
