
---

## Task 4: Tích hợp ImageUploader vào form tạo câu hỏi (ExamEditClient)

**Objective:** Thêm field `imageUrl` vào form "Thêm câu hỏi" trong `ExamEditClient`.

**Files:**
- Modify: `src/app/admin/exams/[id]/ExamEditClient.tsx`

**Thay đổi:**

**4a. Import component:**
```typescript
import { ImageUploader } from '@/components/admin/ImageUploader'
```

**4b. Thêm state:**
```typescript
const [qImageUrl, setQImageUrl] = useState('')
```

**4c. Reset khi submit thành công** — trong hàm xử lý submit câu hỏi, thêm:
```typescript
setQImageUrl('')
```

**4d. Cập nhật `buildQData()`** — thêm `imageUrl` vào tất cả các case nếu có giá trị:
```typescript
function buildQData() {
  const base = qImageUrl ? { imageUrl: qImageUrl } : {}
  switch (qType) {
    case 'MULTIPLE_CHOICE':
      return { ...base, options: qOptions, answer: qAnswer, explanation: qExplanation }
    case 'FILL_BLANK':
      return { ...base, sentence: qQuestion, answer: qAnswer, hint: qHint }
    // ... tương tự các case khác
  }
}
```

**4e. Thêm `<ImageUploader>` vào form** — đặt sau field `question`, trước phần options:
```tsx
<ImageUploader
  value={qImageUrl}
  onChange={setQImageUrl}
  label="Hình ảnh câu hỏi (tùy chọn)"
/>
```

**Verify:** Vào `/admin/exams/{id}`, thêm câu hỏi mới, chọn ảnh → upload thành công → submit → câu hỏi lưu có `imageUrl` trong data JSON.

**Commit:**
```bash
git add src/app/admin/exams/[id]/ExamEditClient.tsx
git commit -m "feat: add imageUrl field to exam question creation form"
```

---

## Task 5: Hiển thị và chỉnh sửa ảnh trong accordion câu hỏi đã có

**Objective:** Trong list câu hỏi đã tạo, cho phép xem và thay đổi ảnh trực tiếp (không cần tạo lại câu hỏi).

**Files:**
- Modify: `src/app/admin/exams/[id]/ExamEditClient.tsx`

**Thay đổi — trong phần render accordion từng câu hỏi:**

Sau khi show question text, thêm block chỉnh ảnh:
```tsx
{/* Image edit inline */}
<div className="mt-3">
  <ImageUploader
    value={(q.data as any)?.imageUrl ?? ''}
    onChange={async (url) => {
      // PATCH câu hỏi với imageUrl mới trong data
      await fetch(`/api/admin/exam-questions/${q.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: { ...(q.data as any), imageUrl: url } })
      })
      reload()
    }}
    label="Ảnh câu hỏi"
  />
</div>
```

**Lưu ý:** Route `PATCH /api/admin/exam-questions/[id]` đã tồn tại — kiểm tra trước để đảm bảo nó accept field `data`.

**Verify:** Mở accordion câu hỏi đã tạo → upload ảnh → reload tự động → ảnh hiện trong preview.

**Commit:**
```bash
git add src/app/admin/exams/[id]/ExamEditClient.tsx
git commit -m "feat: allow editing imageUrl on existing exam questions"
```

---

## Task 6: Hiển thị ảnh trong ExamRunner (user làm bài)

**Objective:** Nếu câu hỏi có `imageUrl`, hiển thị ảnh phía trên đề câu hỏi trong khi làm bài.

**Files:**
- Modify: `src/components/ExamRunner.tsx`

**Thay đổi — trong phần render từng câu hỏi:**

Tìm block render question (phần hiển thị `q.question`), thêm ảnh phía trên:

```tsx
{/* Question image */}
{(q.data as any)?.imageUrl && (
  <div className="mb-3 flex justify-center">
    <img
      src={(q.data as any).imageUrl}
      alt="Hình ảnh câu hỏi"
      className="max-h-64 max-w-full rounded-lg border border-gray-600 object-contain"
    />
  </div>
)}

