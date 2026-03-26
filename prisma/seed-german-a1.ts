import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const course = await prisma.course.upsert({
    where: { id: 'german-a1' },
    update: {},
    create: {
      id: 'german-a1',
      title: 'Tieng Duc A1',
      language: 'de',
      level: 'A1',
      description: '10 bai tap trac nghiem tieng Duc cap do A1',
      published: true,
    }
  })
  console.log('Course:', course.title)

  const lessons = [
    { title: 'Bai 1 - Chao hoi va Gioi thieu ban than', order: 1 },
    { title: 'Bai 2 - Dong tu sein va haben', order: 2 },
    { title: 'Bai 3 - Mao tu va Danh tu', order: 3 },
    { title: 'Bai 4 - Dong tu thuong thi hien tai', order: 4 },
    { title: 'Bai 5 - Cau phu dinh va cau hoi', order: 5 },
    { title: 'Bai 6 - So dem 1-100', order: 6 },
    { title: 'Bai 7 - Mau sac va hinh dang', order: 7 },
    { title: 'Bai 8 - Gia dinh va nguoi than', order: 8 },
    { title: 'Bai 9 - Thoi gian', order: 9 },
    { title: 'Bai 10 - Do vat trong nha', order: 10 },
  ]

  for (const l of lessons) {
    const lesson = await prisma.lesson.upsert({
      where: { id: course.id + '-' + l.order },
      update: {},
      create: {
        id: course.id + '-' + l.order,
        courseId: course.id,
        title: l.title,
        order: l.order,
        content: l.title,
        published: true,
      }
    })
    console.log('Lesson:', lesson.title)
  }

  console.log('Seed xong!')
}

main().catch(console.error).finally(() => prisma.$disconnect())
