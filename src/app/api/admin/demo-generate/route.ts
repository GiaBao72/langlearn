import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ExerciseType, Prisma } from '@prisma/client'

const OPENAI_API_URL = process.env.OPENAI_API_URL || 'https://llm.chiasegpu.vn/v1'
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ''
const OPENAI_MODEL   = process.env.OPENAI_MODEL   || 'claude-sonnet-4.6'

const SYSTEM_PROMPT = `Bạn là chuyên gia sư phạm tạo bài tập tiếng Đức chất lượng cao. Trả về JSON thuần túy, không markdown.
Bắt đầu bằng { và kết thúc bằng }. Dùng key ngắn như hướng dẫn. JSON phải hoàn chỉnh.

NGUYÊN TẮC THIẾT KẾ ĐỀ BÀI (bắt buộc):
1. Fill-blank (FB): Chỗ trống phải là từ/cụm từ NGẮN (1-3 từ), dễ đoán từ ngữ cảnh câu.
   - CHỈ dùng FB cho: giới từ, động từ chia, tính từ, liên từ, đại từ — những thứ có ngữ cảnh rõ ràng.
   - Liệt kê TẤT CẢ đáp án đúng vào mảng "a". Hint "h" phải đủ gợi ý.
2. MC: Các lựa chọn phải rõ ràng, sai lầm phổ biến thực tế, đáp án đúng không được mơ hồ.
3. Độ khó phù hợp trình độ — A1/A2 dùng từ vựng và cấu trúc đơn giản.`

function buildPrompt(topic: string, level: string, typeCounts: Record<string, number>): string {
  const schemas: Record<string, (n: number) => string> = {
    FLASHCARD:               (n) => `"FC":[${n} items: {"f":"từ Đức","b":"nghĩa Việt","p":"phiên âm"}]`,
    FILL_BLANK:              (n) => `"FB":[${n} items: {"s":"câu tiếng Đức có ___ trống","a":["đáp_án_1"],"h":"gợi ý"}]`,
    MULTIPLE_CHOICE:         (n) => `"MC":[${n} items: {"q":"câu hỏi","o":"lựa chọn 1|lựa chọn 2|lựa chọn 3|lựa chọn 4","a":"đáp án đúng (khớp 1 trong 4)","e":"giải thích"}]`,
    MULTIPLE_CHOICE_PARTIAL: (n) => `"MCP":[${n} items: {"q":"câu hỏi","o":"lựa chọn 1|lựa chọn 2|lựa chọn 3|lựa chọn 4","aa":"đáp đúng 1|đáp đúng 2","e":"giải thích"}]`,
    MULTIPLE_CHOICE_ALL:     (n) => `"MCA":[${n} items: {"q":"câu hỏi","o":"lựa chọn 1|lựa chọn 2|lựa chọn 3|lựa chọn 4","aa":"đáp đúng 1|đáp đúng 2","e":"giải thích"}]`,
    SORT_WORDS:              (n) => `"SW":[${n} items: {"q":"yêu cầu","w":"từ1|từ2|từ3","a":"câu đúng"}]`,
    DICTATION:               (n) => `"DT":[${n} items: {"t":"câu tiếng Đức đầy đủ","a":"câu không dấu câu","h":"nghĩa tiếng Việt"}]`,
  }
  const selected = Object.entries(typeCounts)
    .filter(([t]) => schemas[t])
    .map(([t, n]) => schemas[t](n))

  return `Tạo bài tập tiếng Đức, chủ đề: "${topic}", trình độ: ${level}.

Quy tắc:
- FB: "___ " là chỗ trống, "a" là MẢNG đáp án đúng, "h" là hint bắt buộc
- MC: "a" phải khớp chính xác với 1 trong "o" (phân cách |)
- SW: "w" là các từ phân cách |, "a" là câu hoàn chỉnh
- DT: "t" là câu gốc có dấu câu, "a" là câu không có dấu câu
- Không thêm key nào ngoài danh sách

Trả về JSON:
${selected.join('\n')}
JSON:`
}

