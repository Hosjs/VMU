-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: localhost
-- Thời gian đã tạo: Th12 23, 2025 lúc 10:33 AM
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
-- Cấu trúc bảng cho bảng `subject_enrollments`
--

CREATE TABLE `subject_enrollments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `maHV` varchar(255) NOT NULL,
  `subject_id` bigint(20) UNSIGNED NOT NULL,
  `major_id` bigint(20) UNSIGNED NOT NULL,
  `namHoc` int(11) NOT NULL,
  `hocKy` varchar(255) DEFAULT NULL,
  `trangThai` enum('DangHoc','DaHoanThanh','Huy') NOT NULL DEFAULT 'DangHoc',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `subject_enrollments`
--

INSERT INTO `subject_enrollments` (`id`, `maHV`, `subject_id`, `major_id`, `namHoc`, `hocKy`, `trangThai`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'sfa', 48, 4, 2025, NULL, 'DangHoc', '2025-12-03 01:41:12', '2025-12-03 01:41:12', NULL),
(2, 'CN2421005', 46, 4, 2025, NULL, 'DangHoc', '2025-12-06 01:26:21', '2025-12-06 01:26:21', NULL),
(4, 'sfa', 426, 4, 2025, NULL, 'DangHoc', '2025-12-08 00:07:00', '2025-12-08 00:07:00', NULL),
(5, 'CN2211002', 426, 4, 2025, NULL, 'DangHoc', '2025-12-08 01:37:07', '2025-12-08 01:37:07', NULL),
(6, 'CN2421002', 426, 4, 2025, NULL, 'DangHoc', '2025-12-08 01:37:08', '2025-12-08 01:37:08', NULL),
(7, 'CN2211002', 56, 4, 2025, NULL, 'DangHoc', '2025-12-08 19:09:43', '2025-12-08 19:09:43', NULL),
(8, 'CN2211001', 56, 4, 2025, NULL, 'DangHoc', '2025-12-08 19:10:21', '2025-12-08 19:10:21', NULL),
(9, 'CN2421001', 56, 4, 2025, NULL, 'DangHoc', '2025-12-08 19:10:21', '2025-12-08 19:10:21', NULL),
(10, 'sfa', 426, 4, 2022, NULL, 'DangHoc', '2025-12-09 18:41:19', '2025-12-09 18:41:19', NULL),
(11, 'sfa', 48, 4, 2022, NULL, 'DangHoc', '2025-12-14 20:41:55', '2025-12-14 20:41:55', NULL);

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `subject_enrollments`
--
ALTER TABLE `subject_enrollments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `subject_enrollments_mahv_subject_id_namhoc_unique` (`maHV`,`subject_id`,`namHoc`),
  ADD KEY `subject_enrollments_subject_id_foreign` (`subject_id`),
  ADD KEY `subject_enrollments_major_id_foreign` (`major_id`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `subject_enrollments`
--
ALTER TABLE `subject_enrollments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `subject_enrollments`
--
ALTER TABLE `subject_enrollments`
  ADD CONSTRAINT `subject_enrollments_mahv_foreign` FOREIGN KEY (`maHV`) REFERENCES `students` (`maHV`) ON DELETE CASCADE,
  ADD CONSTRAINT `subject_enrollments_major_id_foreign` FOREIGN KEY (`major_id`) REFERENCES `majors` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `subject_enrollments_subject_id_foreign` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
