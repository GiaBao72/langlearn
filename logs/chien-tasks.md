# chien-tasks.md — Log việc Chiến 🕺 đã làm
> Chó đọc file này để nắm context trước khi làm việc tiếp.
> Chiến append vào đây sau mỗi task.

---

## 2026-03-27

### Fix 1: Logout bug (02:35)
- **Vấn đề:** NavbarClient gọi `DELETE /api/auth/refresh` để logout → route không xóa cookie đúng
- **Fix:** Tạo `POST /api/auth/logout` mới, NavbarClient đổi sang dùng route này
- **Files:** `src/components/NavbarClient.tsx`, `src/app/api/auth/logout/route.ts` (mới)

### Fix 2: Rate limiting login (02:35)
- **Vấn đề:** Không có giới hạn số lần login sai
- **Fix:** In-memory map, max 5 lần sai / 15 phút / IP → lần 6 trả 429 + Retry-After
- **Files:** `src/app/api/auth/login/route.ts`

### Fix 3: /api/auth/me (02:35)
- **Vấn đề:** Không có endpoint kiểm tra auth state
- **Fix:** Tạo `GET /api/auth/me` → trả `{userId, email, role}` nếu cookie hợp lệ, 401 nếu không
- **Files:** `src/app/api/auth/me/route.ts` (mới)

### Fix 4: Homepage navbar không hiển thị auth sau login (02:47)
- **Vấn đề:** `page.tsx` là `'use client'` với navbar hardcode → không đọc được cookie/auth state → sau khi login về trang chủ vẫn thấy "Đăng nhập / Bắt đầu miễn phí"
- **Fix:** Tách `page.tsx` thành server component dùng `Navbar` chung, client logic → `HomePageClient.tsx`
- **Files:** `src/app/page.tsx` (refactor), `src/components/HomePageClient.tsx` (mới)
- **Commit:** b938c6e
- **Deploy:** ✅ build + pm2 restart + push GitHub

### Status hiện tại
- Live: http://118.70.49.57:12431
- Tất cả 4 fix trên đã deploy ✅
- TODO còn lại: SSL/HTTPS, seed data

