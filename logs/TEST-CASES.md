# TEST CASES — LangLearn
> Soạn bởi: Chiến 🕺 + Chó 🐶 | 2026-03-27
> Chuẩn: IEEE 829 / ISTQB
> Status key: ⬜ Chưa test | ✅ Pass | ❌ Fail | ⚠️ Bug

---

## MODULE 1: AUTH

### TC-A01 — Đăng ký thành công
- **Input:** name="Test User", email="test@test.com", password="12345678"
- **Expected:** 201, cookie `access_token` set, redirect `/dashboard`
- **Status:** ⬜

### TC-A02 — Đăng ký email đã tồn tại
- **Input:** email đã có trong DB
- **Expected:** 409, message "Email đã được sử dụng"
- **Status:** ⬜

### TC-A03 — Đăng ký password < 8 ký tự
- **Input:** password="123"
- **Expected:** UI block (minLength=8), không gửi request
- **Status:** ⬜

### TC-A04 — Đăng ký thiếu email
- **Input:** email bỏ trống
- **Expected:** HTML5 validation block, không submit
- **Status:** ⬜

### TC-A05 — Đăng ký xong → redirect dashboard
- **Expected:** `router.push('/dashboard')` chạy đúng
- **⚠️ Lưu ý:** Dùng `router.push` (không phải `window.location`) → Navbar server component có thể không re-render đúng
- **Status:** ⬜

### TC-A06 — Đăng nhập thành công
- **Input:** admin@langlearn.vn / Admin@2026
- **Expected:** 200, cookie set, redirect `/dashboard`, Navbar hiển thị tên user
- **Status:** ⬜

### TC-A07 — Đăng nhập sai password
- **Input:** password sai
- **Expected:** 401, hiển thị error message
- **Status:** ⬜

### TC-A08 — Đăng nhập sai 6 lần (rate limit)
- **Input:** 6 lần sai liên tiếp cùng IP
- **Expected:** Lần 6 → 429 + header `Retry-After`
- **Status:** ⬜

### TC-A09 — Đăng nhập khi đã đăng nhập → redirect dashboard
- **Input:** Đang đăng nhập, vào `/login`
- **Expected:** Middleware redirect → `/dashboard`
- **Status:** ⬜

### TC-A10 — Đăng xuất
- **Action:** Click "Đăng xuất" ở Navbar
- **Expected:** Cookie xóa, redirect `/`, Navbar hiển thị "Đăng nhập / Đăng ký"
- **Status:** ⬜

### TC-A11 — Redirect-back sau login (?from=)
- **Input:** Chưa login, vào `/dashboard` → bị redirect `/login?from=%2Fdashboard`
- **Expected:** Sau login thành công → redirect về `/dashboard`
- **Status:** ⬜

### TC-A12 — /api/auth/me khi chưa login
- **Expected:** 401
- **Status:** ⬜

### TC-A13 — /api/auth/me khi đã login
- **Expected:** 200 + `{userId, email, role}`
- **Status:** ⬜

---

## MODULE 2: NAVIGATION / NAVBAR

### TC-N01 — Trang chủ khi chưa login
- **Expected:** Navbar hiển thị "Đăng nhập" + "Đăng ký"
- **Status:** ⬜

### TC-N02 — Trang chủ sau khi đăng nhập
- **Expected:** Navbar hiển thị tên user + "Dashboard" + "Đăng xuất"
- **Status:** ⬜

### TC-N03 — Logo click về trang chủ
- **Expected:** `href="/"` hoạt động đúng, không hiển thị sai trang
- **Status:** ⬜

### TC-N04 — Admin thấy link "Admin" trong Navbar
- **Input:** Login với admin@langlearn.vn
- **Expected:** Navbar có link "Admin" → `/admin`
- **Status:** ⬜

### TC-N05 — User thường không thấy link "Admin"
- **Expected:** Link Admin ẩn khi `role !== 'ADMIN'`
- **Status:** ⬜

### TC-N06 — Mobile hamburger menu (trang chủ)
- **Expected:** Menu mở/đóng đúng, các link hoạt động
- **Status:** ⬜

---

## MODULE 3: ROUTE PROTECTION

### TC-R01 — Truy cập /dashboard khi chưa login
- **Expected:** Redirect `/login?from=%2Fdashboard`
- **Status:** ⬜

### TC-R02 — Truy cập /admin khi là user thường
- **Expected:** Redirect `/dashboard`
- **Status:** ⬜

### TC-R03 — Truy cập /admin khi là ADMIN
- **Expected:** Render trang admin bình thường
- **Status:** ⬜

### TC-R04 — Truy cập /practice khi chưa login
- **Expected:** Redirect `/login`
- **Status:** ⬜

### TC-R05 — Public paths không bị chặn
- **Paths:** `/`, `/blog`, `/courses`, `/roadmap`, `/store`, `/practice/*`
- **Expected:** Tất cả render được khi chưa login
- **Status:** ⬜