function extractJSON(raw: string): string {
  const s = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()
  const start = s.indexOf('{')
  const end   = s.lastIndexOf('}')
  if (start !== -1 && end > start) return s.slice(start, end + 1)
  return s
}

function parseToExercises(
  raw: Record<string, unknown[]>,
  typeCounts: Record<string, number>
): Array<{ type: ExerciseType; question: string; data: Prisma.InputJsonValue; points: number }> {
  const result: Array<{ type: ExerciseType; question: string; data: Prisma.InputJsonValue; points: number }> = []

  const handlers: Record<string, {
    key: ExerciseType
    parse: (r: Record<string, unknown>) => { question: string; data: object } | null
  }> = {
    FC: {
      key: 'FLASHCARD',
      parse: (r) => {
        if (!r.f || !r.b) return null
        return {
          question: `${r.f} nghĩa là gì?`,
          data: { front: String(r.f), back: String(r.b), pronunciation: String(r.p || '') },
        }
      },
    },
    FB: {
      key: 'FILL_BLANK',
      parse: (r) => {
        if (!r.s) return null
        const answersArr: string[] = Array.isArray(r.a)
          ? (r.a as string[]).map(s => String(s).trim()).filter(Boolean)
          : String(r.a ?? '').split('|').map(s => s.trim()).filter(Boolean)
        if (!answersArr.length) return null
        return {
          question: `Điền vào: ${r.s}`,
          data: { sentence: String(r.s), answers: answersArr, answer: answersArr[0], hint: String(r.h || '') },
        }
      },
    },
    MC: {
      key: 'MULTIPLE_CHOICE',
      parse: (r) => {
        if (!r.q || !r.o || !r.a) return null
        const options = Array.isArray(r.o)
          ? (r.o as string[]).map(String)
          : String(r.o).split('|').map(s => s.trim()).filter(Boolean)
        if (options.length < 2) return null
        return {
          question: String(r.q),
          data: { options, answer: String(r.a), explanation: String(r.e || '') },
        }
      },
    },
    MCP: {
      key: 'MULTIPLE_CHOICE_PARTIAL',
      parse: (r) => {
        if (!r.q || !r.o || !r.aa) return null
        const options = Array.isArray(r.o) ? (r.o as string[]).map(String) : String(r.o).split('|').map(s => s.trim()).filter(Boolean)
        const answers = Array.isArray(r.aa) ? (r.aa as string[]).map(String) : String(r.aa).split('|').map(s => s.trim()).filter(Boolean)
        if (options.length < 2 || answers.length < 1) return null
        return { question: String(r.q), data: { options, answers, explanation: String(r.e || '') } }
      },
    },
    MCA: {
      key: 'MULTIPLE_CHOICE_ALL',
      parse: (r) => {
        if (!r.q || !r.o || !r.aa) return null
        const options = Array.isArray(r.o) ? (r.o as string[]).map(String) : String(r.o).split('|').map(s => s.trim()).filter(Boolean)
        const answers = Array.isArray(r.aa) ? (r.aa as string[]).map(String) : String(r.aa).split('|').map(s => s.trim()).filter(Boolean)
        if (options.length < 2 || answers.length < 1) return null
        return { question: String(r.q), data: { options, answers, explanation: String(r.e || '') } }
      },
    },
    SW: {
      key: 'SORT_WORDS',
      parse: (r) => {
        if (!r.w || !r.a) return null
        const words = Array.isArray(r.w) ? (r.w as string[]).map(String) : String(r.w).split('|').map(s => s.trim()).filter(Boolean)
        return { question: String(r.q || 'Sắp xếp thành câu đúng'), data: { words, answer: String(r.a) } }
      },
    },
    DT: {
      key: 'DICTATION',
      parse: (r) => {
        if (!r.t || !r.a) return null
        return { question: 'Nghe và viết lại', data: { audio_text: String(r.t), answer: String(r.a), hint: String(r.h || '') } }
      },
    },
  }

  const shortMap: Record<string, string> = {
    FLASHCARD: 'FC', FILL_BLANK: 'FB', MULTIPLE_CHOICE: 'MC',
    MULTIPLE_CHOICE_PARTIAL: 'MCP', MULTIPLE_CHOICE_ALL: 'MCA',
    SORT_WORDS: 'SW', DICTATION: 'DT',
  }

  for (const type of Object.keys(typeCounts)) {
    const shortKey = shortMap[type]
    if (!shortKey) continue
    const rows = (raw[shortKey] || raw[type]) as Record<string, unknown>[]
    if (!rows?.length) continue
    const handler = handlers[shortKey]
    if (!handler) continue
    for (const row of rows) {
      const parsed = handler.parse(row)
      if (!parsed) continue
      result.push({ type: handler.key, question: parsed.question, data: parsed.data as Prisma.InputJsonValue, points: 1 })
    }
  }

  return result
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { lessonId, topic, level, typeCounts, replaceExisting } = await req.json() as {
    lessonId: string
    topic: string
    level: string
    typeCounts: Record<string, number>
    replaceExisting?: boolean
  }

  if (!lessonId || !topic || !level || !typeCounts || !Object.keys(typeCounts).length) {
    return NextResponse.json({ error: 'Thiếu thông tin bắt buộc' }, { status: 400 })
  }

  // Validate lesson belongs to a demo course
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { course: { select: { isDemo: true, title: true } } },
  })
  if (!lesson) return NextResponse.json({ error: 'Lesson không tồn tại' }, { status: 404 })
  if (!lesson.course.isDemo) return NextResponse.json({ error: 'Lesson không thuộc khóa Demo' }, { status: 400 })

  // Safe limits
  const safe: Record<string, number> = {}
  let total = 0
  for (const [t, c] of Object.entries(typeCounts)) {
    const n = Math.min(Number(c) || 1, 30)
    safe[t] = n; total += n
    if (total >= 70) break
  }

  // Call LLM
  async function callLLM(retry = 2): Promise<string> {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 90_000)
    let res: Response
    try {
      res = await fetch(`${OPENAI_API_URL}/chat/completions`, {
        method: 'POST', signal: ctrl.signal,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
        body: JSON.stringify({
          model: OPENAI_MODEL,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: buildPrompt(topic, level, safe) },
          ],
          temperature: 0.7, max_tokens: 8192,
        }),
      })
    } finally { clearTimeout(timer) }

    const ct = res.headers.get('content-type') ?? ''
    const bodyText = await res.text()
    if (!res.ok || !ct.includes('application/json')) {
      if (retry > 0) { await new Promise(r => setTimeout(r, 2000)); return callLLM(retry - 1) }
      throw new Error(`LLM lỗi (${res.status})`)
    }
    const data = JSON.parse(bodyText)
    return data.choices?.[0]?.message?.content || ''
  }

  let rawContent: string
  try { rawContent = await callLLM() }
  catch (e) { return NextResponse.json({ error: String(e) }, { status: 502 }) }

  let rawExercises: Record<string, unknown[]>
  try { rawExercises = JSON.parse(extractJSON(rawContent)) }
  catch { return NextResponse.json({ error: 'AI trả về JSON không hợp lệ. Thử lại.' }, { status: 500 }) }

  const exercises = parseToExercises(rawExercises, safe)
  if (!exercises.length) return NextResponse.json({ error: 'Không parse được bài tập nào.' }, { status: 500 })

  // Optionally clear old exercises
  if (replaceExisting) await prisma.exercise.deleteMany({ where: { lessonId } })

  const maxOrder = await prisma.exercise.aggregate({ where: { lessonId }, _max: { order: true } })
  let order = (maxOrder._max.order ?? 0) + 1
  await prisma.exercise.createMany({ data: exercises.map(e => ({ ...e, lessonId, order: order++ })) })

  return NextResponse.json({ created: exercises.length, total })
}
