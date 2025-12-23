-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: localhost
-- Thời gian đã tạo: Th12 23, 2025 lúc 10:32 AM
-- Phiên bản máy phục vụ: 10.4.28-MariaDB
-- Phiên bản PHP: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `VMU`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `roles`
--

CREATE TABLE `roles` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `display_name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `permissions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`permissions`)),
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `is_system` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `roles`
--

INSERT INTO `roles` (`id`, `name`, `display_name`, `description`, `permissions`, `is_active`, `is_system`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'admin', 'Quản trị viên', 'Toàn quyền truy cập hệ thống', '{\"dashboard\":[\"view\",\"export\"],\"users\":[\"view\",\"create\",\"edit\",\"delete\"],\"roles\":[\"view\",\"create\",\"edit\",\"delete\"],\"students\":[\"view\",\"create\",\"edit\",\"delete\",\"export\"],\"classrooms\":[\"view\",\"create\",\"edit\",\"delete\"],\"class_assignments\":[\"view\",\"create\",\"edit\",\"delete\"],\"majors\":[\"view\",\"create\",\"edit\",\"delete\"],\"education_levels\":[\"view\",\"create\",\"edit\",\"delete\"],\"courses\":[\"view\",\"create\",\"edit\",\"delete\"],\"teachers\":[\"view\",\"create\",\"edit\",\"delete\"],\"teaching_assignments\":[\"view\",\"create\",\"edit\",\"delete\"],\"teacher_salaries\":[\"view\",\"create\",\"edit\",\"delete\",\"approve\"],\"semesters\":[\"view\",\"create\",\"edit\",\"delete\"],\"registration_packages\":[\"view\",\"create\",\"edit\",\"delete\"],\"course_registrations\":[\"view\",\"create\",\"edit\",\"delete\",\"approve\"],\"study_plans\":[\"view\",\"create\",\"edit\",\"delete\"],\"schedules\":[\"view\",\"create\",\"edit\",\"delete\"],\"grades\":[\"view\",\"create\",\"edit\",\"delete\",\"approve\",\"export\"],\"tuition_fees\":[\"view\",\"create\",\"edit\",\"delete\",\"approve\"],\"reports\":[\"view\",\"export\"],\"settings\":[\"view\",\"edit\"]}', 1, 1, '2025-10-31 18:54:09', '2025-10-31 18:54:09', NULL),
(2, 'manager', 'Quản lý', 'Quyền quản lý đào tạo', '{\"dashboard\":[\"view\"],\"students\":[\"view\",\"edit\",\"export\"],\"classrooms\":[\"view\",\"create\",\"edit\"],\"class_assignments\":[\"view\",\"create\",\"edit\"],\"courses\":[\"view\",\"edit\"],\"teachers\":[\"view\"],\"teaching_assignments\":[\"view\",\"create\",\"edit\"],\"schedules\":[\"view\",\"create\",\"edit\"],\"grades\":[\"view\",\"export\"],\"reports\":[\"view\",\"export\"]}', 1, 0, '2025-10-31 18:54:09', '2025-10-31 18:54:09', NULL),
(3, 'accountant', 'Kế toán', 'Quyền quản lý tài chính', '{\"dashboard\":[\"view\"],\"students\":[\"view\"],\"teacher_salaries\":[\"view\",\"create\",\"edit\"],\"tuition_fees\":[\"view\",\"create\",\"edit\",\"approve\"],\"reports\":[\"view\",\"export\"]}', 1, 0, '2025-10-31 18:54:09', '2025-10-31 18:54:09', NULL),
(4, 'teacher', 'Giảng viên', 'Quyền giảng viên', '{\"dashboard\":[\"view\"],\"students\":[\"view\"],\"schedules\":[\"view\"],\"grades\":[\"view\",\"create\",\"edit\"]}', 1, 0, '2025-10-31 18:54:09', '2025-10-31 18:54:09', NULL),
(5, 'student', 'Học viên', 'Quyền học viên cơ bản', '{\n  \"dashboard\": [\"view\"],\n  \"students\": [\"view\"],\n  \"classrooms\": [\"view\"],\n  \"schedules\": [\"view\", \"create\", \"edit\", \"delete\"]\n}\n', 1, 0, '2025-10-31 18:54:09', '2025-10-31 18:54:09', NULL),
(7, 'homeroom_teacher', 'Giáo viên chủ nhiệm', 'Quyền của giáo viên chủ nhiệm', '{\r\n        \"dashboard\": [\"view\"],\r\n        \"students\": [\"view\", \"edit\"],\r\n        \"classrooms\": [\"view\", \"edit\"],\r\n        \"schedules\": [\"view\"],\r\n        \"grades\": [\"view\", \"create\", \"edit\"]\r\n    }', 1, 0, '2025-12-08 09:07:34', '2025-12-08 09:07:34', NULL);

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `roles_name_unique` (`name`),
  ADD KEY `roles_name_index` (`name`),
  ADD KEY `roles_is_active_index` (`is_active`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `roles`
--
ALTER TABLE `roles`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
