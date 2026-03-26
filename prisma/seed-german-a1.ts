import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const course = await prisma.course.upsert({
    where: { id: 'german-a1-main' },
    update: {},
    create: {
      id: 'german-a1-main',
      title: 'Tiếng Đức A1',
      language: 'de',
      level: 'A1',
      description: 'Khóa học Tiếng Đức trình độ A1 cho người mới bắt đầu',
      published: true,
    },
  })
  console.log('Course:', course.title)

  const lessonsData = [
    { id: 'de-a1-l1', order: 1, title: 'Bài 1 — Chào hỏi', exercises: [
      { q: 'Cách chào buổi sáng trong tiếng Đức là gì?', opts: ['Guten Morgen', 'Guten Abend', 'Gute Nacht', 'Auf Wiedersehen'], ans: 0, exp: 'Guten Morgen nghĩa là Chào buổi sáng.' },
      { q: 'Từ nào có nghĩa là Xin chào lịch sự?', opts: ['Hallo', 'Tschüss', 'Guten Tag', 'Bitte'], ans: 2, exp: 'Guten Tag là lời chào lịch sự ban ngày.' },
      { q: 'Khi tạm biệt thân mật người Đức nói gì?', opts: ['Auf Wiedersehen', 'Tschüss', 'Guten Morgen', 'Danke'], ans: 1, exp: 'Tschüss là lời tạm biệt thân mật.' },
    ]},
    { id: 'de-a1-l2', order: 2, title: 'Bài 2 — Động từ sein và haben', exercises: [
      { q: 'Ich ___ Student. (sein)', opts: ['bist', 'bin', 'ist', 'sind'], ans: 1, exp: 'bin là dạng sein cho ich.' },
      { q: 'Er ___ ein Buch. (haben)', opts: ['habe', 'hast', 'hat', 'haben'], ans: 2, exp: 'hat là dạng haben cho er/sie/es.' },
      { q: 'Wir ___ Hunger. (haben)', opts: ['hat', 'habe', 'habt', 'haben'], ans: 3, exp: 'haben dùng cho wir.' },
    ]},
    { id: 'de-a1-l3', order: 3, title: 'Bài 3 — Mạo từ', exercises: [
      { q: 'Mạo từ xác định của Buch (trung tính) là gì?', opts: ['der', 'die', 'das', 'den'], ans: 2, exp: 'das Buch - danh từ trung tính dùng das.' },
      { q: '___ Mann - điền mạo từ giống đực?', opts: ['die', 'das', 'der', 'dem'], ans: 2, exp: 'der Mann - giống đực dùng der.' },
      { q: 'Mạo từ bất định của giống cái là gì?', opts: ['ein', 'eine', 'einen', 'einem'], ans: 1, exp: 'eine là mạo từ bất định cho giống cái.' },
    ]},
    { id: 'de-a1-l4', order: 4, title: 'Bài 4 — Động từ thường', exercises: [
      { q: 'kommen chia cho du là gì?', opts: ['komme', 'kommt', 'kommst', 'kommen'], ans: 2, exp: 'du kommst - đuôi -st cho ngôi thứ hai số ít.' },
      { q: 'Nghĩa của wohnen là gì?', opts: ['ăn', 'sống/ở', 'đi', 'làm việc'], ans: 1, exp: 'wohnen = sống, cư trú tại một nơi.' },
      { q: 'Ich ___ gern Musik. (hören)', opts: ['hört', 'höre', 'hörst', 'hören'], ans: 1, exp: 'höre là dạng hören cho ich.' },
    ]},
    { id: 'de-a1-l5', order: 5, title: 'Bài 5 — Câu phủ định', exercises: [
      { q: 'Cách phủ định động từ trong tiếng Đức?', opts: ['kein', 'nicht', 'no', 'nein'], ans: 1, exp: 'nicht dùng để phủ định động từ hoặc tính từ.' },
      { q: 'Ich habe ___ Auto. - dùng từ phủ định nào?', opts: ['nicht', 'keine', 'kein', 'nein'], ans: 2, exp: 'kein phủ định danh từ trung tính không có mạo từ.' },
      { q: 'Das ist ___ richtig. nghĩa là gì?', opts: ['Đó là đúng', 'Đó không đúng', 'Đó có thể đúng', 'Đó rất đúng'], ans: 1, exp: 'nicht richtig = không đúng.' },
    ]},
    { id: 'de-a1-l6', order: 6, title: 'Bài 6 — Số đếm', exercises: [
      { q: 'Số 7 trong tiếng Đức là gì?', opts: ['sechs', 'acht', 'sieben', 'neun'], ans: 2, exp: 'sieben = 7, sechs = 6, acht = 8, neun = 9.' },
      { q: 'zwanzig là số mấy?', opts: ['12', '20', '22', '21'], ans: 1, exp: 'zwanzig = 20.' },
      { q: 'Số 15 đọc là gì?', opts: ['fünfzehn', 'fünfzig', 'funfzehn', 'fünfzehnte'], ans: 0, exp: 'fünfzehn = 15.' },
    ]},
    { id: 'de-a1-l7', order: 7, title: 'Bài 7 — Màu sắc', exercises: [
      { q: 'Blau có nghĩa là màu gì?', opts: ['đỏ', 'xanh lá', 'xanh dương', 'vàng'], ans: 2, exp: 'blau = xanh dương.' },
      { q: 'Màu đỏ trong tiếng Đức là gì?', opts: ['grün', 'gelb', 'schwarz', 'rot'], ans: 3, exp: 'rot = đỏ.' },
      { q: 'Das Auto ist ___. - điền màu trắng?', opts: ['weiß', 'grau', 'braun', 'lila'], ans: 0, exp: 'weiß = trắng.' },
    ]},
    { id: 'de-a1-l8', order: 8, title: 'Bài 8 — Gia đình', exercises: [
      { q: 'die Mutter nghĩa là gì?', opts: ['bố', 'mẹ', 'chị gái', 'bà ngoại'], ans: 1, exp: 'die Mutter = người mẹ.' },
      { q: 'Anh em trai trong tiếng Đức là gì?', opts: ['die Schwester', 'der Bruder', 'der Vater', 'die Tochter'], ans: 1, exp: 'der Bruder = anh/em trai.' },
      { q: 'die Großeltern nghĩa là gì?', opts: ['bố mẹ', 'ông bà', 'anh chị em', 'con cái'], ans: 1, exp: 'die Großeltern = ông bà (số nhiều).' },
    ]},
    { id: 'de-a1-l9', order: 9, title: 'Bài 9 — Thời gian', exercises: [
      { q: 'Wie spät ist es? nghĩa là gì?', opts: ['Hôm nay thứ mấy?', 'Mấy giờ rồi?', 'Ngày mấy?', 'Tháng mấy?'], ans: 1, exp: 'Wie spät ist es? = Bây giờ mấy giờ?' },
      { q: 'Es ist drei Uhr. nghĩa là mấy giờ?', opts: ['2 giờ', '3 giờ', '13 giờ', '30 phút'], ans: 1, exp: 'drei Uhr = 3 giờ.' },
      { q: 'Montag là thứ mấy?', opts: ['Chủ nhật', 'Thứ Bảy', 'Thứ Hai', 'Thứ Ba'], ans: 2, exp: 'Montag = Thứ Hai.' },
    ]},
    { id: 'de-a1-l10', order: 10, title: 'Bài 10 — Đồ vật', exercises: [
      { q: 'der Tisch nghĩa là gì?', opts: ['ghế', 'bàn', 'cửa sổ', 'đèn'], ans: 1, exp: 'der Tisch = cái bàn.' },
      { q: 'Cách nói điện thoại trong tiếng Đức?', opts: ['das Buch', 'der Computer', 'das Handy', 'die Tasche'], ans: 2, exp: 'das Handy = điện thoại di động.' },
      { q: 'die Tasche có nghĩa là gì?', opts: ['cái bàn', 'cái túi/cặp', 'cái ghế', 'cái cửa'], ans: 1, exp: 'die Tasche = cái túi, cặp xách.' },
    ]},
  ]

  for (const lessonData of lessonsData) {
    const lesson = await prisma.lesson.upsert({
      where: { id: lessonData.id },
      update: { title: lessonData.title, order: lessonData.order },
      create: {
        id: lessonData.id,
        courseId: course.id,
        title: lessonData.title,
        order: lessonData.order,
        published: true,
      },
    })
    console.log('  Lesson:', lesson.title)
    for (let i = 0; i < lessonData.exercises.length; i++) {
      const ex = lessonData.exercises[i]
      await prisma.exercise.create({
        data: {
          lessonId: lesson.id,
          type: 'MULTIPLE_CHOICE',
          question: ex.q,
          data: { options: ex.opts, answer: ex.ans, explanation: ex.exp },
          points: 10,
          order: i + 1,
        },
      })
    }
    console.log('    + ' + lessonData.exercises.length + ' exercises')
  }

  console.log('DONE')
}

main().catch(console.error).finally(() => prisma.$disconnect())
