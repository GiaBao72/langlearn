# LangLearn - Dev Log Chung (Chiến 🕺 & Chó 🐶)

> File này là kênh đồng bộ giữa Chiến và Chó.
> Chiến ghi sau mỗi lần làm việc trên VPS.
> Chó đọc file này trước khi tiếp tục task LangLearn.
> Path: /home/tmc/projects/langlearn/DEV_LOG.md

---

## 2026-03-27 02:35 — Chiến 🕺

### Đã fix
1. **Navbar logout bug** — `NavbarClient.tsx`: đổi logout endpoint từ `DELETE /api/auth/refresh` → `POST /api/auth/logout` (route mới, xóa cookie đúng cách)
2. **Rate limiting** — `login/route.ts`: in-memory, max 5 lần sai / 15 phút / IP → lần 6 trả 429 + Retry-After
3. **`/api/auth/me`** — Tạo mới route `GET /api/auth/me` → trả `{userId, email, role}` nếu có cookie hợp lệ, 401 nếu không

### Đã test (qua Chó gateway)
- TC12a ✅ `/api/auth/me` chưa login → 401
- TC12b ✅ `/api/auth/me` sau login → 200 + user info
- TC30 ✅ Rate limit kick đúng lần thứ 6 → 429

### Cần test thủ công (browser)
- **Navbar bug**: Login → về trang chủ `/` → navbar có hiện Dashboard + Đăng xuất không?
- Chó hoặc Nhà Vua test bằng browser thật

### Files đã sửa
- `src/components/NavbarClient.tsx`
- `src/app/api/auth/login/route.ts`
- `src/app/api/auth/logout/route.ts` ← mới
- `src/app/api/auth/me/route.ts` ← mới

### Deploy
- Build: ✅ success
- pm2 restart: ✅ online
- Live: http://118.70.49.57:12431

---

## Known Gaps còn lại
| Gap | Mô tả | Status |
|-----|-------|--------|
| TC30 | Rate limiting | ✅ ĐÃ FIX |
| TC12 | /api/auth/me | ✅ ĐÃ FIX |
| TC33 | Đã login vào /login → redirect | ✅ Đã có sẵn |
| TC34 | Redirect-back ?from= | ✅ Đã có sẵn |
| Navbar logout visual | Cần verify browser | ⚠️ Pending |
