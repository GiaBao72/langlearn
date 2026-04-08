const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  // Update bài 1
  await prisma.blogPost.updateMany({
    where: { slug: '5-phut-tieng-duc-moi-ngay' },
    data: {
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

**Phút 1:** Đọc mẩu chuyện ngắn tiếng Đức + bản dịch tiếng Việt

**Phút 2:** Xem phiên âm, đọc to 2-3 lần

**Phút 3:** Học 2 từ vựng nổi bật trong bài

**Phút 4:** Nghe file audio giọng bản xứ, nhắc lại

**Phút 5:** Đọc câu danh ngôn cuối bài — nhớ cả ý nghĩa lẫn ngôn ngữ

Đơn giản vậy thôi. Làm đủ 200 ngày, bạn sẽ có 500+ từ vựng nhớ chắc và phản xạ ngôn ngữ tự nhiên.

## Bộ Sách "5 Phút Tiếng Đức" — Học Theo Lộ Trình Có Sẵn

Thay vì tự thiết kế giáo trình, bộ sách [5 Phút Tiếng Đức](https://5phuttiengduc.giabaobooks.vn) đã làm sẵn cho bạn:

- **200 bài học — 200 mẩu chuyện ngắn** mỗi bài đúng 5 phút
- Mỗi bài: tiếng Đức + dịch tiếng Việt + 2 từ vựng nổi bật + phiên âm + câu danh ngôn
- **500+ từ vựng cốt lõi** thấm vào não một cách tự nhiên
- **200 file audio MP3** giọng bản xứ Đức + PDF 500 từ vựng
- Phương pháp học thụ động — không nhồi nhét ngữ pháp
- Kết hợp hoàn hảo với luyện tập trên [LangLearn](https://tuhoctiengduc.giabaobooks.vn)

## Combo Đặc Biệt

Khi đặt mua, bạn nhận được: **1 cuốn sách in + 200 file audio MP3 + PDF 500 từ vựng**

Giá chỉ **149.000đ** (gốc 200.000đ). Và đặc biệt: **nhận sách rồi mới thanh toán**.

## Bắt Đầu Ngay Hôm Nay

Đừng đợi "có nhiều thời gian hơn" — điều đó sẽ không xảy ra. Bắt đầu với 5 phút ngay bây giờ.

1. [Đặt mua sách 5 Phút Tiếng Đức](https://5phuttiengduc.giabaobooks.vn) — nhận sách rồi mới trả tiền
2. Tạo tài khoản miễn phí tại [LangLearn](https://tuhoctiengduc.giabaobooks.vn/register)
3. Kết hợp đọc sách + luyện flashcard mỗi ngày

Streak bắt đầu từ hôm nay. Sau 200 ngày, bạn sẽ ngạc nhiên với chính mình.`,
    },
  })
  console.log('Updated: 5-phut-tieng-duc-moi-ngay')

  // Update bài 2
  await prisma.blogPost.updateMany({
    where: { slug: 'review-sach-5-phut-tieng-duc' },
    data: {
      content: `# Review Sách 5 Phút Tiếng Đức: Có Thật Sự Hiệu Quả Không?

Có rất nhiều sách học tiếng Đức ngoài thị trường. Vậy **5 Phút Tiếng Đức** có gì khác biệt?

Mình đã dùng bộ sách này hơn 3 tháng, kết hợp với luyện tập trên [LangLearn](https://tuhoctiengduc.giabaobooks.vn). Đây là đánh giá thật.

## Combo Bao Gồm Gì?

Khi đặt mua, bạn nhận được cả combo:
- **1 cuốn sách in** với 200 bài học — 200 mẩu chuyện
- **200 file audio MP3** chuẩn giọng bản xứ Đức
- **PDF 500 từ vựng cốt lõi** dùng kèm

Giá **149.000đ** (gốc 200.000đ) — và chính sách **nhận sách rồi mới thanh toán** nên không có rủi ro gì.

## Điểm Mạnh

### 1. Format mỗi bài rất rõ ràng

Mỗi bài học gồm: mẩu chuyện tiếng Đức → dịch tiếng Việt → 2 từ vựng nổi bật → phiên âm dễ đọc → câu danh ngôn. Vừa đọc xong là biết mình học được gì.

### 2. Học thụ động — không bị áp lực

Không có bài tập bắt buộc làm mỗi tối. Bạn đọc chuyện như đọc báo — từ vựng tự thấm. Phù hợp với người không có năng lượng sau giờ làm.

### 3. 200 file audio chất lượng cao

Giọng đọc người bản xứ Đức, rõ ràng, tốc độ vừa phải cho người mới. Nghe quen tai từ đầu — không lo phát âm sai.

### 4. 500+ từ vựng thực tế

Không học những từ xa lạ trước. Sách chọn lọc từ dùng được ngay trong đời thường — đi chợ, hỏi đường, giới thiệu bản thân.

### 5. Kết hợp tốt với LangLearn

Sau khi đọc bài trong sách, mình dùng [LangLearn](https://tuhoctiengduc.giabaobooks.vn) để luyện lại từ vựng bằng flashcard và bài tập trắc nghiệm. Hai công cụ bổ trợ nhau rất hay.

## Điểm Cần Lưu Ý

- Sách tập trung vào **đọc và nghe**, không có phần luyện nói trực tiếp
- Cần tự kỷ luật đọc đều mỗi ngày — sách không có app nhắc nhở (nhưng LangLearn có streak!)
- Nếu muốn lên B2 nhanh thì cần thêm tài liệu ngữ pháp bổ sung sau khi học xong sách

## Kết Luận

Nếu bạn đang tìm một bộ sách để **bắt đầu tiếng Đức mà không bị overwhelm**, đây là lựa chọn tốt nhất mình từng thử.

**149.000đ** cho sách + audio + PDF từ vựng là rất hợp lý.

Đặt mua tại [5phuttiengduc.giabaobooks.vn](https://5phuttiengduc.giabaobooks.vn) — Luyện tập miễn phí tại [LangLearn](https://tuhoctiengduc.giabaobooks.vn)`,
    },
  })
  console.log('Updated: review-sach-5-phut-tieng-duc')

  // Update bài 3
  await prisma.blogPost.updateMany({
    where: { slug: 'lo-trinh-hoc-tieng-duc-tu-a1-den-b2' },
    data: {
      content: `# Lộ Trình Học Tiếng Đức Từ Đầu: Từ A1 Đến B2 Trong 12 Tháng

Tiếng Đức có tiếng là khó — nhưng với lộ trình đúng, người Việt hoàn toàn có thể đạt B2 trong 12 tháng học nghiêm túc.

## Tại Sao Cần Lộ Trình Rõ Ràng?

Nhiều người học lan man: hôm nay app này, tuần sau sách khác, tháng sau lại đổi. Kết quả: 1 năm vẫn ở A1.

Lộ trình giúp bạn biết **mình đang ở đâu** và **bước tiếp theo là gì**.

## Lộ Trình Chi Tiết

### Giai đoạn 1: A1 (Tháng 1-2)

**Mục tiêu:** Chào hỏi, giới thiệu bản thân, số đếm, màu sắc, mua sắm cơ bản.

**Học gì:**
- Bộ sách [5 Phút Tiếng Đức](https://5phuttiengduc.giabaobooks.vn) — Bài 1 đến 50
- Mỗi ngày 1 mẩu chuyện + nghe audio tương ứng
- Luyện flashcard từ vựng trên [LangLearn](https://tuhoctiengduc.giabaobooks.vn)
- 10-15 phút/ngày

**Cột mốc:** Tự giới thiệu được bằng tiếng Đức trong 2 phút.

### Giai đoạn 2: A2 (Tháng 3-4)

**Mục tiêu:** Mô tả thói quen, hỏi đường, viết tin nhắn ngắn.

**Học gì:**
- 5 Phút Tiếng Đức — Bài 51 đến 100
- Bắt đầu nghe podcast tiếng Đức chậm (DW Langsam gesprochene Nachrichten)
- Tăng lên 20-25 phút/ngày

### Giai đoạn 3: B1 (Tháng 5-7)

**Mục tiêu:** Giao tiếp tự nhiên, hiểu podcast tốc độ bình thường.

**Học gì:**
- 5 Phút Tiếng Đức — Bài 101 đến 200 (hoàn thành bộ sách — đủ 500+ từ vựng cốt lõi)
- Đọc báo đơn giản bằng tiếng Đức
- Viết nhật ký 3-5 câu mỗi ngày

### Giai đoạn 4: B2 (Tháng 8-12)

**Mục tiêu:** Làm việc, học tập được bằng tiếng Đức.

**Học gì:**
- Đọc sách, xem phim tiếng Đức không phụ đề
- Tham gia hội thoại với người bản xứ (Tandem, iTalki)
- Ôn luyện ngữ pháp nâng cao

## Tại Sao Sách 5 Phút Tiếng Đức Phù Hợp Cho Giai Đoạn 1-3?

Sách được thiết kế đặc biệt cho **người bận rộn**:
- 200 bài học — mỗi bài chỉ mất đúng 5 phút
- Học thụ động qua mẩu chuyện — không stress
- 200 file audio kèm theo — nghe trên xe buýt, lúc nấu ăn
- 500+ từ vựng được chắt lọc cho người mới — không học từ lạ trước

## Bắt Đầu Ngay

Lộ trình chỉ hiệu quả khi bắt đầu ngay hôm nay.

1. Mua sách [5 Phút Tiếng Đức](https://5phuttiengduc.giabaobooks.vn) — nhận sách rồi mới thanh toán, không rủi ro
2. Tạo tài khoản [LangLearn miễn phí](https://tuhoctiengduc.giabaobooks.vn/register) — luyện tập hàng ngày
3. Xem [lộ trình chi tiết trên LangLearn](https://tuhoctiengduc.giabaobooks.vn/roadmap)`,
    },
  })
  console.log('Updated: lo-trinh-hoc-tieng-duc-tu-a1-den-b2')

  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
