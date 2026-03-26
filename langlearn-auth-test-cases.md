# Kịch Bản Test - LangLearn Auth Flow
*Tạo bởi Chiến 🕺 & Chó 🐕 — 2026-03-27*

---

## TRƯỚC KHI ĐĂNG NHẬP

| # | Mô tả | Expected |
|---|-------|----------|
| TC01 | Vào `/dashboard` khi chưa login | Redirect → `/login` |
| TC02 | Vào `/admin` khi chưa login | Redirect → `/login` |
| TC03 | Vào `/` (landing) khi chưa login | Hiển thị bình thường |
| TC04 | Vào `/blog`, `/courses`, `/roadmap`, `/store` khi chưa login | Hiển thị bình thường |
| TC05 | Vào `/practice/[lessonId]` khi chưa login | Hiển thị bình thường |
| TC06 | Login: bỏ trống email + password | Validation error ngay form |
| TC07 | Login: email đúng format nhưng không tồn tại | Báo lỗi "sai thông tin" |
| TC08 | Login: email đúng, password sai | Báo lỗi "sai thông tin" |
| TC09 | Login đúng (user thường) | Redirect → `/dashboard` |
| TC10 | Login đúng (admin) | Redirect → `/dashboard` |

---

## SAU KHI ĐĂNG NHẬP — User Thường

| # | Mô tả | Expected |
|---|-------|----------|
| TC11 | `/dashboard` hiển thị | Heatmap + streak đúng |
| TC12 | Vào `/admin` | Bị chặn (redirect `/login` hoặc 403) |
| TC13 | Navbar | Tên user đúng + nút Logout |
| TC14 | Logout | Cookie xóa, redirect `/login` |
| TC15 | Sau logout vào `/dashboard` | Redirect `/login` |

---

## SAU KHI ĐĂNG NHẬP — Admin

| # | Mô tả | Expected |
|---|-------|----------|
| TC16 | Vào `/admin` | Vào được, full CRUD hiển thị |
| TC17 | Public pages sau login admin | Vẫn truy cập bình thường |
| TC18 | Logout admin → vào `/admin` | Redirect `/login` |

---

## COOKIE & JWT LIFECYCLE

| # | Mô tả | Expected |
|---|-------|----------|
| TC19 | Xóa cookie tay (DevTools) → F5 | Redirect `/login`, không crash |
| TC20 | Sửa giá trị cookie thành chuỗi rác | Middleware reject, redirect `/login`, không lộ lỗi server |
| TC21 | JWT hết hạn trong cookie hợp lệ | Detect và redirect `/login` |
| TC22 | JWT expire đúng lúc đang ở `/dashboard` | Redirect `/login`, không loop redirect, không 500 |
| TC23 | `document.cookie` trong DevTools Console | Không thấy cookie auth (httpOnly đúng) ✅ |
| TC24 | Cookie `Secure` flag trên HTTP | Cookie không gửi lên server → coi như chưa login |

---

## MULTI-TAB & CONCURRENT

| # | Mô tả | Expected |
|---|-------|----------|
| TC25 | Login Tab A → mở Tab B vào `/dashboard` | Vào được ngay, không cần login lại |
| TC26 | Logout Tab A → Tab B F5 | Tab B redirect `/login` |
| TC27 | Login incognito + normal window cùng lúc | Session độc lập, không chồng chéo |

---

## SECURITY / INPUT ĐỘC HẠI

| # | Mô tả | Expected |
|---|-------|----------|
| TC28 | Email: `<script>alert(1)</script>` | Không execute, sanitize/escape |
| TC29 | Password: SQL injection `' OR 1=1 --` | Server không crash, báo lỗi bình thường |
| TC30 | Brute-force 20 request sai liên tiếp | Rate limiting (nếu có); nếu chưa → **known gap** |
| TC31 | Gửi `Authorization: Bearer <token>` header thay cookie | Bị reject (server chỉ đọc cookie) |
| TC32 | POST `/api/auth/login` từ origin khác | CORS policy chặn |

---

## UX EDGE CASES

| # | Mô tả | Expected |
|---|-------|----------|
| TC33 ⚠️ | Đã login mà gõ thẳng URL `/login` | Redirect `/dashboard` — **HIỆN TẠI: GAP** |
| TC34 ⚠️ | Login từ URL có `?from=/dashboard` (redirect-back) | Về đúng trang đó — **HIỆN TẠI: GAP** |
| TC35 | Double-click nút Login | Chỉ 1 request gửi (button disabled sau click) |
| TC36 | Mạng chậm / timeout khi login | Loading state, không freeze, không submit lặp |
| TC37 | Password có khoảng trắng đầu/cuối | Consistent với lúc register (trim hoặc không trim đều nhau) |

---

## ROLE & AUTHORIZATION BOUNDARY

| # | Mô tả | Expected |
|---|-------|----------|
| TC38 | User thường gọi `/api/admin/*` với cookie hợp lệ | 403, không lộ data |
| TC39 | Admin vào `/dashboard` | Vào được (admin cũng là user) |
| TC40 | Sửa role trong JWT payload thành `admin` (không re-sign) | `jwtVerify` fail → redirect `/login` |

---

## SESSION INTEGRITY

| # | Mô tả | Expected |
|---|-------|----------|
| TC41 | `pm2 restart` → user đang login | Không bị logout oan (JWT dùng secret cố định) |
| TC42 | Deploy code mới → user đang login | Không bị kick (JWT stateless) |

---

## ⚠️ GAPS ĐÃ XÁC NHẬN (Cần Fix)

| Gap | Mô tả | Fix |
|-----|-------|-----|
| TC33 | Đã login vào `/login` lại không redirect | Thêm vào middleware: nếu `/login` + valid token → redirect `/dashboard` |
| TC34 | Không có redirect-back sau login | Middleware thêm `?from=<pathname>`, login page đọc và redirect đúng |
| TC30 | Chưa có rate limiting | Known gap — ghi nhận, fix sau |

---

**Tổng: 42 test cases | 3 known gaps**
*Chiến 🕺 viết TC01-TC18 | Chó 🐕 bổ sung TC19-TC42 + xác nhận gaps*
