-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: localhost
-- Thời gian đã tạo: Th12 23, 2025 lúc 10:31 AM
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
-- Cấu trúc bảng cho bảng `khoa_hoc`
--

CREATE TABLE `khoa_hoc` (
  `id` int(11) NOT NULL,
  `ma_khoa_hoc` varchar(20) NOT NULL,
  `nam_hoc` year(4) NOT NULL,
  `hoc_ky` int(11) NOT NULL CHECK (`hoc_ky` between 1 and 3),
  `dot` int(11) NOT NULL CHECK (`dot` between 1 and 5),
  `ngay_bat_dau` date DEFAULT NULL,
  `ngay_ket_thuc` date DEFAULT NULL,
  `ghi_chu` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `khoa_hoc`
--

INSERT INTO `khoa_hoc` (`id`, `ma_khoa_hoc`, `nam_hoc`, `hoc_ky`, `dot`, `ngay_bat_dau`, `ngay_ket_thuc`, `ghi_chu`) VALUES
(1, '2022.1.1', '2022', 1, 1, '2022-01-10', '2022-05-30', NULL),
(2, '2022.2.1', '2022', 2, 1, '2022-06-15', '2022-10-01', NULL),
(3, '2023.1.1', '2023', 1, 1, '2023-01-05', '2023-05-25', NULL),
(4, '2025.1.1', '2025', 1, 1, '2025-01-06', '2025-05-25', NULL),
(5, '2025.1.2', '2025', 1, 2, '2025-02-10', '2025-06-20', NULL),
(6, '2025.2.1', '2025', 2, 1, '2025-06-30', '2025-10-15', NULL),
(7, '2025.2.2', '2025', 2, 2, '2025-07-15', '2025-10-30', NULL),
(8, '2025.3.1', '2025', 3, 1, '2025-11-01', '2025-12-31', NULL);

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `khoa_hoc`
--
ALTER TABLE `khoa_hoc`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ma_khoa_hoc` (`ma_khoa_hoc`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `khoa_hoc`
--
ALTER TABLE `khoa_hoc`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
