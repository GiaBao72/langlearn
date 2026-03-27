import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import * as XLSX from 'xlsx'

export async function GET() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const wb = XLSX.utils.book_new()

  // Sheet FILL_BLANK
  const fillBlank = [
    { question: 'Điền vào: ___ Morgen! (Chào buổi sáng)', sentence: '___ Morgen!', answer: 'Guten', hint: "Tính từ 'tốt' trong tiếng Đức", points: 10 },
    { question: 'Điền vào: Ich ___ aus Vietnam.', sentence: 'Ich ___ aus Vietnam.', answer: 'komme', hint: "kommen chia ngôi 1", points: 10 },
  ]
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(fillBlank), 'FILL_BLANK')

  // Sheet MULTIPLE_CHOICE
  const multipleChoice = [
    { question: 'Buổi sáng bạn nói gì?', options: 'Guten Morgen|Guten Abend|Gute Nacht|Auf Wiedersehen', answer: 'Guten Morgen', explanation: 'Morgen = buổi sáng', points: 8 },
    { question: 'Số 7 tiếng Đức là?', options: 'sechs|sieben|acht|neun', answer: 'sieben', explanation: 'sieben = 7', points: 8 },
  ]
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(multipleChoice), 'MULTIPLE_CHOICE')

  // Sheet FLASHCARD
  const flashcard = [
    { question: 'Guten Morgen nghĩa là gì?', front: 'Guten Morgen', back: 'Chào buổi sáng', pronunciation: 'GOO-ten MOR-gen', points: 5 },
    { question: 'Tschüss nghĩa là gì?', front: 'Tschüss', back: 'Tạm biệt (thân mật)', pronunciation: 'CHÜSS', points: 5 },
  ]
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(flashcard), 'FLASHCARD')

  // Sheet SORT_WORDS
  const sortWords = [
    { question: 'Sắp xếp: Chào buổi tối', words: 'Guten|Abend|!', answer: 'Guten Abend !', points: 12 },
    { question: 'Sắp xếp: Tôi tên là Lan', words: 'Ich|heiße|Lan|.', answer: 'Ich heiße Lan .', points: 12 },
  ]
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(sortWords), 'SORT_WORDS')

  // Sheet DICTATION
  const dictation = [
    { question: 'Viết câu chào hỏi bạn nghe', audio_text: 'Guten Morgen, wie geht es Ihnen?', answer: 'Guten Morgen wie geht es Ihnen', hint: 'Chào sáng + hỏi thăm', points: 15 },
    { question: 'Viết câu tạm biệt', audio_text: 'Auf Wiedersehen und Tschüss!', answer: 'Auf Wiedersehen und Tschüss', hint: 'Trang trọng + thân mật', points: 15 },
  ]
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(dictation), 'DICTATION')

  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

  return new NextResponse(buf, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="exercise-template.xlsx"',
    },
  })
}
