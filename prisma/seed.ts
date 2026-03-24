import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hash = await bcrypt.hash('admin123', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@langlearn.vn' },
    update: {},
    create: {
      email: 'admin@langlearn.vn',
      name: 'Admin',
      passwordHash: hash,
      role: 'ADMIN',
    },
  })

  const user = await prisma.user.upsert({
    where: { email: 'test@langlearn.vn' },
    update: {},
    create: {
      email: 'test@langlearn.vn',
      name: 'Test User',
      passwordHash: hash,
      role: 'USER',
    },
  })

  const course = await prisma.course.upsert({
    where: { id: 'seed-course-1' },
    update: {},
    create: {
      id: 'seed-course-1',
      title: 'Tiếng Đức cho người mới bắt đầu',
      language: 'Tiếng Đức',
      level: 'A1',
      description: 'Khóa học dành cho người bắt đầu từ con số 0.',
      published: true,
    },
  })

  const lesson1 = await prisma.lesson.upsert({
    where: { id: 'seed-lesson-1' },
    update: {},
    create: {
      id: 'seed-lesson-1',
      title: 'Bài 1: Chào hỏi cơ bản',
      courseId: course.id,
      order: 1,
      published: true,
    },
  })

  const lesson2 = await prisma.lesson.upsert({
    where: { id: 'seed-lesson-2' },
    update: {},
    create: {
      id: 'seed-lesson-2',
      title: 'Bài 2: Giới thiệu bản thân',
      courseId: course.id,
      order: 2,
      published: true,
    },
  })

  await prisma.exercise.createMany({
    skipDuplicates: true,
    data: [
      {
        id: 'seed-ex-1',
        lessonId: lesson1.id,
        type: 'MULTIPLE_CHOICE',
        question: '"Guten Morgen" co nghia la gi?',
        data: { options: ['Chao buoi sang', 'Chao buoi toi', 'Tam biet', 'Cam on'], answer: 'Chao buoi sang' },
        order: 1,
      },
      {
        id: 'seed-ex-2',
        lessonId: lesson1.id,
        type: 'MULTIPLE_CHOICE',
        question: 'Cach noi "Xin chao" trong tieng Duc la?',
        data: { options: ['Hallo', 'Danke', 'Bitte', 'Ja'], answer: 'Hallo' },
        order: 2,
      },
      {
        id: 'seed-ex-3',
        lessonId: lesson1.id,
        type: 'MULTIPLE_CHOICE',
        question: '"Auf Wiedersehen" co nghia la gi?',
        data: { options: ['Tam biet', 'Xin loi', 'Vang', 'Khong'], answer: 'Tam biet' },
        order: 3,
      },
    ],
  })

  console.log('Seed done!')
  console.log('Admin:', admin.email, '/ admin123')
  console.log('User:', user.email, '/ admin123')
  console.log('Course:', course.title)
  console.log('Lessons:', lesson1.title, lesson2.title)
}

main().catch(console.error).finally(() => prisma.$disconnect())