---

## MODULE 4: DASHBOARD

### TC-D01 — Dashboard load đúng sau login
- **Expected:** Hiển thị heatmap, streak, danh sách course
- **Status:** ⬜

### TC-D02 — Dashboard khi chưa có progress
- **Expected:** Heatmap trống, streak = 0, không crash
- **Status:** ⬜

### TC-D03 — Link "Luyện tập" từ Dashboard
- **Expected:** Dẫn đến `/practice` đúng
- **Status:** ⬜

---

## MODULE 5: PRACTICE

### TC-P01 — Practice index hiển thị danh sách bài học
- **Expected:** Danh sách course + lesson có bài tập
- **⚠️ Lưu ý:** Nếu DB chưa seed → hiển thị "Chưa có bài học nào"
- **Status:** ⬜

### TC-P02 — Practice lesson load đúng
- **Expected:** 5 loại bài tập render đúng
- **Status:** ⬜

### TC-P03 — Submit bài tập đúng
- **Expected:** Lưu UserProgress, tính điểm đúng
- **Status:** ⬜

### TC-P04 — Submit bài tập sai
- **Expected:** Không lưu hoặc lưu score thấp hơn, không crash
- **Status:** ⬜

### TC-P05 — Tiến độ hiển thị đúng (% hoàn thành)
- **Expected:** Progress bar tính đúng done/total
- **Status:** ⬜

---

## MODULE 6: BLOG

### TC-B01 — Blog listing load
- **Expected:** Danh sách bài viết published, không crash nếu rỗng
- **Status:** ⬜

### TC-B02 — Blog post detail load theo slug
- **Expected:** Nội dung bài viết hiển thị đúng
- **Status:** ⬜

### TC-B03 — Blog post không tồn tại
- **Expected:** 404 hoặc redirect
- **Status:** ⬜

---

## MODULE 7: ADMIN

### TC-AD01 — Admin dashboard load stats
- **Expected:** Đếm đúng users, courses, blog, exercises
- **Status:** ⬜

### TC-AD02 — Admin tạo course mới
- **Expected:** POST /api/admin/courses → 201, hiển thị trong list
- **Status:** ⬜

### TC-AD03 — Admin tạo bài viết blog
- **Expected:** POST /api/admin/blog → 201
- **Status:** ⬜

### TC-AD04 — Admin tạo bài tập
- **Expected:** POST /api/admin/exercises → 201
- **Status:** ⬜

### TC-AD05 — Admin xóa course
- **Expected:** DELETE /api/admin/courses/[id] → 200, biến mất khỏi list
- **Status:** ⬜

---

## MODULE 8: EDGE CASES / SECURITY

### TC-S01 — XSS input trong form
- **Input:** `<script>alert(1)</script>` vào các field
- **Expected:** Escape đúng, không execute script
- **Status:** ⬜

### TC-S02 — SQL Injection qua email field
- **Input:** `' OR '1'='1`
- **Expected:** Prisma parameterized query block, không leak data
- **Status:** ⬜

### TC-S03 — Giả mạo cookie access_token
- **Input:** Tự tạo JWT với secret sai
- **Expected:** 401 / redirect login
- **Status:** ⬜

### TC-S04 — Gọi /api/admin/* không phải ADMIN
- **Expected:** 403
- **Status:** ⬜

### TC-S05 — Double click submit (TC-A06 variant)
- **Expected:** Loading state block, chỉ gửi 1 request
- **Status:** ⬜

---

## KNOWN BUGS (phát hiện khi review code)

| ID | Mô tả | Severity | File |
|----|-------|----------|------|
| BUG-01 | `register/page.tsx` dùng `router.push('/dashboard')` sau đăng ký → Navbar server component không re-render, user thấy "Đăng nhập" dù đã đăng ký xong | HIGH | `register/page.tsx` |
| BUG-02 | `practice/page.tsx` có navbar riêng hardcode (giống bug homepage đã fix) — không hiển thị auth state | MEDIUM | `practice/page.tsx` |
| BUG-03 | Không có loading skeleton khi Dashboard fetch data → UX xấu | LOW | `DashboardClient.tsx` |
| BUG-04 | `/api/admin/*` không verify ADMIN role ở API level (chỉ middleware check) → nếu bypass middleware thì vào được | HIGH | `src/app/api/admin/*/route.ts` |

---

## ƯU TIÊN XỬ LÝ

### 🔴 Fix ngay (HIGH)
1. BUG-01: `register/page.tsx` → đổi `router.push` thành `window.location.href`
2. BUG-04: Thêm ADMIN check trong tất cả `/api/admin/*` route handlers

### 🟡 Fix sớm (MEDIUM)
3. BUG-02: `practice/page.tsx` → dùng Navbar chung

### 🟢 Nice to have (LOW)
4. BUG-03: Thêm loading skeleton cho Dashboard
