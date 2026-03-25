/**
 * Seed script: tạo 1 course + 1 lesson + 5 bài tập demo (1 mỗi loại)
 * Run: npx ts-node --project tsconfig.json prisma/seed.ts
 * hoặc: npx tsx prisma/seed.ts
 */

import { PrismaClient, ExerciseType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding...')

  // 1. Admin user
  const adminHash = await bcrypt.hash('Admin@2026', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@langlearn.vn' },
    update: {},
    create: {
      email: 'admin@langlearn.vn',
      passwordHash: adminHash,
      name: 'Admin',
      role: 'ADMIN',
    },
  })
  console.log('✅ Admin:', admin.email)

  // 2. Course
  const course = await prisma.course.upsert({
    where: { id: 'course-german-a1' },
    update: {},
    create: {
      id: 'course-german-a1',
      title: 'Tiếng Đức A1 — Căn bản',
      language: 'Tiếng Đức',
      level: 'A1',
      description: 'Khóa học tiếng Đức từ đầu cho người mới bắt đầu. Học từ vựng, ngữ pháp và hội thoại cơ bản trong 8 tuần.',
      published: true,
    },
  })
  console.log('✅ Course:', course.title)

  // 3. Lesson
  const lesson = await prisma.lesson.upsert({
    where: { id: 'lesson-1-gioi-thieu' },
    update: {},
    create: {
      id: 'lesson-1-gioi-thieu',
      courseId: course.id,
      title: 'Bài 1 — Tự giới thiệu bản thân',
      order: 1,
      content: 'Trong bài này bạn sẽ học cách giới thiệu tên, tuổi, và nghề nghiệp bằng tiếng Đức.',
      published: true,
    },
  })
  console.log('✅ Lesson:', lesson.title)

  // 4. Exercises — 5 loại
  const exercises = [
    {
      id: 'ex-flashcard-1',
      lessonId: lesson.id,
      type: ExerciseType.FLASHCARD,
      question: 'Bạn có nhớ nghĩa của từ này không?',
      points: 10,
      order: 1,
      data: {
        front: 'Guten Morgen',
        back: 'Chào buổi sáng',
        audioText: 'Guten Morgen',
        example: 'Guten Morgen! Wie geht es dir?',
      },
    },
    {
      id: 'ex-fillblank-1',
      lessonId: lesson.id,
      type: ExerciseType.FILL_BLANK,
      question: 'Điền từ thích hợp vào chỗ trống để hoàn thành câu:',
      points: 15,
      order: 2,
      data: {
        sentence: 'Ich ___ aus Vietnam.',
        answer: 'komme',
        hint: 'Động từ "đến từ" chia ở ngôi thứ nhất số ít (kommen → ich ...)',
        fullSentence: 'Ich komme aus Vietnam.',
        translation: 'Tôi đến từ Việt Nam.',
      },
    },
    {
      id: 'ex-multiplechoice-1',
      lessonId: lesson.id,
      type: ExerciseType.MULTIPLE_CHOICE,
      question: '"Wie heißt du?" có nghĩa là gì?',
      points: 10,
      order: 3,
      data: {
        options: [
          { label: 'A', text: 'Bạn bao nhiêu tuổi?' },
          { label: 'B', text: 'Bạn tên là gì?' },
          { label: 'C', text: 'Bạn ở đâu?' },
          { label: 'D', text: 'Bạn khỏe không?' },
        ],
        answer: 'B',
        explanation: '"Heißen" có nghĩa là "tên là". "Wie heißt du?" = Tên bạn là gì?',
      },
    },
    {
      id: 'ex-dictation-1',
      lessonId: lesson.id,
      type: ExerciseType.DICTATION,
      question: 'Nghe và gõ lại câu bạn vừa nghe:',
      points: 20,
      order: 4,
      data: {
        audioText: 'Mein Name ist Anna.',
        answer: 'Mein Name ist Anna.',
        translation: 'Tên tôi là Anna.',
        hint: 'Câu giới thiệu tên đơn giản nhất trong tiếng Đức',
      },
    },
    {
      id: 'ex-sortwords-1',
      lessonId: lesson.id,
      type: ExerciseType.SORT_WORDS,
      question: 'Sắp xếp các từ sau thành câu hoàn chỉnh:',
      points: 15,
      order: 5,
      data: {
        words: ['Jahre', 'bin', 'Ich', 'alt', 'zwanzig'],
        answer: 'Ich bin zwanzig Jahre alt.',
        translation: 'Tôi hai mươi tuổi.',
        hint: 'Cấu trúc: Chủ ngữ + động từ + số tuổi + Jahre alt',
      },
    },
  ]

  for (const ex of exercises) {
    await prisma.exercise.upsert({
      where: { id: ex.id },
      update: {},
      create: ex,
    })
    console.log('✅ Exercise:', ex.type, '-', ex.question.substring(0, 40))
  }

  console.log('\n🎉 Seed complete!')
  console.log('📚 Course ID:', course.id)
  console.log('📖 Lesson ID:', lesson.id)
  console.log('🔐 Admin: admin@langlearn.vn / Admin@2026')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
