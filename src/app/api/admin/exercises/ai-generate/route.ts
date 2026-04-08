import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import * as XLSX from 'xlsx'

const OPENAI_API_URL = process.env.OPENAI_API_URL || 'https://llm.chiasegpu.vn/v1'
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ''
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'claude-sonnet-4.6'

const SYSTEM_PROMPT = `Bạn là chuyên gia sư phạm tạo bài tập tiếng Đức chất lượng cao. Trả về JSON thuần túy, không markdown.
Bắt đầu bằng { và kết thúc bằng }. Dùng key ngắn như hướng dẫn. JSON phải hoàn chỉnh.

NGUYÊN TẮC THIẾT KẾ ĐỀ BÀI (bắt buộc):
1. Fill-blank (FB): Chỗ trống phải là từ/cụm từ NGẮN (1-3 từ), dễ đoán từ ngữ cảnh câu.
   - CHỈ dùng FB cho: giới từ, động từ chia, tính từ, liên từ, đại từ — những thứ có ngữ cảnh rõ ràng.
   - KHÔNG dùng FB cho: danh từ phân loại mơ hồ (Buchstabe, Tier, Farbe...), khái niệm trừu tượng, cụm từ dài hơn 3 từ mà không có hint.
   - Liệt kê TẤT CẢ đáp án đúng về ngữ pháp và giao tiếp thực tế vào mảng "a". Ví dụ: "Was/Welche Sprachen sprechen Sie?" → a:["Was","Welche Sprachen"]. Ưu tiên đáp án ngắn/thông dụng hơn.
   - Hint "h" phải đủ gợi ý để người học biết mình cần điền gì (từ loại, nghĩa, cấu trúc).
2. MC: Các lựa chọn phải rõ ràng, sai lầm phổ biến thực tế, đáp án đúng không được mơ hồ.
3. Độ khó phù hợp trình độ — A1/A2 dùng từ vựng và cấu trúc đơn giản.`

function buildUserPrompt(
  topic: string,
  description: string,
  level: string,
  typeCounts: Record<string, number>
): string {
  const schemas: Record<string, (count: number) => string> = {
    FLASHCARD:               (n) => `"FC":[${n} items: {"f":"từ Đức","b":"nghĩa Việt","p":"phiên âm"}]`,
    FILL_BLANK: (n) => `"FB":[${n} items: {"s":"câu tiếng Đức có ___ trống","a":["đáp_án_1","đáp_án_2"],"h":"gợi ý ngắn gọn về từ loại hoặc ngữ nghĩa"} — LƯU Ý: (1) "a" là MẢNG tất cả đáp án đúng về mặt ngữ pháp, nếu chỉ có 1 đáp án duy nhất thì vẫn dùng mảng 1 phần tử; (2) "h" bắt buộc, ví dụ "động từ chia theo ich" hoặc "giới từ chỉ xuất xứ"; (3) đáp án phải là từ/cụm từ điền thẳng vào chỗ ___, không có dấu câu thừa]`,
    MULTIPLE_CHOICE:         (n) => `"MC":[${n} items: {"q":"cau hoi","o":"lua chon 1|lua chon 2|lua chon 3|lua chon 4","a":"noi dung dap an dung (khop chinh xac 1 trong 4)","e":"giai thich"}]`,
    // MCP/MCA: options phân cách |, aa là NHIỀU đáp án đúng phân cách |, phải có ít nhất 2 đáp án đúng
    MULTIPLE_CHOICE_PARTIAL: (n) => `"MCP":[${n} items: {"q":"cau hoi","o":"lua chon 1|lua chon 2|lua chon 3|lua chon 4","aa":"dap dung 1|dap dung 2","e":"giai thich"}]`,
    MULTIPLE_CHOICE_ALL:     (n) => `"MCA":[${n} items: {"q":"cau hoi","o":"lua chon 1|lua chon 2|lua chon 3|lua chon 4","aa":"dap dung 1|dap dung 2","e":"giai thich"}]`,
    SORT_WORDS:              (n) => `"SW":[${n} items: {"q":"yêu cầu","w":"từ1|từ2|từ3","a":"câu đúng"}]`,
    DICTATION:               (n) => `"DT":[${n} items: {"t":"câu tiếng Đức đầy đủ","a":"câu bỏ dấu câu","h":"nghĩa tiếng Việt"}]`,
  }

  const selected = Object.entries(typeCounts)
    .filter(([type]) => schemas[type])
    .map(([type, count]) => schemas[type](count))

  const descBlock = description
    ? `\nYêu cầu thêm: ${description}`
    : ''

  return `Tạo bài tập tiếng Đức, chủ đề: "${topic}", trình độ: ${level}.${descBlock}

Quy tắc format:
- FB: "___ " là chỗ trống, "a" là MẢNG đáp án (tất cả đáp án đúng cả ngữ pháp lẫn giao tiếp), "h" là hint bắt buộc
- MC: "a" phải là một trong "o" (phân cách |), không có prefix A./B./C./D.
- SW: "w" là các từ phân cách |, "a" là câu hoàn chỉnh
- DT: "t" là câu gốc, "a" là câu bỏ dấu câu
- Không thêm key nào ngoài danh sách

Trả về JSON với các key sau:
${selected.join('\n')}
JSON:`
}

