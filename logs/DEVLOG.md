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

### Vấn đề chưa giải quyết
- Seed data chưa chạy được (PostgreSQL không có local, cần chạy trên VPS)
- Giao tiếp với Chiến qua Telegram Web không ổn định

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
