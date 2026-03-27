# DEVLOG — LangLearn Project
> Website học ngoại ngữ toàn diện
> Khởi động: 2026-03-25 02:06 GMT+7

---

## TEAM

| Thành viên | Vai trò | Platform |
|---|---|---|
| Chó 🐶 | Tech Lead, code Frontend + Auth | OpenClaw local (DESKTOP-81IHT44) |
| Chiến ⚔️ | Backend, VPS, Deploy | OpenClaw VPS (118.70.49.57) |
| Gemini ✨ | UX/UI Advisor | gemini.google.com |

---

## PHASE 1 — PLANNING (02:06–02:33)

### Cuộc họp 3 đầu
- Gemini: đề xuất design language "Linear meets Editorial" — dark mode #111111 + accent Cyber Gold #FFB000
- Chiến: đề xuất thêm `RefreshToken` table, JWT httpOnly cookie thay vì localStorage
- Nhà Vua xác nhận: single-tenant, ~500 users ban đầu, blog tự viết + import Word

### Stack chốt
- **Framework:** Next.js 14 App Router + TypeScript
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** JWT httpOnly cookie + Refresh Token Rotation
- **UI:** Tailwind CSS + shadcn/ui
- **Deploy:** GitHub Actions → SSH → VPS → PM2 + Nginx

### DB Schema (7 models)
```
User, RefreshToken, Course, Lesson, Exercise (JSON data), UserProgress, BlogPost
```

---

## PHASE 2 — DEVELOPMENT (02:33–16:30)

### Files đã tạo

#### Core
- `prisma/schema.prisma` — 7 models đầy đủ
- `prisma/seed.ts` — seed data 15 bài tập + 3 blog posts
- `prisma.config.ts` — Prisma 7 config (không dùng url trong schema)

#### Auth System
- `src/lib/prisma.ts` — PrismaClient singleton
- `src/lib/auth.ts` — JWT sign/verify/getCurrentUser
- `src/middleware.ts` — Route protection + Admin guard
- `src/app/api/auth/login/route.ts`
- `src/app/api/auth/register/route.ts`
- `src/app/api/auth/refresh/route.ts` — Refresh token rotation + Logout

#### Pages
- `src/app/layout.tsx` — Dark mode root layout
- `src/app/page.tsx` — Landing page + Interactive Demo (fill-blank → confetti → CTA)
- `src/app/login/page.tsx`
- `src/app/register/page.tsx`
- `src/app/dashboard/page.tsx` + `DashboardClient.tsx` — Heatmap + Streak + Courses
- `src/app/admin/` — Admin panel (sidebar navy + stats + users table)
- `src/app/practice/` — 5 dạng bài tập
- `src/app/blog/` — Blog listing + post detail
- `src/app/courses/` — Courses listing

### Commits
| Hash | Message |
|---|---|
| feat: initial | Next.js 14 + Prisma + Auth system |
| feat: pages | Login, Register, Dashboard heatmap + streak |
| feat: admin | Admin panel shadcn-admin style |
| feat: practice | 5 exercise types Zen Mode |
| feat: seed | 15 exercises + 2 lessons + 3 blog posts |

---

## PHASE 3 — DEPLOY (VPS)

### Thông tin VPS
- **IP:** 118.70.49.57
- **User:** tmc
- **SSH Port:** 38393
- **App Port:** 12431
- **App URL:** http://118.70.49.57:12431
- **PM2 App Name:** langlearn
- **Deploy path:** ~/langlearn

### GitHub Actions
- File: `.github/workflows/deploy.yml`
- Trigger: push to `main`
- Flow: checkout → build → SSH → pull → npm install → prisma migrate → pm2 restart

### Nginx
- Reverse proxy port 12431
- Config tại `/etc/nginx/sites-enabled/langlearn`

### Admin Account
- Email: `admin@langlearn.vn`
- Password: `Admin@2026`

---

## BÀI HỌC KỸ THUẬT

### Prisma 7
- KHÔNG dùng `url = env("DATABASE_URL")` trong `schema.prisma`
- Dùng `prisma.config.ts` riêng biệt
- Connection pool: 10 connections (đủ cho 500 users)

### Telegram Web Automation
- Ô input là `contenteditable div`, KHÔNG phải `<input>`
- Selector: `div.input-message-input`
- Isolated browser KHÔNG giữ session sau restart → phải login lại mỗi lần
- **Cách đúng duy nhất:** Click vào ô → type bằng selector → Enter để gửi
- **Không dùng:** clipboard paste, Bot API (1 chiều), execCommand

