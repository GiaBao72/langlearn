import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type ExerciseType = 'MULTIPLE_CHOICE' | 'MULTIPLE_CHOICE_PARTIAL' | 'MULTIPLE_CHOICE_ALL' | 'FILL_BLANK' | 'FLASHCARD' | 'DICTATION' | 'SORT_WORDS'

function checkAnswer(type: ExerciseType, data: Record<string, unknown>, userAnswer: string | string[], points: number): number {
  const normalize = (s: string) => s.trim().toLowerCase()
    .replace(/[.!?,;:]/g, '')
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')

  if (type === 'MULTIPLE_CHOICE') {
    return normalize(String(userAnswer)) === normalize(String(data.answer ?? '')) ? points : 0
  }

  if (type === 'MULTIPLE_CHOICE_PARTIAL') {
    const correctSet = (data.answers as string[] ?? []).map(normalize)
    const userSet = (Array.isArray(userAnswer) ? userAnswer : [userAnswer]).map(s => normalize(String(s)))
    const totalCorrect = correctSet.length
    if (totalCorrect === 0) return 0
    const correctSelected = userSet.filter(a => correctSet.includes(a)).length
    const wrongSelected = userSet.filter(a => !correctSet.includes(a)).length
    const net = Math.max(0, correctSelected - wrongSelected)
    return Math.round(points * net / totalCorrect)
  }

  if (type === 'MULTIPLE_CHOICE_ALL') {
    const correctSet = (data.answers as string[] ?? []).map(normalize).sort()
    const userSet = (Array.isArray(userAnswer) ? userAnswer : [userAnswer]).map(s => normalize(String(s))).sort()
    const isAllCorrect = correctSet.length === userSet.length && correctSet.every((v, i) => v === userSet[i])
    return isAllCorrect ? points : 0
  }

  if (type === 'FILL_BLANK') {
    const normUser = normalize(String(userAnswer))
    if (!normUser) return 0
    // Ưu tiên mảng answers[], fallback về answer string
    const correctAnswers: string[] = Array.isArray(data.answers) && (data.answers as string[]).length > 0
      ? (data.answers as string[])
      : [String(data.answer ?? '')]
    return correctAnswers.some(a => normalize(a) === normUser) ? points : 0
  }

  if (type === 'FLASHCARD') {
    return String(userAnswer) === 'known' ? points : 0
  }

  if (type === 'DICTATION') {
    const normUser = normalize(String(userAnswer))
    if (!normUser) return 0
    // Ưu tiên audio_text (câu gốc người dùng nghe), fallback về answer
    const expected = normalize(String(data.audio_text ?? data.answer ?? ''))
    // Partial scoring: word-level match (đồng bộ với practice submit)
    const expectedWords = expected.split(/\s+/)
    const givenWords = normUser.split(/\s+/)
    const matchedWords = expectedWords.filter((w, i) => w === givenWords[i]).length
    const ratio = expectedWords.length > 0 ? matchedWords / expectedWords.length : 0
    return Math.round(points * ratio)
  }

  if (type === 'SORT_WORDS') {
    const normUser = normalize(String(userAnswer))
    if (!normUser) return 0
    return normUser === normalize(String(data.answer ?? '')) ? points : 0
  }

  return 0
}

// POST /api/exams/[id]/submit
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id: examId } = await params

  const body = await req.json()
  const { attemptId, answers } = body
  // answers: [{questionId, answer}]

  if (!attemptId) return NextResponse.json({ error: 'attemptId required' }, { status: 400 })

  const attempt = await prisma.examAttempt.findUnique({ where: { id: attemptId } })
  if (!attempt || attempt.userId !== user.userId || attempt.examId !== examId) {
    return NextResponse.json({ error: 'Invalid attempt' }, { status: 403 })
  }
  if (attempt.submittedAt) return NextResponse.json({ error: 'Already submitted' }, { status: 400 })

  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: { questions: true },
  })
  if (!exam) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Grade
  const answerMap: Record<string, string | string[]> = {}
  for (const a of (answers ?? [])) {
    answerMap[a.questionId] = a.answer
  }

  let score = 0
  const maxScore = exam.questions.reduce((s, q) => s + q.points, 0)
  const gradedAnswers = exam.questions.map(q => {
    const data = q.data as Record<string, unknown>
    const userAnswer = answerMap[q.id] ?? ''
    const earned = checkAnswer(q.type as ExerciseType, data, userAnswer, q.points)
    score += earned
    return {
      questionId: q.id,
      question: q.question,
      type: q.type,
      data: q.data,
      userAnswer,
      correct: earned === q.points,
      earnedPoints: earned,
      maxPoints: q.points,
    }
  })

  const passed = exam.passingPct
    ? score / maxScore * 100 >= exam.passingPct
    : null

  const updated = await prisma.examAttempt.update({
    where: { id: attemptId },
    data: { submittedAt: new Date(), score, maxScore, passed, answers: gradedAnswers as object[] },
  })

  return NextResponse.json({
    attemptId: updated.id,
    score,
    maxScore,
    passed,
    pct: maxScore > 0 ? Math.round(score / maxScore * 100) : 0,
    answers: gradedAnswers,
  })
}
