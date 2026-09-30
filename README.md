# Unilearn - Học Thông Minh 🚀
Nền tảng học tập trực tuyến thông minh phục vụ học sinh từ Lớp 6 đến Lớp 12 với 3 phân quyền: Học sinh, Giáo viên và Phụ huynh.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide Icons, Axios, Socket.IO Client.
- **Backend**: Node.js, NestJS, TypeScript, TypeORM, Mongoose, Socket.IO Gateway, Passport JWT, Swagger.
- **Cơ Sở Dữ Liệu (Hybrid Database - Cài đặt trực tiếp trên máy, KHÔNG dùng Docker)**:
  - **MySQL**: Quản lý dữ liệu quan hệ (`users`, `user_stats`, `classes`, `class_members`, `assignments`, `assignment_extensions`, `assignment_submissions`, `subscriptions`).
  - **MongoDB**: Quản lý dữ liệu linh hoạt dạng document (`lessons`, `flashcards`, `question_bank`, `exams`, `exam_attempts`, `chat_messages`, `announcements`).
- **Realtime**: Socket.IO cho chat lớp học, typing indicator và cập nhật trạng thái trực tuyến.
- **Bảo mật**: Mã hóa mật khẩu với `bcrypt`, phân quyền vai trò qua NestJS Guards, JWT Access Token & Refresh Token.

---

## 📋 Yêu Cầu Môi Trường (Prerequisites)

1. **Node.js**: Phiên bản 18+ (khuyên dùng Node.js 20 hoặc 22/24).
2. **MySQL Server**: Đã cài đặt và đang chạy dịch vụ MySQL tại cổng mặc định `3306`.
3. **MongoDB Server**: Đã cài đặt và đang chạy dịch vụ MongoDB tại cổng mặc định `27017` (MongoDB Community Server).

---

## ⚙️ Hướng Dẫn Cài Đặt & Chạy Local (Không Dùng Docker)

### Bước 1: Khởi Tạo Cơ Sở Dữ Liệu MySQL

1. Mở MySQL Workbench, phpMyAdmin, DBeaver hoặc MySQL Command Line Client.
2. Chạy file script tạo cơ sở dữ liệu và bảng tại đường dẫn:
   ```
   BackEnd/database/schema.sql
   ```
   *Lệnh thực thi nhanh qua terminal (nếu có mysql client):*
   ```bash
   mysql -u root -p < BackEnd/database/schema.sql
   ```
3. Script sẽ tự động tạo database `unilearn_db` và 8 bảng quan hệ chuẩn với bảng mã `utf8mb4`.

### Bước 2: Kiểm Tra MongoDB

1. Đảm bảo dịch vụ MongoDB đang chạy trên máy (Service `MongoDB` trong Windows Services).
2. Backend sẽ tự động kết nối và khởi tạo các collection trong database `unilearn_db` tại địa chỉ:
   ```
   mongodb://localhost:27017/unilearn_db
   ```

### Bước 3: Cấu Hình Biến Môi Trường (.env)

#### 1. Backend (`BackEnd/.env`):
Đã có sẵn file mẫu `BackEnd/.env.example`. Hãy kiểm tra file `BackEnd/.env` và cập nhật thông số MySQL nếu máy của bạn có đặt mật khẩu:
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# MySQL
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password_here
MYSQL_DATABASE=unilearn_db
MYSQL_SYNCHRONIZE=true

# MongoDB
MONGODB_URI=mongodb://localhost:27017/unilearn_db

# JWT
JWT_SECRET=unilearn_access_token_secret_key_2026_super_secure
JWT_EXPIRATION=1d
JWT_REFRESH_SECRET=unilearn_refresh_token_secret_key_2026_super_secure
JWT_REFRESH_EXPIRATION=7d
```

#### 2. Frontend (`FrontEnd/.env.local`):
Đã có sẵn file cấu hình kết nối API và WebSocket:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

---

## 🚀 Khởi Chạy Ứng Dụng

### Khởi chạy Backend (NestJS API Server):
Mở terminal tại thư mục gốc:
```bash
cd BackEnd
npm run start:dev
```
- API Base URL: `http://localhost:5000/api`
- Tài liệu Swagger tương tác trực tiếp: `http://localhost:5000/api/docs`

### Khởi chạy Frontend (Next.js):
Mở một cửa sổ terminal mới:
```bash
cd FrontEnd
npm run dev
```
- Mở trình duyệt và truy cập: `http://localhost:3000`

---

## 🗺️ Lộ Trình Phát Triển 7 Giai Đoạn (Milestones)

- [x] **Giai đoạn 1**: Khởi tạo project, cấu hình MySQL & MongoDB qua .env, kiểm tra build, tài liệu hướng dẫn và script tạo bảng MySQL.
- [ ] **Giai đoạn 2**: Hệ thống xác thực (Đăng ký, Đăng nhập nhận diện username/email, phân quyền Role Guards, sinh mã học sinh 6 ký tự duy nhất).
- [ ] **Giai đoạn 3**: Layout chuẩn (Sidebar thu gọn + Topbar streak/điểm/avatar) & Trang chủ học sinh.
- [ ] **Giai đoạn 4**: Module Học bài (Danh sách môn/lớp 6-12, Chi tiết khoá theo chương, Chi tiết bài 4 phần: Lý thuyết, Flashcard ghép cặp, Bài tập, Ôn lỗi sai + Drawer Gia sư).
- [ ] **Giai đoạn 5**: Module Lớp học (Giáo viên và Học sinh, tham gia mã, mời mã học sinh, giao bài tập, gia hạn riêng/cả lớp, theo dõi nộp bài).
- [ ] **Giai đoạn 6**: Chat Realtime Socket.IO & Thông báo lớp.
- [ ] **Giai đoạn 7**: Module Ôn luyện (Cấu hình đề, thi đếm ngược, phân tích kết quả) & Dữ liệu Seeder mẫu.