{/* Question text — đã có sẵn */}
<p className="...">{q.question}</p>
```

**Lưu ý về strip answers:**
`start/page.tsx` strip `answer`, `answers`, `audio_text`, `correctIndex` — **không strip `imageUrl`** nên không cần sửa thêm.

**Verify:** Vào trang thi, câu hỏi có ảnh sẽ hiện ảnh phía trên đề bài. Câu không có ảnh không bị ảnh hưởng.

**Commit:**
```bash
git add src/components/ExamRunner.tsx
git commit -m "feat: display question image in ExamRunner"
```

---

## Task 7: Hiển thị ảnh trong màn hình kết quả

**Objective:** Sau khi submit, phần review chi tiết từng câu cũng hiển thị ảnh (nếu có) để dễ đối chiếu.

**Files:**
- Modify: `src/components/ExamRunner.tsx`

**Thay đổi — trong phần render kết quả chi tiết (sau flip card):**

Tìm block render review từng câu, thêm ảnh:
```tsx
{/* Image in result review */}
{(ans.data as any)?.imageUrl && (
  <img
    src={(ans.data as any).imageUrl}
    alt="Hình ảnh câu hỏi"
    className="mt-2 max-h-48 max-w-full rounded border border-gray-700 object-contain"
  />
)}
```

**Lưu ý:** `ans.data` trong màn hình kết quả đến từ `GradedAnswer` — kiểm tra xem grading API có trả về `data` không. Nếu `data` bị strip trong response, cần giữ lại `imageUrl` khi format response trong `submit/route.ts`.

**Verify trong `submit/route.ts`:** Đảm bảo `gradedAnswers` trả về bao gồm `data` (hoặc ít nhất `imageUrl`).

**Commit:**
```bash
git add src/components/ExamRunner.tsx
git commit -m "feat: show question image in exam result review"
```

---

## Task 8: Fix bug audioText vs audio_text (bonus — phát hiện khi phân tích)

**Objective:** Sửa key sai trong `buildQData()` cho DICTATION, đã biết là bug từ trước.

**Files:**
- Modify: `src/app/admin/exams/[id]/ExamEditClient.tsx`

**Tìm trong `buildQData()`:**
```typescript
// SAI — hiện tại
case 'DICTATION':
  return { audioText: qQuestion, answer: qAnswer, hint: qHint }

// ĐÚNG — cần sửa
case 'DICTATION':
  return { audio_text: qQuestion, answer: qAnswer, hint: qHint }
```

**Verify:** Tạo câu hỏi DICTATION mới → vào trang thi → nút phát âm hoạt động.

**Commit:**
```bash
git add src/app/admin/exams/[id]/ExamEditClient.tsx
git commit -m "fix: use audio_text key (snake_case) in DICTATION buildQData"
```

---

## Tổng kết

| Task | File | Loại |
|------|------|------|
| 1 | `.env.production`, `.env.example` | Config |
| 2 | `api/admin/exam-questions/upload-image/route.ts` | API mới |
| 3 | `components/admin/ImageUploader.tsx` | Component mới |
| 4 | `admin/exams/[id]/ExamEditClient.tsx` | UI — form tạo |
| 5 | `admin/exams/[id]/ExamEditClient.tsx` | UI — edit inline |
| 6 | `components/ExamRunner.tsx` | UI — làm bài |
| 7 | `components/ExamRunner.tsx` | UI — kết quả |
| 8 | `admin/exams/[id]/ExamEditClient.tsx` | Bug fix |

**Không cần:** migration DB, thay đổi schema, thay đổi grading logic.

**Cần có trước khi bắt đầu:** ImgBB API key (lấy tại https://api.imgbb.com/).
