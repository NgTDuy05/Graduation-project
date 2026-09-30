-- ===================================================================
-- UNILearn ("Học thông minh") - MySQL Relational Database Schema
-- Database: unilearn_db
-- Encoding: utf8mb4_unicode_ci
-- ===================================================================

CREATE DATABASE IF NOT EXISTS `unilearn_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `unilearn_db`;

-- 1. Bảng Người dùng (users)
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(100) NOT NULL,
  `avatar_url` VARCHAR(255) NULL,
  `role` ENUM('HOC_SINH', 'GIAO_VIEN', 'PHU_HUYNH') NOT NULL DEFAULT 'HOC_SINH',
  `student_code` VARCHAR(6) NULL UNIQUE COMMENT 'Mã định danh duy nhất 6 ký tự viết hoa cho Học sinh',
  `phone_number` VARCHAR(20) NULL,
  `refresh_token` VARCHAR(255) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_role` (`role`),
  INDEX `idx_users_student_code` (`student_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Bảng Thống kê & Gamification học sinh (user_stats)
CREATE TABLE IF NOT EXISTS `user_stats` (
  `user_id` INT PRIMARY KEY,
  `streak_days` INT NOT NULL DEFAULT 0 COMMENT 'Chuỗi ngày học liên tục',
  `last_active_date` DATE NULL COMMENT 'Ngày hoạt động gần nhất để tính streak',
  `lightning_points` INT NOT NULL DEFAULT 0 COMMENT 'Điểm tia sét tích lũy',
  `rank_tier` VARCHAR(30) NOT NULL DEFAULT 'Đồng' COMMENT 'Hạng học viên: Đồng, Bạc, Vàng, Kim Cương',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_user_stats_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Bảng Lớp học (classes)
CREATE TABLE IF NOT EXISTS `classes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `grade` TINYINT NOT NULL COMMENT 'Khối lớp từ 6 đến 12',
  `subject` VARCHAR(50) NOT NULL COMMENT 'Môn học (Toán, Vật lý, Hóa học,...)',
  `class_code` VARCHAR(8) NOT NULL UNIQUE COMMENT 'Mã tham gia lớp học gồm 8 ký tự',
  `description` TEXT NULL,
  `teacher_id` INT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_classes_grade` (`grade`),
  INDEX `idx_classes_code` (`class_code`),
  CONSTRAINT `fk_classes_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Bảng Thành viên lớp học (class_members)
CREATE TABLE IF NOT EXISTS `class_members` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `class_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `role_in_class` ENUM('STUDENT', 'TEACHER') NOT NULL DEFAULT 'STUDENT',
  `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'APPROVED',
  `joined_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_class_user` (`class_id`, `user_id`),
  CONSTRAINT `fk_class_members_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_class_members_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Bảng Bài tập được giao (assignments)
CREATE TABLE IF NOT EXISTS `assignments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `class_id` INT NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `description` TEXT NULL,
  `deadline` DATETIME NOT NULL,
  `allow_late_submission` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_by` INT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_assignments_deadline` (`deadline`),
  CONSTRAINT `fk_assignments_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_assignments_author` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Bảng Gia hạn bài tập (assignment_extensions)
CREATE TABLE IF NOT EXISTS `assignment_extensions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `assignment_id` INT NOT NULL,
  `student_id` INT NULL COMMENT 'Nếu NULL nghĩa là gia hạn chung cho cả lớp',
  `extended_deadline` DATETIME NOT NULL,
  `reason` VARCHAR(255) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_extensions_assignment` FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_extensions_student` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Bảng Bài nộp của học sinh (assignment_submissions)
CREATE TABLE IF NOT EXISTS `assignment_submissions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `assignment_id` INT NOT NULL,
  `student_id` INT NOT NULL,
  `status` ENUM('CHUA_LAM', 'DANG_LAM', 'DA_NOP', 'QUA_HAN') NOT NULL DEFAULT 'CHUA_LAM',
  `content` TEXT NULL COMMENT 'Nội dung nộp bài (văn bản/link/file)',
  `score` DECIMAL(4, 2) NULL COMMENT 'Điểm số từ 0.00 đến 10.00',
  `feedback` TEXT NULL COMMENT 'Lời phê / nhận xét của giáo viên',
  `submitted_at` DATETIME NULL,
  `graded_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_assignment_student` (`assignment_id`, `student_id`),
  CONSTRAINT `fk_submissions_assignment` FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_submissions_student` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Bảng Gói tài khoản & Đăng ký (subscriptions)
CREATE TABLE IF NOT EXISTS `subscriptions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `plan_type` ENUM('FREE', 'PRO') NOT NULL DEFAULT 'FREE',
  `start_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `end_date` DATETIME NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_subscriptions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
