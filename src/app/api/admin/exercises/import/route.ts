import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma, ExerciseType } from '@prisma/client'
import * as XLSX from 'xlsx'

const VALID_TYPES = ['FILL_BLANK', 'MULTIPLE_CHOICE', 'FLASHCARD', 'SORT_WORDS', 'DICTATION'] as const

const DEFAULT_POINTS: Record<string, number> = {
  FILL_BLANK: 10,
  MULTIPLE_CHOICE: 8,
  FLASHCARD: 5,
  SORT_WORDS: 12,
  DICTATION: 15,
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const form = await req.formData()
  const file = form.get('file') as File | null
  const lessonId = form.get('lessonId') as string | null

  if (!file || !lessonId) return NextResponse.json({ error: 'Thiếu file hoặc lessonId' }, { status: 400 })

  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } })
  if (!lesson) return NextResponse.json({ error: 'Lesson không tồn tại' }, { status: 404 })

  const buf = await file.arrayBuffer()
  const wb = XLSX.read(buf, { type: 'array' })

  const exercises: { type: ExerciseType; question: string; data: Prisma.InputJsonValue; points: number }[] = []
  const errors: string[] = []

  for (const sheetName of wb.SheetNames) {
    const type = sheetName.toUpperCase().trim()
    if (!VALID_TYPES.includes(type as ExerciseType)) {
      errors.push(`Sheet "${sheetName}" không hợp lệ, bỏ qua.`)
      continue
    }

    const rows = XLSX.utils.sheet_to_json<Record<string, string>>(wb.Sheets[sheetName], { defval: '' })

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i]
      const rowNum = i + 2
      const question = r['question']?.toString().trim()
      if (!question) { errors.push(`Sheet ${sheetName} dòng ${rowNum}: thiếu question`); continue }

      const pts = r['points'] ? parseInt(r['points'].toString()) || DEFAULT_POINTS[type] : DEFAULT_POINTS[type]

      let data: object | null = null

      if (type === 'FILL_BLANK') {
        const sentence = r['sentence']?.toString().trim()
        const answer = r['answer']?.toString().trim()
        if (!sentence || !answer) { errors.push(`Sheet ${sheetName} dòng ${rowNum}: thiếu sentence hoặc answer`); continue }
        data = { sentence, answer, hint: r['hint']?.toString().trim() || '' }
      }
      else if (type === 'MULTIPLE_CHOICE') {
        const optStr = r['options']?.toString().trim()
        const answer = r['answer']?.toString().trim()
        if (!optStr || !answer) { errors.push(`Sheet ${sheetName} dòng ${rowNum}: thiếu options hoặc answer`); continue }
        const options = optStr.split('|').map((o: string) => o.trim()).filter(Boolean)
        if (options.length < 2) { errors.push(`Sheet ${sheetName} dòng ${rowNum}: cần ít nhất 2 options`); continue }
        data = { options, answer, explanation: r['explanation']?.toString().trim() || '' }
      }
      else if (type === 'FLASHCARD') {
        const front = r['front']?.toString().trim()
        const back = r['back']?.toString().trim()
        if (!front || !back) { errors.push(`Sheet ${sheetName} dòng ${rowNum}: thiếu front hoặc back`); continue }
        data = { front, back, pronunciation: r['pronunciation']?.toString().trim() || '' }
      }
      else if (type === 'SORT_WORDS') {
        const wordsStr = r['words']?.toString().trim()
        const answer = r['answer']?.toString().trim()
        if (!wordsStr || !answer) { errors.push(`Sheet ${sheetName} dòng ${rowNum}: thiếu words hoặc answer`); continue }
        const words = wordsStr.split('|').map((w: string) => w.trim()).filter(Boolean)
        data = { words, answer }
      }
      else if (type === 'DICTATION') {
        const audio_text = r['audio_text']?.toString().trim()
        const answer = r['answer']?.toString().trim()
        if (!audio_text || !answer) { errors.push(`Sheet ${sheetName} dòng ${rowNum}: thiếu audio_text hoặc answer`); continue }
        data = { audio_text, answer, hint: r['hint']?.toString().trim() || '' }
      }

      if (data) exercises.push({ type: type as ExerciseType, question, data: data as Prisma.InputJsonValue, points: pts })
    }
  }

  if (exercises.length === 0) {
    return NextResponse.json({ error: 'Không có bài tập hợp lệ nào', details: errors }, { status: 400 })
  }

  const maxOrder = await prisma.exercise.aggregate({ where: { lessonId }, _max: { order: true } })
  let order = (maxOrder._max.order ?? 0) + 1

  await prisma.exercise.createMany({
    data: exercises.map(e => ({ ...e, lessonId, order: order++ }))
  })

  return NextResponse.json({ imported: exercises.length, errors })
}
