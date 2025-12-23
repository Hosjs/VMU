-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: localhost
-- Thời gian đã tạo: Th12 23, 2025 lúc 10:34 AM
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
-- Cấu trúc bảng cho bảng `teaching_assignments`
--

CREATE TABLE `teaching_assignments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `lecturer_id` bigint(20) UNSIGNED NOT NULL,
  `lop_id` bigint(20) UNSIGNED DEFAULT NULL,
  `class_id` bigint(20) UNSIGNED DEFAULT NULL,
  `course_code` varchar(255) DEFAULT NULL,
  `course_name` varchar(255) NOT NULL,
  `credits` int(11) NOT NULL DEFAULT 0,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `day_of_week` enum('saturday','sunday') NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `room` varchar(255) DEFAULT NULL,
  `class_name` varchar(255) DEFAULT NULL,
  `student_count` int(11) NOT NULL DEFAULT 0,
  `status` enum('scheduled','ongoing','completed','cancelled') NOT NULL DEFAULT 'scheduled',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `teaching_assignments`
--

INSERT INTO `teaching_assignments` (`id`, `lecturer_id`, `lop_id`, `class_id`, `course_code`, `course_name`, `credits`, `start_date`, `end_date`, `day_of_week`, `start_time`, `end_time`, `room`, `class_name`, `student_count`, `status`, `notes`, `created_at`, `updated_at`, `deleted_at`) VALUES
(3, 1, 34, 34, '1232', 'sdasd', 2, '2025-11-08', '2025-11-09', 'saturday', '08:00:00', '12:00:00', '12312', '12sdasd', 22, 'scheduled', NULL, '2025-11-07 01:44:38', '2025-11-11 02:29:39', '2025-11-11 02:29:39'),
(4, 256, 34, 34, '513 ITKB', 'Hệ cơ sở tri thức nâng cao', 2, '2025-11-15', '2026-01-18', 'saturday', '08:00:00', '12:00:00', 'A101', NULL, 20, 'scheduled', NULL, '2025-11-10 18:47:48', '2025-11-10 18:47:48', NULL),
(5, 256, 34, 34, '513 ITKB', 'Hệ cơ sở tri thức nâng cao', 2, '2025-11-15', '2026-01-18', 'sunday', '08:00:00', '12:00:00', 'A101', NULL, 20, 'scheduled', NULL, '2025-11-10 18:47:48', '2025-11-11 18:39:36', NULL),
(6, 12, NULL, NULL, '502 HPTA', 'Tiếng Anh', 3, '2025-11-15', '2026-02-22', 'saturday', '08:00:00', '17:00:00', 'A101', 'âcsc', 13, 'scheduled', NULL, '2025-11-10 19:50:19', '2025-11-11 18:39:36', NULL),
(7, 21, NULL, NULL, '508 TTCF', 'Lý thuyết và ứng dụng CFD trong lĩnh vực đóng tàu', 2, '2025-11-15', '2025-11-16', 'saturday', '08:00:00', '17:00:00', 'ádasd', 'HS123', 3, 'scheduled', NULL, '2025-11-11 18:57:00', '2025-11-11 18:57:00', NULL),
(8, 256, NULL, NULL, '531 ITBT', 'Công nghệ Chuỗi khối', 2, '2025-11-19', '2025-11-20', 'saturday', '14:00:00', '17:00:00', NULL, 'dfsd', 20, 'scheduled', NULL, '2025-11-17 02:38:01', '2025-11-26 02:23:40', '2025-11-26 02:23:40'),
(9, 351, NULL, NULL, '515 ITIS', 'An toàn bảo mật thông tin nâng cao', 2, '2025-11-25', '2026-01-25', 'saturday', '08:00:00', '12:00:00', '1', 'Lớp Test 1', 0, 'scheduled', NULL, '2025-11-25 08:35:44', '2025-11-26 02:26:32', '2025-11-26 02:26:32'),
(10, 351, 34, 34, '515 ITIS', 'An toàn bảo mật thông tin nâng cao', 2, '2025-11-25', '2026-01-25', 'sunday', '08:00:00', '12:00:00', '1', 'Lớp Test 1', 0, 'scheduled', NULL, '2025-11-25 08:35:44', '2025-11-25 08:36:11', '2025-11-25 08:36:11'),
(11, 351, NULL, NULL, '514 ITPM', 'Quản trị dự án công nghệ thông tin nâng cao', 2, '2025-11-26', '2026-02-01', 'saturday', '08:00:00', '12:00:00', '123', '1123', 0, 'scheduled', NULL, '2025-11-26 02:26:54', '2025-12-06 00:56:04', '2025-12-06 00:56:04'),
(12, 351, NULL, NULL, '515 ITIS', 'An toàn bảo mật thông tin nâng cao', 2, '2025-12-10', '2026-01-11', 'saturday', '22:00:00', '23:00:00', '123', 'ii', 0, 'scheduled', NULL, '2025-12-06 00:48:51', '2025-12-06 00:55:52', '2025-12-06 00:55:52'),
(13, 351, NULL, NULL, '529 ITHC', 'Tương tác người- máy nâng cao', 2, '2025-12-04', '2026-01-11', 'saturday', '08:00:00', '12:00:00', 'A101', 'TTNM01', 0, 'scheduled', NULL, '2025-12-08 19:08:25', '2025-12-08 19:08:25', NULL);

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `teaching_assignments`
--
ALTER TABLE `teaching_assignments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `teaching_assignments_lecturer_id_start_date_day_of_week_index` (`lecturer_id`,`start_date`,`day_of_week`),
  ADD KEY `teaching_assignments_status_start_date_index` (`status`,`start_date`),
  ADD KEY `teaching_assignments_class_id_foreign` (`class_id`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `teaching_assignments`
--
ALTER TABLE `teaching_assignments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `teaching_assignments`
--
ALTER TABLE `teaching_assignments`
  ADD CONSTRAINT `teaching_assignments_class_id_foreign` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `teaching_assignments_lecturer_id_foreign` FOREIGN KEY (`lecturer_id`) REFERENCES `lecturers` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