### Vấn đề đã giải quyết
- ✅ Seed data đã chạy trên VPS (`npx prisma db seed`)
- ✅ Giao tiếp Chó ↔ Chiến qua OpenClaw Gateway (Tailscale) thay thế Telegram Web

---

## TODO

### Ưu tiên cao 🔴
- [ ] Chạy seed data trên VPS (`npx tsx prisma/seed.ts`)
- [ ] Setup SSL/HTTPS (Let's Encrypt)
- [ ] Rate limiting cho login endpoint

### Ưu tiên trung bình 🟡
- [ ] PM2 cluster mode (4 cores)
- [ ] PostgreSQL backup tự động
- [ ] Email verification khi đăng ký
- [ ] Word import API (mammoth.js)
- [ ] Trang giáo trình chi tiết
- [ ] Landing page bán sách

### Tính năng đã thiết kế, chưa hoàn chỉnh 🟠
- [ ] Gamification: streak freeze, điểm thưởng
- [ ] Blog search
- [ ] Practice Zen Mode hoàn chỉnh (cần data)

---

## [2026-03-27 02:30] Verify Chó ↔ Chiến Gateway Communication

**Những gì đã làm:**
- Enable external access cho Chiến gateway (`http://118.70.49.57:18789`)
- Verify Chó → Chiến: Chó tạo `/tmp/cho-test.txt` trên VPS thành công qua gateway endpoint
- Confirm hai chiều đều hoạt động qua Tailscale

**Chi tiết:**
| Hướng | Endpoint | Token |
|---|---|---|
| Chiến → Chó | `http://100.73.204.7:18789/v1/chat/completions` | `7c9489405f3bdfc243dfeaa9b0b34686577c95a6491a9007` |
| Chó → Chiến | `http://118.70.49.57:18789/v1/chat/completions` | `17da1049c150103cfc2e97f45b97ff43a37bcb49835daf6b` |

**Kết quả:** ✅ Team communication channel verified — Chó và Chiến có thể giao task cho nhau trực tiếp qua Gateway

---

## [2026-03-27 02:57] Setup Task Log System & DEVLOG Convention

**Những gì đã làm:**
- Tạo `/home/tmc/.openclaw/workspace/logs/chien-tasks.md` — log tổng hợp toàn bộ tasks của Chiến
- Update `AGENTS.md`: rule ghi log sau mỗi task dự án vào `chien-tasks.md`
- Retroactively ghi lại toàn bộ LangLearn tasks từ 25/03
- **Hôm nay (27/03):** Gia Bảo ra lệnh tách riêng — LangLearn tasks → `DEVLOG.md`, không ghi vào `chien-tasks.md`

**Convention từ giờ:**
- LangLearn tasks → `/home/tmc/projects/langlearn/logs/DEVLOG.md`
- Tasks dự án khác → `/home/tmc/.openclaw/workspace/logs/chien-tasks.md`

**Kết quả:** ✅ Logging system rõ ràng, tách biệt theo dự án

---

## 2026-03-27 — Chiến 🕺

### Fixes đã deploy (commit b938c6e)

| Fix | Vấn đề | File |
|-----|--------|------|
| Logout bug | NavbarClient gọi DELETE /api/auth/refresh → không xóa cookie | NavbarClient.tsx + logout/route.ts (mới) |
| Rate limiting | Login không có giới hạn số lần sai | auth/login/route.ts |
| /api/auth/me | Không có endpoint check auth state | auth/me/route.ts (mới) |
| Homepage navbar | page.tsx là 'use client' hardcode → không đọc auth sau login | page.tsx refactor + HomePageClient.tsx (mới) |

### Status
- Live: http://118.70.49.57:12431 ✅
- TODO còn lại: SSL/HTTPS, seed data trên VPS

---

## 2026-03-27 (session 2) — Chiến 🕺

### Bugs đã fix (commit a140c55)

| Bug | Fix |
|-----|-----|
| BUG-01: register dùng `router.push` → Navbar không re-render | Đổi sang `window.location.href = '/dashboard'`, bỏ `useRouter` |
| BUG-02: practice/page.tsx navbar hardcode | Dùng `<Navbar />` chung, thêm link "← Dashboard" vào heading |
| BUG-03: Dashboard không có loading state | Thêm `DashboardSkeleton` component với animation pulse, fix toàn bộ encoding tiếng Việt bị mất dấu |
| BUG-04: /api/admin/* không check ADMIN | Review code → đã có check sẵn, không cần fix |

### Deploy ✅
- Build: success
- pm2 restart: online
- Live: http://118.70.49.57:12431

---

## 2026-03-27 (tiếp theo) — Chiến 🕺

### Tính năng mới (commit 3b6c1a8 → 8f2e272)

| Tính năng | URL |
|-----------|-----|
| Blog tìm kiếm + phân trang | `/blog?q=...&page=2` |
| Trang Profile user | `/profile` |
| Admin blog edit | `/admin/blog/[id]` |
| Quên mật khẩu (token 15 phút) | `/forgot-password` |
| 404 custom | tự động |
| SEO meta động | blog, courses, course detail |

### Bug fixes
- Homepage navbar hiển thị đúng auth sau đăng nhập (page.tsx → server component)
- Logout route mới `POST /api/auth/logout`
- Rate limiting login: max 5 lần / 15 phút / IP
- Cookie `secure` đồng bộ env check ở login/register/refresh
- Progress API: giữ điểm cao nhất, không ghi đè khi làm lại kém hơn
- FillBlank: Enter để submit
- Hiển thị đáp án đúng khi sai (ExerciseRunner feedback)
- Chấp nhận ä/ö/ü/ß lẫn ae/oe/ue/ss khi điền đáp án
- Nút "Về khóa học" redirect đúng về `/courses/[courseId]`
- Dictation: fallback khi browser không hỗ trợ Speech API
- SortWords: shuffle cố định theo nội dung, không xáo lại mỗi render
- Email validate format server-side ở register
- Auto refresh token mỗi 12 phút (useAutoRefresh hook)
- Đồng bộ yêu cầu mật khẩu tối thiểu 6 ký tự toàn bộ
- Xóa ZenPractice (dead code), dùng ExerciseRunner

### Status
- Live: http://118.70.49.57:12431 ✅
- Latest commit: 8f2e272
- TODO còn lại: SSL/HTTPS (chờ domain)

---

## 2026-03-27 (batch 3) — Chiến 🕺

### Tính năng mới (commit 304379f)

| Tính năng | Chi tiết |
|-----------|---------|
| 🏆 Leaderboard | `/leaderboard` — tab Tuần này / Tất cả, top 20, avatar, medal |
| 🔥 Streak Banner | Dashboard hiện banner nhắc nhở nếu hôm nay chưa học |
| ❌ Xem bài sai | Sau làm xong lesson, hiện danh sách câu sai + đáp án đúng |
| 📊 Lesson History API | `GET /api/lesson-history/[lessonId]` — điểm, % hoàn thành, chi tiết từng bài |
| Track session results | ExerciseRunner lưu kết quả từng câu trong session |

### Notes
- Leaderboard: public (không cần login), ẩn email (chỉ hiện tên hoặc prefix email)
- Streak Banner: chỉ hiện khi `studiedToday = false`, tự biến mất sau khi học
- Courses search: đã có sẵn từ trước ✅

### Status
- Live: http://118.70.49.57:12431 ✅
- Latest commit: 304379f
- TODO: SSL/HTTPS (chờ domain)

---

## PROJECT SNAPSHOT — Cuối ngày 27/03/2026

### Live URLs
- App: http://tuhoctiengduc.giabaobooks.vn:12431
- Admin: /admin (admin@langlearn.vn / Admin@2026)

### DB State
- Courses: 1 (Tiếng Đức A1)
- Lessons: 10 (order 1-10)
- Exercises: 200 (20/bài × 10 bài, 5 loại)
- Blog: 10 bài published
- Users: 1 admin

### Tính năng LIVE
| Module | URL |
|--------|-----|
| Landing + Demo | / |
| Courses | /courses, /courses/[id] |
| Practice | /practice/[lessonId] |
| Dashboard | /dashboard |
| Leaderboard | /leaderboard |
| Blog | /blog, /blog/[slug] |
| Store | /store |
| Roadmap | /roadmap |
| Profile | /profile |
| Forgot password | /forgot-password |
| Admin CRUD | /admin/** |
| Import Excel | /admin/lessons/[id] |

### TODO còn lại
1. Port :12431 trong URL → Cloudflare Tunnel hoặc NAT port 80
2. SSL/HTTPS
3. A2/B1/B2 courses chưa có
4. Email verification
5. DB backup tự động

### Deploy manual
```bash
cd /home/tmc/projects/langlearn
git fetch && git reset --hard origin/main
rm -rf .next && npm run build
pm2 restart langlearn
```

### Thêm bài tập
- Excel import: Admin → Lesson → Tải file mẫu → điền → Upload
- Seed script: `npx ts-node --compiler-options '{"module":"commonjs"}' prisma/seed-a1-full.ts`
- Admin UI: /admin/lessons/[id] → form thêm từng câu
