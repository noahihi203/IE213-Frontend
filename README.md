# UniSync HCM — Frontend

> Nền tảng blog chia sẻ thông tin về các trường đại học tại TP. Hồ Chí Minh.
> Live: **[unisynchcm.com](https://unisynchcm.com)**

---

## Giới thiệu

UniSync HCM Frontend là ứng dụng giao diện người dùng được xây dựng bằng **Next.js 14 (App Router)**, phục vụ ba nhóm người dùng chính: độc giả (Guest/User), tác giả (Author) và quản trị viên (Admin). Giao diện hỗ trợ SSG/SSR để tối ưu SEO và tốc độ tải trang.

---

## Tech Stack

| Công nghệ | Phiên bản | Vai trò |
|---|---|---|
| Next.js | 14 | Framework React với App Router |
| TypeScript | 5.x | Ngôn ngữ lập trình |
| Tailwind CSS | 3.x | Framework CSS utility-first |
| Zustand | 4.x | Quản lý state toàn cục |

---

## Tính năng

### Người dùng chưa đăng nhập (Guest)
- Xem trang chủ, danh sách bài viết, bài viết nổi bật (trending)
- Xem chi tiết bài viết và bình luận phân cấp
- Duyệt bài viết theo danh mục và tag
- Xem hồ sơ công khai của tác giả

### Người dùng đã đăng nhập (User)
- Đăng ký, xác thực email, đăng nhập, quên mật khẩu
- Like/bỏ like bài viết và bình luận
- Bình luận phân cấp nhiều tầng (Nested Set)
- Chia sẻ bài viết lên Facebook, Twitter, LinkedIn
- Follow/unfollow tác giả
- Nhận & xem thông báo real-time (bell icon)
- Cập nhật hồ sơ cá nhân (avatar, bio, username)

### Tác giả (Author)
- Dashboard quản lý bài viết cá nhân
- Soạn thảo bài viết với rich text editor
- Upload ảnh bìa (tự động optimize & lưu lên DigitalOcean Spaces)
- Phân loại bài viết theo danh mục và tag
- Tối ưu SEO trực tiếp trên giao diện soạn thảo (tiêu đề, meta description, focus keyword)
- Quản lý trạng thái bài viết: draft / published / archived

### Quản trị viên (Admin)
- Dashboard thống kê tổng quan hệ thống
- Quản lý người dùng: xem, khóa tài khoản, thay đổi vai trò
- Quản lý danh mục và tag (thêm, sửa, xóa, bật/tắt)
- Quản lý bài viết toàn hệ thống

---

## Chiến lược render trang

| Nhóm trang | Chiến lược | Lý do |
|---|---|---|
| Chi tiết bài viết | SSG | Tối ưu SEO, nội dung ít thay đổi sau khi xuất bản |
| Danh mục | SSG | Ít thay đổi, hưởng lợi từ phân phối tĩnh |
| Danh sách bài viết | SSR / ISR | Nội dung cập nhật liên tục, cần thân thiện với crawler |
| Dashboard quản trị | CSR | Tương tác phức tạp, không cần index SEO |
| Đăng nhập / Đăng ký | CSR | Biểu mẫu xác thực, ưu tiên tốc độ tương tác |
| Hồ sơ người dùng | SSR | Thông tin thay đổi theo thời gian |

---

## Cài đặt & Chạy local

### Yêu cầu
- Node.js >= 18
- Backend API đang chạy (xem [IE213-Backend](https://github.com/noahihi203/IE213-Backend))

### Các bước

```bash
# 1. Clone repo
git clone https://github.com/noahihi203/IE213-Frontend.git
cd IE213-Frontend

# 2. Cài dependencies
npm install

# 3. Tạo file môi trường
cp .env.example .env.local
```

Điền các biến môi trường vào `.env.local`:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3001
```

```bash
# 4. Chạy development server
npm run dev
```

Truy cập: [http://localhost:3001](http://localhost:3001)

### Build production

```bash
npm run build
npm run start
```

---

## Cấu trúc thư mục

```
IE213-Frontend/
├── app/                    # App Router (Next.js 14)
│   ├── (public)/           # Các trang công khai (guest)
│   ├── (auth)/             # Đăng nhập, đăng ký, quên mật khẩu
│   ├── dashboard/          # Dashboard người dùng / tác giả / admin
│   └── layout.tsx          # Root layout
├── components/             # Shared UI components
├── hooks/                  # Custom React hooks (bài viết, bình luận, thông báo...)
├── lib/                    # Lớp gọi API, utils, helpers
├── store/                  # Zustand state stores (auth, notifications...)
├── types/                  # TypeScript interfaces (IPost, IUser, IComment...)
└── public/                 # Static assets
```

---

## Liên kết

- 🔗 **Backend Repo:** [IE213-Backend](https://github.com/noahihi203/IE213-Backend)
- 🎨 **Figma Design:** [UniSync Design System](https://www.figma.com/design/5s1dlHuiRUjFmrCw4vxjGK/UniSync)
- 🌐 **Live Site:** [unisynchcm.com](https://unisynchcm.com)

---

## Nhóm phát triển

Dự án môn **IE213 — Kỹ thuật Phát triển Hệ thống Web**, Trường Đại học Công nghệ Thông tin — ĐHQG TP.HCM.

| Thành viên | MSSV | Vai trò |
|---|---|---|
| Vũ Quang Huy | 22520587 | Trưởng nhóm, DevOps, Backend |
| Bùi Quốc Lâm | 22520733 | Backend, Frontend, Database |
| Nguyễn Trần Hương Giang | 22520359 | UI/UX Design, Frontend, Testing |
| Chung Kiết Lâm | 22520735 | Frontend |
| Châu Trần Vỹ Linh | 22520755 | UI/UX, Content, Báo cáo |

**GVHD:** ThS. Phạm Nhật Duy
