-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: localhost
-- Thời gian đã tạo: Th10 15, 2025 lúc 03:01 AM
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
-- Cấu trúc bảng cho bảng `students`
--

CREATE TABLE `students` (
  `maHV` varchar(20) NOT NULL,
  `hoDem` varchar(100) NOT NULL,
  `ten` varchar(50) NOT NULL,
  `ngaySinh` date NOT NULL,
  `gioiTinh` varchar(10) NOT NULL,
  `soGiayToTuyThan` varchar(20) NOT NULL,
  `dienThoai` varchar(20) NOT NULL,
  `email` varchar(100) NOT NULL,
  `quocTich` varchar(50) DEFAULT NULL,
  `danToc` varchar(50) DEFAULT NULL,
  `tonGiao` varchar(50) DEFAULT NULL,
  `maTrinhDoDaoTao` varchar(10) NOT NULL,
  `maNganh` varchar(10) NOT NULL,
  `trangThai` enum('DangHoc','BaoLuu','DaTotNghiep','ThoiHoc') NOT NULL DEFAULT 'DangHoc',
  `ngayNhapHoc` datetime NOT NULL,
  `namVaoTruong` int(11) NOT NULL,
  `idLop` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `createdBy` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`maHV`),
  ADD UNIQUE KEY `hoc_vien_dienthoai_unique` (`dienThoai`),
  ADD UNIQUE KEY `hoc_vien_email_unique` (`email`),
  ADD KEY `hoc_vien_idlop_foreign` (`idLop`),
  ADD KEY `hoc_vien_createdby_foreign` (`createdBy`),
  ADD KEY `hoc_vien_matrinhdodaotao_index` (`maTrinhDoDaoTao`),
  ADD KEY `hoc_vien_manganh_index` (`maNganh`),
  ADD KEY `hoc_vien_namvaotruong_index` (`namVaoTruong`),
  ADD KEY `hoc_vien_trangthai_index` (`trangThai`);

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `students`
--
ALTER TABLE `students`
  ADD CONSTRAINT `hoc_vien_createdby_foreign` FOREIGN KEY (`createdBy`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `hoc_vien_idlop_foreign` FOREIGN KEY (`idLop`) REFERENCES `classes` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `hoc_vien_manganh_foreign` FOREIGN KEY (`maNganh`) REFERENCES `nganh_hoc` (`maNganh`),
  ADD CONSTRAINT `hoc_vien_matrinhdodaotao_foreign` FOREIGN KEY (`maTrinhDoDaoTao`) REFERENCES `trinh_do_dao_tao` (`maTrinhDoDaoTao`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
