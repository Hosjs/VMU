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
-- Cấu trúc bảng cho bảng `trinh_do_dao_tao`
--

CREATE TABLE `trinh_do_dao_tao` (
  `maTrinhDoDaoTao` varchar(10) NOT NULL,
  `tenTrinhDo` varchar(100) NOT NULL,
  `moTa` varchar(255) DEFAULT NULL,
  `trangThai` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `createdBy` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `trinh_do_dao_tao`
--

INSERT INTO `trinh_do_dao_tao` (`maTrinhDoDaoTao`, `tenTrinhDo`, `moTa`, `trangThai`, `created_at`, `updated_at`, `deleted_at`, `createdBy`) VALUES
('CuNhan', 'Cử nhân', 'Trình độ đại học', 1, '2025-10-31 18:54:09', '2025-10-31 18:54:09', NULL, NULL),
('ThacSi', 'Thạc sỹ', 'Trình độ sau đại học', 1, '2025-10-31 18:54:09', '2025-10-31 18:54:09', NULL, NULL),
('TienSi', 'Tiến sỹ', 'Trình độ nghiên cứu sinh', 1, '2025-10-31 18:54:09', '2025-10-31 18:54:09', NULL, NULL);

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `trinh_do_dao_tao`
--
ALTER TABLE `trinh_do_dao_tao`
  ADD PRIMARY KEY (`maTrinhDoDaoTao`),
  ADD KEY `trinh_do_dao_tao_createdby_foreign` (`createdBy`);

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `trinh_do_dao_tao`
--
ALTER TABLE `trinh_do_dao_tao`
  ADD CONSTRAINT `trinh_do_dao_tao_createdby_foreign` FOREIGN KEY (`createdBy`) REFERENCES `users` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
