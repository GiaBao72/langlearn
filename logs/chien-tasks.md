# 📋 Chiến Task Log
> Log tất cả tasks dự án: fix bug, deploy, update config, etc.
> Format: `## [YYYY-MM-DD HH:mm] Tên task`

---

## [2026-03-25 02:45] LangLearn - Setup VPS & Infrastructure

**Những gì đã làm:**
- Clone repo `GiaBao72/langlearn` từ GitHub lên VPS
- Tạo PostgreSQL DB `langlearn` + user `langlearn_user`
- Setup `.env` với JWT secrets + `ecosystem.config.js` (hardcode secrets vì pm2 không load .env)
- `npm install` + `npx prisma migrate dev`
- PM2 start (fork mode, port 3000), nginx config `:1234 → :3000`

**Kết quả:** ✅ App live tại `http://118.70.49.57:12431`

---

## [2026-03-25 04:45] LangLearn - Backend APIs

**Những gì đã làm:**
- `/api/auth`: login, register, logout, refresh token
- `/api/lessons/[id]/exercises`: GET với user progress
- `/api/exercises/[id]/submit`: scoring engine cho 5 loại bài tập
  - MULTIPLE_CHOICE / FILL_BLANK / FLASHCARD / SORT_WORDS: full/no points
  - DICTATION: partial score theo % từ đúng
  - Keep best score policy (`UserProgress` với `@@unique([userId, exerciseId])`)
- `/api/blog`: CRUD public + admin
- `/api/admin/courses`, `/admin/lessons`, `/admin/exercises`: full CRUD

**Kết quả:** ✅ Tất cả endpoints hoạt động

---

## [2026-03-25 04:52] LangLearn - Seed Data

**Những gì đã làm:**
- `npx prisma db seed`
- 1 course: Tiếng Đức A1
- 1 lesson: "Bài 1 - Tự giới thiệu bản thân"
- 5 exercises: FLASHCARD, FILL_BLANK, MULTIPLE_CHOICE, DICTATION, SORT_WORDS

**Kết quả:** ✅ Data sẵn sàng để test

---

## [2026-03-25 06:35] LangLearn - GitHub Actions CI/CD Pipeline

**Những gì đã làm:**
- Tạo SSH deploy key: `~/.ssh/github_deploy`
- Setup GitHub Secrets: `VPS_HOST`, `VPS_PORT`, `VPS_USER`, `VPS_SSH_KEY`
- Viết workflow: push main → SSH VPS → `git reset --hard origin/main` → `npm run build` → `pm2 restart`
- Debug qua Run #1–#8, fix `continue-on-error` masking failures

**Kết quả:** ✅ Run #8 SUCCESS — Auto-deploy pipeline hoàn chỉnh

---

## [2026-03-25 07:49] LangLearn - Fix /practice Redirect Loop Bug

**Những gì đã làm:**
- **Root cause:** Server component (`PracticePage`) tự gọi `redirect('/login')` → bypass middleware → loop vô tận
- **Fix:** Bỏ auth guard trong `PracticePage`, cho phép `user = null` (guest), middleware lo phần auth
- Commit: `dfb2d7b`

**Kết quả:** ✅ `/practice/[lessonId]` public accessible, không còn redirect loop

---

## [2026-03-25 11:06] LangLearn - Fix Auth/Navbar Không Re-render Sau Login

**Những gì đã làm:**
- **Root cause:** `router.push()` sau login = client-side navigation → Navbar (server component đọc cookie) không re-render → hiển thị "Đăng nhập" mặc dù đã login
- **Fix:** Dùng `window.location.href` (full page reload) thay `router.push()`
- Split Navbar: server component (đọc JWT cookie) + `NavbarClient` (logout button, `'use client'`)

**Kết quả:** ✅ Login/logout cập nhật Navbar đúng

---

## [2026-03-25 11:13] LangLearn - Fix Build Error Turbopack (jose migration)

**Những gì đã làm:**
- **Root cause:** `jsonwebtoken` không tương thích Edge Runtime → build crash
- **Fix 1:** Migrate sang `jose` (Web Crypto API, compatible mọi runtime)
- **Fix 2:** `store/page.tsx` bỏ `'use client'`, tách `FaqAccordion` thành client component riêng
- **Fix 3:** `DashboardClient` + `CoursesClient`: bỏ Navbar import, move lên server page wrapper

**Kết quả:** ✅ Build thành công, 70 commits total

---

## [2026-03-25 11:40] LangLearn - VPS Hardening & DB Backup

**Những gì đã làm:**
- PM2: fork mode, port 3000, `max_memory_restart 512M`
- Nginx: đã có, `:1234 → :3000`
- Setup cron backup DB: 2AM hàng ngày, giữ 7 ngày, lưu `/home/tmc/backups/langlearn/`

**Kết quả:** ✅ Production hardened, backup tự động

---

## [2026-03-27 02:30] Verify Chó ↔ Chiến Gateway Communication

**Những gì đã làm:**
- Verify Chó → Chiến: endpoint `http://118.70.49.57:18789/v1/chat/completions` (enable external access)
- Test thực tế: Chó tạo `/tmp/cho-test.txt` trên VPS thành công
- Document trong MEMORY.md: endpoint, token, điều kiện (Tailscale phải chạy)

**Kết quả:** ✅ Hai chiều hoạt động. Chiến → Chó qua `100.73.204.7:18789`, Chó → Chiến qua `118.70.49.57:18789`

---

## [2026-03-27 02:57] Setup Task Log System

**Những gì đã làm:**
- Tạo file `/home/tmc/.openclaw/workspace/logs/chien-tasks.md`
- Ghi lại toàn bộ tasks LangLearn từ 25/03 và gateway verification 27/03
- Update AGENTS.md rule: ghi log sau mỗi task dự án

**Kết quả:** ✅ Task log system active từ bây giờ

---

## [2026-03-28 04:55] LangLearn — Nâng cấp 5 user features
- TASK 1 ✅ CoursesClient.tsx: Thêm filter level pills (emerald theme) + state selectedLevel + update filtered()
- TASK 2 ✅ practice/page.tsx: Thêm query scorePerLesson, hiển thị điểm (xđ) bên cạnh % trong lesson card
- TASK 3 ✅ api/dashboard/route.ts: Tái dùng allLessons query (thêm course.id), tính inProgressLessons slice(5); DashboardClient.tsx: Thêm interface fields + render section "📖 Bài đang học dở"
- TASK 4 ✅ profile/page.tsx: Fetch recentProgress (10 items), serialize, pass to ProfileClient; ProfileClient.tsx: Thêm prop type + render bảng "📚 Lịch sử học gần đây"
- TASK 5 ✅ NavbarClient.tsx: Thêm useDarkMode hook (localStorage + prefers-color-scheme), toggle button desktop + mobile; Tailwind v4 không cần config (dùng @custom-variant dark trong globals.css)
- Build: ✅ clean, HTTP 200, pushed to main (3d0580c)
