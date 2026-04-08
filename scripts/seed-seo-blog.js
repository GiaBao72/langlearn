const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const posts = [
  {
    title: '5 Phút Tiếng Đức Mỗi Ngày: Phương Pháp Học Hiệu Quả Cho Người Bận Rộn',
    slug: '5-phut-tieng-duc-moi-ngay',
    excerpt: 'Bạn nghĩ cần hàng giờ mỗi ngày mới học được tiếng Đức? Sai. Chỉ cần 5 phút đều đặn, não bộ bạn sẽ ghi nhớ tốt hơn cả người học 1 tiếng mỗi tuần một lần.',
    content: `# 5 Phút Tiếng Đức Mỗi Ngày: Phương Pháp Học Hiệu Quả Cho Người Bận Rộn

Bạn đã bao giờ tự nói với mình: "Tôi muốn học tiếng Đức, nhưng không có thời gian"?

Sự thật là: bạn không cần nhiều thời gian. Bạn chỉ cần **đều đặn**.

## Tại Sao 5 Phút Lại Hiệu Quả Hơn 1 Tiếng?

Khoa học não bộ chỉ ra rằng học ngắn và thường xuyên hiệu quả hơn học dồn một lần. Đây gọi là **Spaced Repetition** — lặp lại ngắt quãng.

Khi bạn học 5 phút mỗi ngày:
- Não ôn lại kiến thức đúng lúc chuẩn bị quên
- Kết nối thần kinh được củng cố liên tục
- Không bị "cognitive overload" như học dồn

Ngược lại, học 1 tiếng mỗi tuần một lần: não quên 70% trong 24 giờ đầu (Đường cong quên lãng Ebbinghaus).

## Công Thức 5 Phút Tiếng Đức Mỗi Ngày

**Phút 1-2:** Ôn lại từ vựng hôm qua (flashcard)

**Phút 3:** Học từ mới — chỉ 3-5 từ thôi

**Phút 4:** Đặt câu với từ mới

**Phút 5:** Nghe 1 câu tiếng Đức và nhắc lại

Đơn giản vậy thôi. Làm đủ 30 ngày, bạn sẽ có 90-150 từ vựng nhớ chắc.

## Bộ Sách "5 Phút Tiếng Đức" — Học Theo Lộ Trình Có Sẵn

Thay vì tự thiết kế giáo trình, bộ sách [5 Phút Tiếng Đức](https://5phuttiengduc.giabaobooks.vn) đã làm sẵn cho bạn:

- **60 bài học** được thiết kế vừa đúng 5 phút
- Từ A1 (zero) đến B1 (giao tiếp được)
- Audio giọng bản xứ, bài tập kèm đáp án
- Kết hợp hoàn hảo với nền tảng [LangLearn](https://tuhoctiengduc.giabaobooks.vn)

## Bắt Đầu Ngay Hôm Nay

Đừng đợi "có nhiều thời gian hơn" — điều đó sẽ không xảy ra. Bắt đầu với 5 phút ngay bây giờ.

1. Tạo tài khoản miễn phí tại [LangLearn](https://tuhoctiengduc.giabaobooks.vn/register)
2. Làm bài kiểm tra trình độ
3. Học 5 phút đầu tiên

Streak bắt đầu từ hôm nay. Sau 30 ngày, bạn sẽ ngạc nhiên với chính mình.`,
    published: true,
    publishedAt: new Date('2026-03-15'),
  },
  {
    title: 'Review Sách 5 Phút Tiếng Đức: Có Thật Sự Hiệu Quả Không?',
    slug: 'review-sach-5-phut-tieng-duc',
    excerpt: 'Đánh giá chi tiết bộ sách 5 Phút Tiếng Đức sau khi dùng thực tế 90 ngày. Ưu điểm, nhược điểm, và ai nên mua.',
    content: `# Review Sách 5 Phút Tiếng Đức: Có Thật Sự Hiệu Quả Không?

Có rất nhiều sách học tiếng Đức ngoài thị trường. Vậy **5 Phút Tiếng Đức** có gì khác biệt?

Mình đã dùng bộ sách này 90 ngày, kết hợp với luyện tập trên [LangLearn](https://tuhoctiengduc.giabaobooks.vn). Đây là đánh giá thật.

## Điểm Mạnh

### 1. Thiết kế bài học cực ngắn, cực rõ

Mỗi bài học chỉ 1-2 trang. Không lý thuyết dài dòng. Học xong là thực hành luôn. Hoàn toàn phù hợp với người bận.

### 2. Từ vựng chọn lọc thực tế

Không học những từ kiểu "das Nilpferd" (con hà mã) trước. Sách ưu tiên những từ dùng được ngay trong cuộc sống hàng ngày.

### 3. Audio chất lượng cao

Giọng đọc là người bản xứ Đức, phát âm chuẩn. Nghe quen tai từ đầu — quan trọng để tránh học sai phát âm.

### 4. Bài tập đa dạng

Điền từ, trắc nghiệm, dịch câu — không lặp lại một dạng. Giống hệt cách luyện tập trên LangLearn.

## Điểm Cần Lưu Ý

- Sách phù hợp nhất cho người mới hoàn toàn đến B1
- Cần kết hợp thêm nền tảng online để luyện nghe nhiều hơn
- Không có phần luyện nói trực tiếp (cần partner hoặc app khác)

## Kết Luận

Nếu bạn đang tìm một bộ sách để **bắt đầu tiếng Đức mà không bị overwhelm**, đây là lựa chọn tốt nhất mình từng thử.

**Giá:** 149.000đ — hợp lý cho chất lượng này.

Đặt mua tại [5phuttiengduc.giabaobooks.vn](https://5phuttiengduc.giabaobooks.vn) — Luyện tập miễn phí tại [LangLearn](https://tuhoctiengduc.giabaobooks.vn)`,
    published: true,
    publishedAt: new Date('2026-03-22'),
  },
  {
    title: 'Lộ Trình Học Tiếng Đức Từ Đầu: Từ A1 Đến B2 Trong 12 Tháng',
    slug: 'lo-trinh-hoc-tieng-duc-tu-a1-den-b2',
    excerpt: 'Hướng dẫn chi tiết lộ trình học tiếng Đức từ zero cho người Việt: cần bao lâu, học gì trước, và công cụ nào phù hợp từng giai đoạn.',
    content: `# Lộ Trình Học Tiếng Đức Từ Đầu: Từ A1 Đến B2 Trong 12 Tháng

Tiếng Đức có tiếng là khó — nhưng với lộ trình đúng, người Việt hoàn toàn có thể đạt B2 trong 12 tháng học nghiêm túc.

## Tại Sao Cần Lộ Trình Rõ Ràng?

Nhiều người học lan man: hôm nay app này, tuần sau sách khác, tháng sau lại đổi. Kết quả: 1 năm vẫn ở A1.

Lộ trình giúp bạn biết **mình đang ở đâu** và **bước tiếp theo là gì**.

## Lộ Trình Chi Tiết

### Giai đoạn 1: A1 (Tháng 1-2)

**Mục tiêu:** Chào hỏi, giới thiệu bản thân, số đếm, màu sắc, mua sắm cơ bản.

**Học gì:**
- Bộ sách [5 Phút Tiếng Đức](https://5phuttiengduc.giabaobooks.vn) — Bài 1 đến 20
- Luyện tập flashcard trên [LangLearn](https://tuhoctiengduc.giabaobooks.vn)
- 15-20 phút/ngày

**Cột mốc cuối giai đoạn:** Tự giới thiệu được bằng tiếng Đức trong 2 phút.

### Giai đoạn 2: A2 (Tháng 3-4)

**Mục tiêu:** Mô tả thói quen, hỏi đường, viết tin nhắn ngắn.

**Học gì:**
- 5 Phút Tiếng Đức — Bài 21 đến 40
- Bắt đầu nghe podcast tiếng Đức chậm (DW Langsam gesprochene Nachrichten)
- Tăng lên 25-30 phút/ngày

### Giai đoạn 3: B1 (Tháng 5-7)

**Mục tiêu:** Giao tiếp tự nhiên, hiểu podcast tốc độ bình thường.

**Học gì:**
- 5 Phút Tiếng Đức — Bài 41 đến 60 (hoàn thành bộ sách)
- Đọc báo đơn giản bằng tiếng Đức
- Viết nhật ký 3-5 câu mỗi ngày

### Giai đoạn 4: B2 (Tháng 8-12)

**Mục tiêu:** Làm việc, học tập được bằng tiếng Đức.

**Học gì:**
- Đọc sách, xem phim tiếng Đức không phụ đề
- Tham gia hội thoại với người bản xứ (Tandem, iTalki)
- Ôn luyện ngữ pháp nâng cao

## Bắt Đầu Ngay

Lộ trình chỉ hiệu quả khi bắt đầu ngay hôm nay.

1. Mua sách [5 Phút Tiếng Đức](https://5phuttiengduc.giabaobooks.vn) — tài liệu học chính
2. Tạo tài khoản [LangLearn miễn phí](https://tuhoctiengduc.giabaobooks.vn/register) — luyện tập hàng ngày
3. Xem [lộ trình chi tiết trên LangLearn](https://tuhoctiengduc.giabaobooks.vn/roadmap)`,
    published: true,
    publishedAt: new Date('2026-03-29'),
  },
]

async function main() {
  for (const post of posts) {
    const existing = await prisma.blogPost.findUnique({ where: { slug: post.slug } })
    if (existing) {
      console.log('Skip (exists):', post.slug)
      continue
    }
    await prisma.blogPost.create({ data: post })
    console.log('Created:', post.slug)
  }
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
