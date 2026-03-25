/**
 * Seed: 1 course + 1 lesson + 5 demo exercises từ Gemini
 * Run: npx tsx prisma/seed.ts
 */
import { PrismaClient, ExerciseType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding...')

  // Admin
  const adminHash = await bcrypt.hash('Admin@2026', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@langlearn.vn' },
    update: {},
    create: { email: 'admin@langlearn.vn', passwordHash: adminHash, name: 'Admin', role: 'ADMIN' },
  })
  console.log('✅ Admin:', admin.email)

  // Course
  const course = await prisma.course.upsert({
    where: { id: 'course-german-a1' },
    update: { published: true },
    create: {
      id: 'course-german-a1',
      title: 'Tiếng Đức A1 — Căn bản',
      language: 'Tiếng Đức',
      level: 'A1',
      description: 'Khóa học tiếng Đức từ đầu cho người mới. Học từ vựng, ngữ pháp và hội thoại cơ bản trong 8 tuần.',
      published: true,
    },
  })
  console.log('✅ Course:', course.title)

  // Lesson
  const lesson = await prisma.lesson.upsert({
    where: { id: 'lesson-1-gioi-thieu' },
    update: { published: true },
    create: {
      id: 'lesson-1-gioi-thieu',
      courseId: course.id,
      title: 'Bài 1 — Tự giới thiệu bản thân',
      order: 1,
      content: 'Học cách chào hỏi, giới thiệu tên, tuổi, nghề nghiệp bằng tiếng Đức.',
      published: true,
    },
  })
  console.log('✅ Lesson:', lesson.title)

  // Exercises (data từ Gemini + Chó review)
  const exercises = [
    {
      id: 'ex-flashcard-1',
      lessonId: lesson.id,
      type: ExerciseType.FLASHCARD,
      question: 'Nhớ lại nghĩa của từ này. Click để lật thẻ!',
      points: 10,
      order: 1,
      data: {
        front: 'die Arbeit',
        back: 'công việc, việc làm',
        audioText: 'die Arbeit',
        example: 'Meine Arbeit macht mir Spaß.',
        exampleTranslation: 'Tôi thích công việc của mình.',
      },
    },
    {
      id: 'ex-fillblank-1',
      lessonId: lesson.id,
      type: ExerciseType.FILL_BLANK,
      question: 'Điền từ đúng vào chỗ trống:',
      points: 15,
      order: 2,
      data: {
        sentence: 'Ich ___ jeden Tag Deutsch.',
        answer: 'lerne',
        hint: 'Động từ "lernen" (học) chia ngôi Ich → ich ___',
        fullSentence: 'Ich lerne jeden Tag Deutsch.',
        translation: 'Tôi học tiếng Đức mỗi ngày.',
      },
    },
    {
      id: 'ex-multiplechoice-1',
      lessonId: lesson.id,
      type: ExerciseType.MULTIPLE_CHOICE,
      question: 'Chọn nghĩa đúng của câu: "Woher kommst du?"',
      points: 10,
      order: 3,
      data: {
        options: [
          { label: 'A', text: 'Bạn đi đâu vậy?' },
          { label: 'B', text: 'Bạn tên là gì?' },
          { label: 'C', text: 'Bạn đến từ đâu?' },
          { label: 'D', text: 'Bạn bao nhiêu tuổi?' },
        ],
        answer: 'C',
        explanation: '"Woher" = từ đâu, "kommen" = đến/đến từ. "Woher kommst du?" = Bạn đến từ đâu?',
      },
    },
    {
      id: 'ex-dictation-1',
      lessonId: lesson.id,
      type: ExerciseType.DICTATION,
      question: 'Nghe và gõ lại chính xác câu bạn nghe được:',
      points: 20,
      order: 4,
      data: {
        audioText: 'Ich heiße Anna und komme aus Deutschland.',
        answer: 'Ich heiße Anna und komme aus Deutschland.',
        translation: 'Tôi tên là Anna và đến từ Đức.',
        hint: 'Lắng nghe kỹ phần tên và quốc gia',
      },
    },
    {
      id: 'ex-sortwords-1',
      lessonId: lesson.id,
      type: ExerciseType.SORT_WORDS,
      question: 'Sắp xếp các từ thành câu hoàn chỉnh:',
      points: 15,
      order: 5,
      data: {
        words: ['alt', 'bin', 'Ich', 'Jahre', 'zwanzig'],
        answer: 'Ich bin zwanzig Jahre alt.',
        translation: 'Tôi hai mươi tuổi.',
        hint: 'Cấu trúc: Chủ ngữ + động từ sein + số + Jahre + alt',
      },
    },
  ]

  for (const ex of exercises) {
    await prisma.exercise.upsert({
      where: { id: ex.id },
      update: {},
      create: ex,
    })
    console.log('✅ Exercise:', ex.type, '—', ex.question.substring(0, 45))
  }

  console.log('\n🎉 Seed hoàn tất!')
  console.log('📚 Course ID:', course.id)
  console.log('📖 Lesson ID:', lesson.id)
  console.log('🔐 Login: admin@langlearn.vn / Admin@2026')
  console.log('🎯 Practice URL: /practice/' + lesson.id)
}

main().catch(console.error).finally(() => prisma.$disconnect())
