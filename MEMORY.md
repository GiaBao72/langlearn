# MEMORY.md - Long-Term Memory

## Identity
- **Tên:** Chiến 🕺 (đặt bởi Gia Bảo ngày 24/03/2026, thay cho "Claw VPS")
- **Bộ đôi:** Chiến (VPS, trực 24/7) + Chó 🐶 (PC Win11 của Gia Bảo, được nghỉ ngơi)

## Network / NAT
- VPS NAT: **internet port 12431 → local port 1234**
- Nginx phải listen **1234** (local), user vào bằng **12431** (internet)
- ⚠️ Không tự ý đổi nginx port mà không hỏi cấu hình NAT trước

## Infrastructure

### Chiến VPS
- **IP:** 118.70.49.57
- **User:** tmc
- **SSH Port:** 38393

### OpenClaw
- **Version:** 2026.3.22
- **Gateway:** ws://127.0.0.1:18789
- **Gateway Token:** [OPENCLAW_TOKEN_VPS]
- **Workspace:** /home/tmc/.openclaw/workspace

### Telegram Bot
- **Username:** @VPS_Cho_bot
- **Token:** [TELEGRAM_TOKEN_VPS]

### AI Model
- **Provider:** custom-llm-chiasegpu-vn
- **Model:** claude-sonnet-4.6
- **API:** https://llm.chiasegpu.vn/v1

### Service
- Chạy qua **systemd user service**, auto-start khi reboot
- `loginctl enable-linger tmc` đã bật

---

## Skills Đã Cài
- `server-monitor` — check server status, fix OpenClaw auto-start. Trigger: "báo cáo server", "check server", "fix auto-start"
- `healthcheck`, `weather`, `skill-creator`, `node-connect` — built-in

## GitHub

- **Username:** GiaBao72
- **PAT:** [GITHUB_PAT]

### Repos
| Repo | Live | Stack | Ghi chú |
|------|------|-------|---------|
| GiaBao72/brandpage-landing | giaptech.site | Vite + React + GitHub Actions | stable tag v1.0-stable (88e62d6) |
| GiaBao72/5phut-page | 5phuttiengduc.giabaobooks.vn | Vite + React + Tailwind + Framer Motion | deploy: `npm run deploy` (gh-pages) |

Clone: `git clone https://[GITHUB_PAT]@github.com/GiaBao72/<repo>.git`

---

## Kết Nối Chó (PC Win11)
- **Tailscale IP:** 100.73.204.7
- **Gateway URL:** http://100.73.204.7:18789
- **Gateway Token:** [OPENCLAW_TOKEN_CHO]
- **Cách gọi:** `curl -X POST http://100.73.204.7:18789/v1/chat/completions` với Bearer token
- ⚠️ KHÔNG dùng `sessions_send` — dùng `exec curl` trực tiếp

## Phân Công Chó - Chiến
- **Chó 🐶** (PC Win11): làm việc hàng ngày, gần Nhà Vua, PC tasks
- **Chiến 🕺** (VPS): VPS/server tasks, 24/7, phân công và giao Chó khi cần
- **Gia Bảo ra lệnh 1 chỗ (Chiến)** → Chiến tự phân công

## LangLearn Project (2026-03-25)

### Stack
- Next.js 14 + PostgreSQL + Prisma + JWT (httpOnly cookie) + jose (Edge Runtime)
- Deploy: GitHub Actions → SSH → VPS (auto-deploy on push to main)
- URL: http://118.70.49.57:12431

### Pages Live
- `/` Landing, `/blog`, `/courses`, `/roadmap`, `/store` — public
- `/practice/[lessonId]` — public, 5 exercise types
- `/dashboard` — auth required, heatmap + streak
- `/admin` — ADMIN only, full CRUD courses/lessons/exercises/blog

### Infrastructure
- **pm2:** `ecosystem.config.js` với JWT secrets baked in
- **GitHub Actions:** auto-deploy on push main, SSH key = `~/.ssh/github_deploy`
- **DB:** PostgreSQL `langlearn` db, user `langlearn_user`
- **Seed:** `npx prisma db seed` — 1 course Tiếng Đức A1, 5 exercises
- **Admin login:** admin@langlearn.vn / Admin@2026

### Key fixes learned
1. `jsonwebtoken` không chạy Edge Runtime → dùng `jose`
2. Cookie `Secure=true` trên HTTP → browser block → dùng `NEXTAUTH_URL.startsWith("https")`
3. pm2 không load `.env` → phải hardcode trong `ecosystem.config.js`
4. Server component tự `redirect()` bypass middleware public paths
5. `router.push()` sau login = client-side nav → Navbar server component không re-render → dùng `window.location.href` để full reload. Split Navbar = server component (đọc cookie) + NavbarClient (logout button)

## Projects Live

| Repo | Domain | Deploy |
|------|--------|--------|
| `brandpage-landing` | https://giaptech.site | GitHub Actions (tự động) |
| `5phut-page` | https://5phuttiengduc.giabaobooks.vn | Webhook VPS → pull + npm deploy |

