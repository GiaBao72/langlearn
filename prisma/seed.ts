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
    update: { published: true, publishedAt: new Date() },
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
      update: { published: true, publishedAt: new Date() },
      create: ex,
    })
    console.log('✅ Exercise:', ex.type, '—', ex.question.substring(0, 45))
  }

  console.log('\n🎉 Seed hoàn tất!')
  console.log('📚 Course ID:', course.id)
  console.log('📖 Lesson ID:', lesson.id)
  console.log('🔐 Login: admin@langlearn.vn / Admin@2026')
  console.log('🎯 Practice URL: /practice/' + lesson.id)

  // Blog Posts — 10 bài
  const blogData = [
    { id: 'blog-01', slug: 'tai-sao-nao-ban-quen-ngoai-ngu', title: 'Tại sao não bạn quên ngoại ngữ sau 1 tuần (và cách chống lại điều đó)', excerpt: 'Bạn học xong một từ, cảm giác thuộc lắm. Nhưng 3 ngày sau mở sách ra — trắng. Đây không phải lỗi của bạn. Đây là cách não bộ hoạt động.', content: 'Não bộ chỉ giữ lại những gì được dùng nhiều lần. Hermann Ebbinghaus phát hiện ra đường cong quên lãng năm 1885: sau 1 ngày quên 74%, sau 1 tuần quên 77%. Giải pháp: Spaced Repetition — ôn đúng trước khi não định xóa. Học 5 phút mỗi ngày đều đặn hiệu quả hơn nhồi nhét 2 tiếng mỗi tuần.' },
    { id: 'blog-02', slug: 'hoc-tieng-duc-co-kho-khong', title: 'Học tiếng Đức có khó không? Sự thật không ai nói cho bạn', excerpt: 'Mọi người đều bảo tiếng Đức khó. Nhưng "khó" theo nghĩa nào? Chiều dài cấu trúc câu? Giống từ? Hay chỉ là tâm lý sợ hãi từ đầu?', content: 'Tiếng Đức có 3 giống từ và 4 cách — nhưng phát âm nhất quán hơn tiếng Anh, từ vựng gần với tiếng Anh (cùng nhóm Germanic), và ngữ pháp có logic rõ ràng. FSI ước tính cần 750 giờ để đạt B2. Học 30 phút/ngày = 4-5 năm. Nhưng với môi trường tốt và phương pháp đúng, có thể nhanh hơn nhiều.' },
    { id: 'blog-03', slug: '5-loi-nguoi-viet-hay-mac-khi-hoc-ngoai-ngu', title: '5 lỗi người Việt hay mắc khi học ngoại ngữ (và cách sửa)', excerpt: 'Không phải thiếu tài năng. Hầu hết người học ngoại ngữ thất bại vì những lỗi rất cụ thể — và hoàn toàn có thể sửa được.', content: '1. Học để đọc, không học để nói — ngôn ngữ là kỹ năng vận động, phải luyện. 2. Chờ đủ giỏi mới nói — tự tin đến từ việc làm, không phải chuẩn bị. 3. Học từ vựng theo danh sách không ngữ cảnh — não ghi nhớ qua câu chuyện. 4. Nhồi nhét không ôn đúng lịch — cần tần suất, không cần cường độ. 5. Bỏ cuộc tại intermediate plateau — đây là giai đoạn bình thường trước bước nhảy.' },
    { id: 'blog-04', slug: 'bi-kip-hoc-tu-vung-khong-quen', title: 'Bí kíp học từ vựng không quên: Phương pháp của người đa ngữ', excerpt: 'Người nói được 5-6 ngôn ngữ không có trí nhớ siêu việt. Họ chỉ học từ vựng theo cách khác.', content: '5 kỹ thuật: 1) Memory stories — tạo câu chuyện nhỏ cho từng từ, não nhớ điều kỳ lạ. 2) Spaced Repetition — ôn sau 1 ngày, 3 ngày, 1 tuần, 2 tuần. 3) Chunking — học cụm từ, không học từ đơn. 4) Comprehensible input i+1 — material hơi khó hơn trình hiện tại một chút. 5) Dùng ngay trong 24h — tạo câu, viết nhật ký, nói to.' },
    { id: 'blog-05', slug: 'xem-phim-hoc-tieng-duc-hieu-qua', title: 'Xem phim học tiếng Đức: 7 bộ phim hay + cách xem để thực sự học được', excerpt: 'Xem phim học ngoại ngữ nghe có vẻ dễ — nhưng nếu làm sai cách, bạn chỉ đang xem phim mà thôi.', content: 'Cách đúng: 1) Dùng phụ đề tiếng Đức (không phải tiếng Việt). 2) Shadowing — bắt chước đoạn hội thoại ngắn. 3) Ghi lại 3-5 câu hay mỗi tập. Phim gợi ý: A1-A2: Türkisch für Anfänger, Bibi & Tina. A2-B1: How to Sell Drugs Online (Fast), Babylon Berlin. B1+: Das Boot, Tatort. Công cụ: Language Reactor (Chrome extension) tích hợp phụ đề song ngữ trực tiếp trên Netflix.' },
    { id: 'blog-06', slug: 'ngay-dau-hoc-tieng-duc-nen-hoc-gi', title: 'Ngày đầu học tiếng Đức: Bắt đầu từ đâu để không bỏ cuộc sau 1 tuần', excerpt: 'Hầu hết người bỏ học trong tuần đầu tiên — không phải vì khó, mà vì bắt đầu sai chỗ.', content: 'Tuần 1 học đúng 3 thứ: 1) Phát âm cơ bản trong 30 phút — ü, ö, ä, ch, r. 2) 20 câu giao tiếp sống còn: Hallo, Wie heißt du? Ich heiße... Woher kommst du? Ich komme aus Vietnam. Ich verstehe nicht. 3) Cấu trúc câu Chủ ngữ + Động từ + Tân ngữ. Lịch: Ngày 1-3 học 5 câu/ngày. Ngày 4-5 học cấu trúc. Ngày 6 ôn + xem video. Ngày 7 nghỉ ngơi.' },
    { id: 'blog-07', slug: 'streak-va-thoi-quen-hoc-ngoai-ngu', title: 'Streak — Tại sao "chuỗi ngày học" lại mạnh hơn ý chí', excerpt: 'Ý chí cạn dần. Nhưng thói quen thì không. Người học đều đặn 5 phút/ngày tiến bộ hơn người học 3 tiếng cuối tuần.', content: 'Ý chí là tài nguyên có giới hạn. Streak hoạt động qua 2 nguyên lý: Loss aversion — sợ phá vỡ chuỗi mạnh hơn muốn học. Identity — sau 21 ngày bạn tự nhận là "người học tiếng Đức mỗi ngày". Ngưỡng tối thiểu: 5 phút/ngày cũng tính. Quy tắc "never miss twice": bỏ 1 ngày là tai nạn, bỏ 2 ngày là thói quen mới. Bắt đầu với mục tiêu nhỏ, tăng dần sau 3 tuần.' },
    { id: 'blog-08', slug: 'nguphap-tieng-duc-cho-nguoi-moi', title: 'Ngữ pháp tiếng Đức cho người mới: Hiểu đúng 5 điểm cốt lõi là đủ', excerpt: 'Chỉ cần nắm vững 5 điểm cốt lõi, bạn đã có thể xây dựng được phần lớn câu cần dùng hàng ngày.', content: '5 điểm cốt lõi: 1) Sein và haben — 2 động từ quan trọng nhất, học thuộc đầy đủ. 2) V2 rule — động từ chính luôn ở vị trí thứ 2 trong câu. 3) 3 giống từ — học kèm mạo từ: das Fenster, der Mann, die Frau. Mẹo: -ung/-heit/-keit → die, -er/-ling → der, -chen/-lein → das. 4) Thì Präsens và Perfekt là đủ cho A1-A2. 5) Phủ định: nicht với động từ, kein với danh từ. Lộ trình ngữ pháp theo tháng từ cơ bản đến nâng cao.' },
    { id: 'blog-09', slug: 'hoc-tieng-duc-voi-5-phut-moi-ngay', title: '5 phút mỗi ngày học tiếng Đức: Lịch học thực tế cho người bận', excerpt: 'Không có thời gian không phải lý do để không học. Đây là lịch học cho người bận — chỉ 5-15 phút/ngày.', content: '5 phút hiệu quả = ôn 10-15 từ bằng Spaced Repetition hoặc xem 1 clip ngắn. Lịch cho người cực bận: 2 phút sáng ôn từ cũ + 3 phút trưa học từ mới. Tận dụng thời gian chết: đi xe nghe podcast Coffee Break German / Slow German. Tập thể dục nghe nhạc Đức. Chờ đợi ôn flashcard. Quy tắc 2 phút: cầm điện thoại có 2 phút → ôn 5 từ ngay. Sau 1 năm học 5 phút/ngày: ~30 giờ, đủ nền A1 và thói quen bền vững.' },
    { id: 'blog-10', slug: 'tu-vung-tieng-duc-chu-de-hang-ngay', title: '200 từ vựng tiếng Đức theo chủ đề: Học đúng thứ cần dùng', excerpt: 'Học 200 từ đúng chủ đề giúp bạn giao tiếp trong 80% tình huống hàng ngày.', content: '10 chủ đề, 20 từ mỗi chủ đề: 1) Bản thân & Gia đình: Mann, Frau, Kind, Vater, Mutter, Familie, Freund, Name, Beruf, Sprache... 2) Thức ăn: Brot, Wurst, Käse, Gemüse, Obst, Wasser, Kaffee, Bier... 3) Mua sắm: kaufen, teuer, billig, Geld, Kreditkarte, bezahlen, Supermarkt... 4) Giao thông: Zug, Auto, Bus, Bahnhof, links, rechts, geradeaus... 5) Sức khỏe: krank, gesund, Schmerz, Fieber, Arzt, Apotheke... và 5 chủ đề nữa. Cách học: 1 chủ đề/tuần, 20 từ/tuần = 200 từ sau 10 tuần.' },
  ]

  for (const blog of blogData) {
    await prisma.blogPost.upsert({
      where: { slug: blog.slug },
      update: { published: true, publishedAt: new Date() },
      create: { ...blog, publishedAt: new Date() },
    })
    console.log('✅ Blog:', blog.title.substring(0, 55))
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