function extractJSON(raw: string): string {
  const s = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()
  const start = s.indexOf('{')
  const end = s.lastIndexOf('}')
  if (start !== -1 && end !== -1 && end > start) return s.slice(start, end + 1)
  return s
}

function normalizeExercises(
  raw: Record<string, unknown[]>,
  typeCounts: Record<string, number>
): Record<string, unknown[]> {
  const keyMap: Record<string, {
    sheetKey: string
    expand: (r: Record<string, unknown>) => Record<string, unknown>
  }> = {
    FC: {
      sheetKey: 'FLASHCARD',
      expand: (r) => ({
        question: `${r.f} nghĩa là gì?`,
        front: r.f,
        back: r.b,
        pronunciation: r.p || '',
        points: 1,
      }),
    },
    FB: {
      sheetKey: 'FILL_BLANK',
      expand: (r) => {
        const rawA = r.a
        const answersArr: string[] = Array.isArray(rawA)
          ? (rawA as string[]).map(s => String(s).trim()).filter(Boolean)
          : String(rawA ?? '').split('|').map(s => s.trim()).filter(Boolean)
        return {
          question: `Điền vào: ${r.s}`,
          sentence: r.s,
          answers: answersArr.join('|'),
          answer: answersArr[0] ?? '',
          hint: r.h || '',
          points: 1,
        }
      },
    },
    MC: {
      sheetKey: 'MULTIPLE_CHOICE',
      expand: (r) => ({
        question: r.q,
        options: Array.isArray(r.o) ? (r.o as string[]).join('|') : String(r.o ?? ''),
        answer: r.a,
        explanation: r.e || '',
        points: 1,
      }),
    },
    MCP: {
      sheetKey: 'MULTIPLE_CHOICE_PARTIAL',
      expand: (r) => {
        const rawAa = r.aa
        const answers: string[] = Array.isArray(rawAa)
          ? (rawAa as string[])
          : String(rawAa ?? '').split('|').map(s => s.trim()).filter(Boolean)
        // options phải là string pipe-separated cho import route
        const rawO = r.o
        const optionsStr = Array.isArray(rawO)
          ? (rawO as string[]).join('|')
          : String(rawO ?? '')
        return {
          question: r.q,
          options: optionsStr,
          answers: answers.join('|'),
          explanation: r.e || '',
          points: 1,
        }
      },
    },
    MCA: {
      sheetKey: 'MULTIPLE_CHOICE_ALL',
      expand: (r) => {
        const rawAa = r.aa
        const answers: string[] = Array.isArray(rawAa)
          ? (rawAa as string[])
          : String(rawAa ?? '').split('|').map(s => s.trim()).filter(Boolean)
        const rawO = r.o
        const optionsStr = Array.isArray(rawO)
          ? (rawO as string[]).join('|')
          : String(rawO ?? '')
        return {
          question: r.q,
          options: optionsStr,
          answers: answers.join('|'),
          explanation: r.e || '',
          points: 1,
        }
      },
    },
    SW: {
      sheetKey: 'SORT_WORDS',
      expand: (r) => ({
        question: r.q || 'Sắp xếp thành câu đúng',
        words: Array.isArray(r.w) ? (r.w as string[]).join('|') : r.w,
        answer: r.a,
        points: 1,
      }),
    },
    DT: {
      sheetKey: 'DICTATION',
      expand: (r) => ({
        question: 'Nghe và viết lại',
        audio_text: r.t,
        answer: r.a,
        hint: r.h || '',
        points: 1,
      }),
    },
  }

  const shortToKey: Record<string, string> = {
    FLASHCARD: 'FC', FILL_BLANK: 'FB', MULTIPLE_CHOICE: 'MC',
    MULTIPLE_CHOICE_PARTIAL: 'MCP', MULTIPLE_CHOICE_ALL: 'MCA',
    SORT_WORDS: 'SW', DICTATION: 'DT',
  }

  const result: Record<string, unknown[]> = {}

  for (const type of Object.keys(typeCounts)) {
    const shortKey = shortToKey[type]
    const rows = (raw[shortKey] || raw[type]) as Record<string, unknown>[]
    if (!rows?.length) continue
    const meta = keyMap[shortKey]
    if (!meta) continue
    result[meta.sheetKey] = rows.map(meta.expand)
  }

  return result
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { topic, description, level, typeCounts } = body as {
    topic: string
    description?: string
    level: string
    typeCounts: Record<string, number>
  }

  if (!topic || !level || !typeCounts || Object.keys(typeCounts).length === 0) {
    return NextResponse.json(
      { error: 'Thiếu thông tin: topic, level, typeCounts' },
      { status: 400 }
    )
  }
  if (!OPENAI_API_KEY) {
    return NextResponse.json({ error: 'Chưa cấu hình OPENAI_API_KEY' }, { status: 500 })
  }

  // Giới hạn an toàn mỗi loại tối đa 50, tổng tối đa 100
  const safeTypeCounts: Record<string, number> = {}
  let total = 0
  for (const [type, count] of Object.entries(typeCounts)) {
    const safe = Math.min(Number(count) || 1, 50)
    safeTypeCounts[type] = safe
    total += safe
    if (total >= 100) break
  }

  // Retry up to 2 times, with timeout 90s each
  async function callLLM(retryLeft = 2): Promise<{ rawContent: string; finishReason: string }> {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 90_000)
    let aiRes: Response
    try {
      aiRes = await fetch(`${OPENAI_API_URL}/chat/completions`, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: OPENAI_MODEL,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: buildUserPrompt(topic, description || '', level, safeTypeCounts) },
          ],
          temperature: 0.7,
          max_tokens: 8192,
        }),
      })
    } finally {
      clearTimeout(timer)
    }

    // Check content-type before parsing JSON
    const ct = aiRes.headers.get('content-type') ?? ''
    const bodyText = await aiRes.text()

    if (!aiRes.ok || !ct.includes('application/json')) {
      // Got HTML error page or non-JSON response
      if (retryLeft > 0) {
        await new Promise(r => setTimeout(r, 2000))
        return callLLM(retryLeft - 1)
      }
      const preview = bodyText.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 200)
      throw new Error(`LLM trả về lỗi (status ${aiRes.status}): ${preview}`)
    }

    let aiData: Record<string, unknown>
    try {
      aiData = JSON.parse(bodyText)
    } catch {
      if (retryLeft > 0) {
        await new Promise(r => setTimeout(r, 2000))
        return callLLM(retryLeft - 1)
      }
      throw new Error(`LLM response không phải JSON hợp lệ: ${bodyText.slice(0, 200)}`)
    }

    const rawContent = (aiData.choices as { message: { content: string } }[])?.[0]?.message?.content || ''
    const finishReason = (aiData.choices as { finish_reason: string }[])?.[0]?.finish_reason || ''
    return { rawContent, finishReason }
  }

  let rawContent: string
  let finishReason: string
  try {
    ;({ rawContent, finishReason } = await callLLM())
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: msg }, { status: 502 })
  }

  if (finishReason === 'length') {
    return NextResponse.json(
      { error: 'Response bị cắt — thử giảm số câu hoặc bỏ bớt loại bài.' },
      { status: 422 }
    )
  }

  let rawExercises: Record<string, unknown[]>
  try {
    rawExercises = JSON.parse(extractJSON(rawContent))
  } catch {
    return NextResponse.json(
      { error: 'AI trả về JSON không hợp lệ. Thử lại.', debug: rawContent.slice(0, 300) },
      { status: 500 }
    )
  }

  const exercises = normalizeExercises(rawExercises, safeTypeCounts)

  const wb = XLSX.utils.book_new()
  let totalExercises = 0

  for (const [sheetName, rows] of Object.entries(exercises)) {
    if (!rows?.length) continue
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows as object[]), sheetName)
    totalExercises += rows.length
  }

  if (wb.SheetNames.length === 0) {
    return NextResponse.json(
      { error: 'Không có bài tập nào được sinh ra. Thử lại.' },
      { status: 500 }
    )
  }

  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
  const safeFilename = `ai-exercises-${level}-${totalExercises}bai.xlsx`
  const unicodeFilename = encodeURIComponent(
    `ai-${topic.replace(/\s+/g, '-')}-${level}-${totalExercises}bai.xlsx`
  )

  return new NextResponse(buf, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${safeFilename}"; filename*=UTF-8''${unicodeFilename}`,
      'X-Exercise-Count': String(totalExercises),
    },
  })
}
