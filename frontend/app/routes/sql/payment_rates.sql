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
-- Cấu trúc bảng cho bảng `payment_rates`
--

CREATE TABLE `payment_rates` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL COMMENT 'Tên đơn giá',
  `subject_type` varchar(100) DEFAULT NULL COMMENT 'Loại môn: Quản lý, Dự học kinh tế, Pháp tiền...',
  `education_level` varchar(50) DEFAULT NULL COMMENT 'Trình độ: VCB, TC...',
  `semester_code` varchar(50) DEFAULT NULL COMMENT 'Học kỳ áp dụng',
  `theory_rate` decimal(15,2) NOT NULL DEFAULT 0.00 COMMENT 'Đơn giá giảng dạy lý thuyết (VND/giờ)',
  `practical_rate` decimal(15,2) NOT NULL DEFAULT 0.00 COMMENT 'Đơn giá thực hành (VND/giờ)',
  `insurance_rate` decimal(5,2) NOT NULL DEFAULT 0.00 COMMENT 'Tỉ lệ bảo hiểm (%)',
  `description` text DEFAULT NULL COMMENT 'Mô tả',
  `is_active` tinyint(1) NOT NULL DEFAULT 1 COMMENT 'Trạng thái',
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `updated_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `payment_rates`
--
ALTER TABLE `payment_rates`
  ADD PRIMARY KEY (`id`),
  ADD KEY `payment_rates_subject_type_education_level_is_active_index` (`subject_type`,`education_level`,`is_active`),
  ADD KEY `payment_rates_semester_code_index` (`semester_code`),
  ADD KEY `payment_rates_created_by_foreign` (`created_by`),
  ADD KEY `payment_rates_updated_by_foreign` (`updated_by`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `payment_rates`
--
ALTER TABLE `payment_rates`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `payment_rates`
--
ALTER TABLE `payment_rates`
  ADD CONSTRAINT `payment_rates_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `payment_rates_updated_by_foreign` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
