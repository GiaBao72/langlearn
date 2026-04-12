import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateDictationAudioBatch } from '@/lib/vbee'
import { Prisma, ExerciseType } from '@prisma/client'
import * as XLSX from 'xlsx'

const VALID_TYPES = ['FILL_BLANK', 'MULTIPLE_CHOICE', 'MULTIPLE_CHOICE_PARTIAL', 'MULTIPLE_CHOICE_ALL', 'FLASHCARD', 'SORT_WORDS', 'DICTATION'] as const

const DEFAULT_POINTS: Record<string, number> = {
  FILL_BLANK: 1,
  MULTIPLE_CHOICE: 1,
  MULTIPLE_CHOICE_PARTIAL: 1,
  MULTIPLE_CHOICE_ALL: 1,
  FLASHCARD: 1,
  SORT_WORDS: 1,
  DICTATION: 1,
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

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
        const answersRaw = r['answers']?.toString().trim()
        const answerRaw  = r['answer']?.toString().trim()
        if (!sentence || (!answersRaw && !answerRaw)) {
          errors.push(`Sheet ${sheetName} dòng ${rowNum}: thiếu sentence hoặc answer`); continue
        }
        // Ưu tiên "answers" (pipe-separated), fallback về "answer"
        const answersArr = answersRaw
          ? answersRaw.split('|').map((a: string) => a.trim()).filter(Boolean)
          : [answerRaw!]
        data = {
          sentence,
          answers: answersArr,           // mảng tất cả đáp án đúng
          answer: answersArr[0],         // backward compat
          hint: r['hint']?.toString().trim() || '',
        }
      }
      else if (type === 'MULTIPLE_CHOICE') {
        const optStr = r['options']?.toString().trim()
        const answer = r['answer']?.toString().trim()
        if (!optStr || !answer) { errors.push(`Sheet ${sheetName} dòng ${rowNum}: thiếu options hoặc answer`); continue }
        const options = optStr.split('|').map((o: string) => o.trim()).filter(Boolean)
        if (options.length < 2) { errors.push(`Sheet ${sheetName} dòng ${rowNum}: cần ít nhất 2 options`); continue }
        const notesRaw = r['notes']?.toString().trim()
        const notes = notesRaw ? notesRaw.split('|').map((n: string) => n.trim()) : undefined
        data = { options, answer, explanation: r['explanation']?.toString().trim() || '', ...(notes ? { notes } : {}) }
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
      else if (type === 'MULTIPLE_CHOICE_PARTIAL' || type === 'MULTIPLE_CHOICE_ALL') {
        const optStr = r['options']?.toString().trim()
        const answersStr = r['answers']?.toString().trim()
        if (!optStr || !answersStr) { errors.push(`Sheet ${sheetName} dòng ${rowNum}: thiếu options hoặc answers`); continue }
        const options = optStr.split('|').map((o: string) => o.trim()).filter(Boolean)
        const answers = answersStr.split('|').map((a: string) => a.trim()).filter(Boolean)
        if (options.length < 2) { errors.push(`Sheet ${sheetName} dòng ${rowNum}: cần ít nhất 2 options`); continue }
        if (answers.length < 1) { errors.push(`Sheet ${sheetName} dòng ${rowNum}: cần ít nhất 1 đáp án đúng (answers)`); continue }
        const notesRaw2 = r['notes']?.toString().trim()
        const notes2 = notesRaw2 ? notesRaw2.split('|').map((n: string) => n.trim()) : undefined
        data = { options, answers, explanation: r['explanation']?.toString().trim() || '', ...(notes2 ? { notes: notes2 } : {}) }
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

  // Auto-generate Vbee audio for DICTATION exercises
  const dictationTexts = exercises
    .filter(e => e.type === 'DICTATION')
    .map(e => (e.data as { audio_text?: string }).audio_text)
    .filter((t): t is string => Boolean(t))

  if (dictationTexts.length > 0) {
    // Fire-and-forget in background — don't block the response
    generateDictationAudioBatch(dictationTexts).catch(err =>
      console.error('[import] Vbee batch error:', err)
    )
  }

  return NextResponse.json({ imported: exercises.length, errors })
}
