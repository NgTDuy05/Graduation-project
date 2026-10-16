# SmartLearn - Học Thông Minh 🚀
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
3. Script sẽ tự động tạo database `smartlearn_db` và 8 bảng quan hệ chuẩn với bảng mã `utf8mb4`.

### Bước 2: Kiểm Tra MongoDB

1. Đảm bảo dịch vụ MongoDB đang chạy trên máy (Service `MongoDB` trong Windows Services).
2. Backend sẽ tự động kết nối và khởi tạo các collection trong database `smartlearn_db` tại địa chỉ:
   ```
   mongodb://localhost:27017/smartlearn_db
   ```

### Bước 3: Cấu Hình Biến Môi Trường (.env)

#### 1. Backend (`BackEnd/.env`):
Đã có sẵn file mẫu `BackEnd/.env.example`. Hãy kiểm tra file `BackEnd/.env` và cập nhật thông số MySQL nếu máy của bạn có đặt mật khẩu:
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3001

# MySQL
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password_here
MYSQL_DATABASE=smartlearn_db
MYSQL_SYNCHRONIZE=true

# MongoDB
MONGODB_URI=mongodb://localhost:27017/smartlearn_db

# JWT
JWT_SECRET=smartlearn_access_token_secret_key_2026_super_secure
JWT_EXPIRATION=1d
JWT_REFRESH_SECRET=smartlearn_refresh_token_secret_key_2026_super_secure
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
- Mở trình duyệt và truy cập: `http://localhost:3001`

---

## 🗺️ Lộ Trình Phát Triển 7 Giai Đoạn (Milestones)

- [x] **Giai đoạn 1**: Khởi tạo project, cấu hình Hybrid MySQL & MongoDB qua .env, kiểm tra build, tài liệu hướng dẫn và script tạo bảng MySQL (`schema.sql`).
- [x] **Giai đoạn 2**: Hệ thống xác thực (Đăng ký, Đăng nhập nhận diện username/email, phân quyền Role Guards, sinh mã học sinh 6 ký tự duy nhất, popup chào mừng).
- [x] **Giai đoạn 3**: Layout chuẩn (Sidebar thu gọn w-20/w-64 + Topbar streak/điểm/hạng/điểm danh hàng ngày +15 XP) & Trang chủ học sinh (6 thẻ tính năng, nhiệm vụ ngày, bảng xếp hạng).
- [x] **Giai đoạn 4**: Module Học bài (Danh mục khối 6-12, Đề cương khoá học theo chương, Chi tiết bài học 4 phần: Lý thuyết định dạng phong phú, Flashcard 3D lật thẻ, Trắc nghiệm tức thì, Ôn lỗi sai + Drawer Gia sư AI thông minh).
- [x] **Giai đoạn 5**: Module Lớp học (Giáo viên tạo lớp mã 8 ký tự, thêm học sinh qua mã 6 ký tự, giao bài tập, gia hạn riêng từng em / cả lớp, bảng theo dõi nộp bài & chấm điểm).
- [x] **Giai đoạn 6**: Chat Realtime Socket.IO & Bảng tin thông báo lớp học (phòng chat theo lớp, lưu trữ MongoDB, typing indicator 3 chấm nhảy động, đếm số người online, ghim thông báo giáo viên).
- [x] **Giai đoạn 7**: Module Ôn luyện & Thi trắc nghiệm trực tuyến (Kho đề thi theo khối lớp/môn học, cài đặt phòng thi tính giờ/tự do, đồng hồ đếm ngược báo động khi sắp hết giờ, bảng mục lục câu hỏi 1..N nhảy nhanh, chống gian lận che đáp án trước khi nộp, tự động chấm điểm thang 10, phân tích chi tiết câu đúng/sai kèm lời giải phương pháp & cộng thưởng XP).

---

## 👥 Tài Khoản Mẫu Trải Nghiệm (Test Accounts)

Bạn có thể tự tạo tài khoản mới ngay trên giao diện hoặc đăng ký nhanh 2 vai trò để thử nghiệm liên thông tính năng:

| Vai Trò | Email Đăng Nhập | Mật Khẩu | Đặc Điểm |
| :--- | :--- | :--- | :--- |
| **Giáo viên** | `giaovien@smartlearn.edu.vn` | `123456` | Quản lý lớp học, tạo bài tập, xem nộp bài, gia hạn hạn chót, đăng thông báo |
| **Học sinh** | `hocsinh@smartlearn.edu.vn` | `123456` | Tự động cấp mã 6 ký tự, học bài 4 phần, làm bài tập, thi thử trắc nghiệm, chat realtime |
| **Phụ huynh** | `phuhuynh@smartlearn.edu.vn` | `123456` | Màn hình liên kết tài khoản học sinh |