### LangLearn - Milestone
- **2026-03-25:** Auto-deploy pipeline COMPLETE (Run #8 SUCCESS)
- Push main → GitHub Actions → SSH VPS → build → pm2 restart
- Live: http://118.70.49.57

### Webhook Server
- **Path:** `/home/tmc/projects/webhook-server/`
- **Service:** `systemctl --user start/stop/restart webhook-server`
- **Endpoint:** `http://118.70.49.57:9000/webhook`
- **Log:** `/home/tmc/projects/webhook-server/webhook.log`
- **Logic:** Chỉ trigger branch `main`. Dev branch bị bỏ qua.
- **GitHub webhook:** Chưa add vào GitHub Settings — chưa cần, add khi cần thiết
- **Repo clone:** Không clone sẵn — chỉ clone khi khẩn cấp
- **GitHub PAT:** `[GITHUB_PAT]` (scope: repo + workflow, valid đến 2026-05-26)
- **Clone command:** `git clone https://[GITHUB_PAT]@github.com/GiaBao72/5phut-page.git`

## Cách Làm Việc Thành Công (Team Workflow)

### 🤝 Phân công 3 bên hiệu quả
- **Chó** code UI/frontend local → push GitHub → **Chiến** rebuild VPS
- **Gemini** generate nội dung (seed data, copy, exercises) → Chó tích hợp
- **Chiến** lo toàn bộ backend: DB, API, deploy, debug build errors

### 🚀 Deploy Pipeline chuẩn
1. Chó push main
2. GitHub Actions: `git reset --hard origin/main → npm ci → npm run build → pm2 restart`
3. Nếu Actions fail hoặc chậm → Chiến manual: `git fetch && git reset --hard origin/main && rm -rf .next && npm run build && pm2 restart`
4. **Luôn confirm commit hash live** sau mỗi rebuild

### 🔧 Debug VPS Build hiệu quả
- `npm run build 2>&1 | grep -E "error|Error" | head -10` — tìm lỗi nhanh
- `pm2 logs langlearn --lines 10 --nostream` — check crash reason
- `curl -s -o /dev/null -w "HTTP %{http_code}" http://localhost:PORT` — verify live
- Khi 307 redirect không mong muốn: check cả middleware **và** server component (redirect() trong page)

### 📦 Next.js App Router - Patterns đúng
- Navbar auth: dùng **jose** (Web Crypto) + async server component + đọc cookie server-side
- Sau login/logout: dùng `window.location.href` (full reload) thay `router.push()` (client nav)
- Tách client state ra component riêng (FaqAccordion, NavbarClient) — không để 'use client' bọc server component
- Public pages: bỏ `redirect('/login')` trong server component, dùng `user = null` cho guest

### 🗃️ Database & Prisma
- Exercise data = `Json` column — linh hoạt cho 5 loại bài tập khác nhau
- Seed với `upsert` hoặc `createMany` + `skipDuplicates` để idempotent
- Keep best score: `UserProgress` với `@@unique([userId, exerciseId])` + `update if score > current`

### ⚙️ pm2 + Environment
- pm2 **không** tự load `.env` → hardcode secrets trong `ecosystem.config.js`
- Fork mode cho Next.js (cluster mode không compatible)
- `pm2 save` sau mỗi thay đổi config để persist qua reboot

### 📋 Khi bắt đầu project mới trên VPS
1. Clone repo với PAT
2. Tạo DB + user PostgreSQL
3. Tạo `.env` + `ecosystem.config.js` (với secrets)
4. `npm ci && npx prisma migrate deploy && npx prisma db seed`
5. `pm2 start ecosystem.config.js && pm2 save`
6. Setup GitHub Secrets: VPS_HOST, VPS_PORT, VPS_USER, VPS_SSH_KEY

## Dự Án Tương Lai
- Trang báo mạng — Chiến sẽ code toàn bộ khi Gia Bảo sẵn sàng
- Stack gợi ý: WordPress hoặc Ghost, host trên VPS này

## Chó ↔ Chiến Giao Tiếp (verified 2026-03-27)

### Shared Context File
- **File:** `/home/tmc/.openclaw/workspace/giao-tiep.md`
- Chó đọc/ghi được trực tiếp qua VPS (Tailscale)
- **Khi Gia Bảo bảo "nói chuyện với Chó":** đọc file này trước → nhắn Chó → ghi kết quả vào file

### Chiến → Chó (gateway, stateless)
- **Endpoint:** `http://100.73.204.7:18789/v1/chat/completions`
- **Token:** `[OPENCLAW_TOKEN_CHO]`
- Chó có tool access thật (read/write/exec), không có memory giữa các lần gọi
- ⚠️ **2026-03-27:** Gateway Chó đổi bind=tailnet → bind=loopback (browser tool cần loopback). Không còn expose qua Tailscale IP trực tiếp. Chỉ gọi được qua Tailscale Serve hoặc khi 2 máy cùng mạng.

### Chiến → Chó (Telegram, khi cần memory)
- Gửi qua bot Chó: `https://api.telegram.org/bot[TELEGRAM_TOKEN_CHO]/sendMessage`
- chat_id: `1375328147`

### Chó → Chiến (gateway)
- **Endpoint:** `http://118.70.49.57:18789/v1/chat/completions` (đã enable, verified ✅)
- **Token:** `[OPENCLAW_TOKEN_VPS]`
- Verify: Chó tạo `/tmp/cho-test.txt` trên VPS thành công

### Điều kiện
- Tailscale phải chạy trên cả 2 máy (`tailscale status`)
- Chó Tailscale IP: `100.73.204.7`

## About User

- **Name:** Gia Bảo
- **Username:** @vgbvgb
- **Telegram ID:** 1375328147
- **PC:** Win11 (máy Chó), chạy OpenClaw local — hay bị chết sau reboot


## Luật Group Chat "AI"
- Chỉ reply khi được **@VPS_Cho_bot** tag trực tiếp
- **Không reply** khi Gia Bảo tag người khác (Chó hay ai khác)
- Đọc tất cả tin nhắn nhưng im lặng trừ khi được gọi
