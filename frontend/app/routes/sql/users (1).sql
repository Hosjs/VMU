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
-- Cấu trúc bảng cho bảng `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `birth_date` date DEFAULT NULL,
  `gender` enum('male','female','other') DEFAULT NULL,
  `address` text DEFAULT NULL,
  `employee_code` varchar(255) DEFAULT NULL,
  `position` varchar(255) DEFAULT NULL,
  `department` varchar(255) DEFAULT NULL,
  `hire_date` date DEFAULT NULL,
  `salary` decimal(15,2) DEFAULT NULL,
  `role_id` bigint(20) UNSIGNED DEFAULT NULL,
  `lecturer_id` bigint(20) UNSIGNED DEFAULT NULL,
  `custom_permissions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`custom_permissions`)),
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `notes` text DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `phone`, `avatar`, `birth_date`, `gender`, `address`, `employee_code`, `position`, `department`, `hire_date`, `salary`, `role_id`, `lecturer_id`, `custom_permissions`, `is_active`, `notes`, `email_verified_at`, `password`, `remember_token`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'System Administrator', 'admin@example.com', '0900000000', NULL, NULL, NULL, NULL, 'ADMIN-001', 'System Administrator', 'Management', '2025-11-01', 30000000.00, 1, NULL, NULL, 1, NULL, '2025-10-31 18:54:09', '$2y$12$.RavSi5iZOV0sUrNvURnnODkE/R3xCRxJDX6gOc15M8MRBpudQZzu', NULL, '2025-10-31 18:54:09', '2025-10-31 18:54:09', NULL),
(2, 'Giáo Vụ', 'giaovu@example.com', NULL, NULL, '2025-10-01', 'male', NULL, NULL, NULL, NULL, NULL, NULL, 2, NULL, NULL, 1, NULL, NULL, '$2y$12$.RavSi5iZOV0sUrNvURnnODkE/R3xCRxJDX6gOc15M8MRBpudQZzu', NULL, NULL, NULL, NULL),
(3, 'Lã Xuân Anh', 'anhlx@vimaru.edu.vn', NULL, NULL, '2025-11-19', 'male', NULL, NULL, NULL, NULL, NULL, NULL, 5, NULL, NULL, 1, NULL, NULL, '$2y$12$.RavSi5iZOV0sUrNvURnnODkE/R3xCRxJDX6gOc15M8MRBpudQZzu', NULL, NULL, NULL, NULL),
(14, 'Giảng viên test', 'teacher@gmail.com', '0913456788', NULL, '1995-12-22', 'male', '123', 'TC001', 'Giảng viên test', 'Khoa CNTT', '2025-12-01', NULL, 5, 351, NULL, 1, NULL, '2025-12-09 01:30:03', '$2y$12$.RavSi5iZOV0sUrNvURnnODkE/R3xCRxJDX6gOc15M8MRBpudQZzu', NULL, '2025-12-09 01:30:03', '2025-12-08 20:15:05', NULL),
(15, 'teacher2', 'teacher2@example.com', '0988123456', NULL, '2015-12-01', 'female', 'qưe', 'TC2001', 'Giáo viên', 'vavkn', '2025-12-01', 100000000.00, 4, NULL, NULL, 1, NULL, '2025-12-08 01:30:03', '$2y$12$.RavSi5iZOV0sUrNvURnnODkE/R3xCRxJDX6gOc15M8MRBpudQZzu', NULL, NULL, NULL, NULL);

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`),
  ADD UNIQUE KEY `users_employee_code_unique` (`employee_code`),
  ADD KEY `users_email_index` (`email`),
  ADD KEY `users_phone_index` (`phone`),
  ADD KEY `users_employee_code_index` (`employee_code`),
  ADD KEY `users_role_id_index` (`role_id`),
  ADD KEY `users_is_active_position_index` (`is_active`,`position`),
  ADD KEY `users_deleted_at_index` (`deleted_at`),
  ADD KEY `users_lecturer_id_index` (`lecturer_id`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
