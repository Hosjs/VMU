-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: localhost
-- Thời gian đã tạo: Th10 10, 2025 lúc 02:27 AM
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
-- Cấu trúc bảng cho bảng `majors`
--

CREATE TABLE `majors` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `maNganh` varchar(20) DEFAULT NULL,
  `tenNganh` varchar(255) NOT NULL,
  `thoi_gian_dao_tao` decimal(3,1) DEFAULT NULL,
  `ghiChu` text DEFAULT NULL,
  `parent_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_in` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `majors`
--

INSERT INTO `majors` (`id`, `maNganh`, `tenNganh`, `thoi_gian_dao_tao`, `ghiChu`, `parent_id`, `created_at`, `updated_at`, `deleted_in`) VALUES
(1, '8310110', 'Quản lý kinh tế - ThS', 2.0, 'Import auto', NULL, '2025-11-02 08:33:42', '2025-11-03 18:48:02', NULL),
(2, '83101101', 'Quản lý tài chính - ThS', 2.0, 'Import auto', NULL, '2025-11-02 08:33:42', '2025-11-02 08:46:50', NULL),
(3, '8310110-1', 'Quản lý kinh tế - Doanh nghiệp - ThS', 2.0, 'Import auto', NULL, '2025-11-02 08:33:42', '2025-11-02 08:46:52', NULL),
(4, '8480201', 'Công nghệ thông tin - ThS', 2.0, 'Import auto', NULL, '2025-11-02 08:33:42', '2025-11-02 08:46:55', NULL),
(5, '8520116', 'Kỹ thuật tàu thủy - ThS', 2.0, 'Import auto', NULL, '2025-11-02 08:33:42', '2025-11-02 08:46:57', NULL),
(6, '85201161', 'Khai thác, bảo trì tàu thủy - ThS', 2.0, 'Import auto', NULL, '2025-11-02 08:33:42', '2025-11-02 08:46:59', NULL),
(7, '85201162', 'Máy và thiết bị tàu thủy / Cơ khí động lực - ThS', 2.0, 'Import auto', NULL, '2025-11-02 08:33:42', '2025-11-02 08:47:01', NULL),
(8, '85201163', 'Quản lý sản xuất công nghiệp / Quản lý công nghiệp - ThS', 2.0, 'Import auto', NULL, '2025-11-02 08:33:42', '2025-11-02 08:47:03', NULL),
(9, '8520203', 'Kỹ thuật điện tử - viễn thông - ThS', 2.0, 'Import auto', NULL, '2025-11-02 08:33:42', '2025-11-02 08:47:10', NULL),
(10, '8520216', 'Kỹ thuật điều khiển và tự động hóa - ThS', 2.0, 'Import auto', NULL, '2025-11-02 08:33:42', '2025-11-02 08:47:13', NULL),
(11, '8520320', 'Kỹ thuật môi trường / Khoa học và công nghệ môi trường - ThS', 2.0, 'Import auto', NULL, '2025-11-02 08:33:42', '2025-11-02 08:47:15', NULL),
(12, '85203201', 'Quản lý môi trường - ThS', 2.0, 'Import auto', NULL, '2025-11-02 08:33:42', '2025-11-02 08:47:19', NULL),
(13, '8580201', 'Kỹ thuật xây dựng công trình DD&CN - ThS', 2.0, 'Import auto', NULL, '2025-11-02 08:33:42', '2025-11-02 08:47:23', NULL),
(14, '85802011', 'Quản lý dự án đầu tư và xây dựng / Kỹ thuật xây dựng - ThS', 2.0, 'Import auto', NULL, '2025-11-02 08:33:42', '2025-11-02 08:47:26', NULL),
(15, '8580202', 'Kỹ thuật xây dựng công trình thuỷ - ThS', 2.0, 'Import auto', NULL, '2025-11-02 08:33:42', '2025-11-02 08:47:28', NULL),
(16, '8840103', 'Quản lý vận tải và Logistics / Logistics quốc tế - ThS', 2.0, 'Import auto', NULL, '2025-11-02 08:33:42', '2025-11-02 08:47:24', NULL),
(17, '8840106', 'Quản lý hàng hải / Luật hàng hải - ThS', 2.0, 'Import auto', NULL, '2025-11-02 08:33:42', '2025-11-02 08:47:27', NULL),
(18, '88401061', 'Quản lý cảng và an toàn hàng hải / Bảo đảm an toàn hàng hải - ThS', 2.0, 'Import auto', NULL, '2025-11-02 08:33:42', '2025-11-02 08:47:30', NULL),
(19, '9310110', 'Quản lý kinh tế - TS', 4.0, 'Import auto', 1, '2025-11-02 08:33:58', '2025-11-02 08:47:35', NULL),
(20, '9480201', 'Công nghệ thông tin - TS', 4.0, 'Import auto', 4, '2025-11-02 08:33:58', '2025-11-02 08:47:43', NULL),
(21, '9520116', 'Kỹ thuật tàu thủy - TS', 4.0, 'Import auto', 5, '2025-11-02 08:33:58', '2025-11-02 08:47:41', NULL),
(22, '9520117', 'Khai thác, bảo trì tàu thủy - TS', 4.0, 'Import auto', 6, '2025-11-02 08:33:58', '2025-11-02 08:47:45', NULL),
(23, '9520115', 'Máy và thiết bị tàu thủy / Cơ khí động lực - TS', 4.0, 'Import auto', 7, '2025-11-02 08:33:58', '2025-11-02 08:47:48', NULL),
(24, '9340410', 'Quản lý sản xuất công nghiệp / Quản lý công nghiệp - TS', 4.0, 'Import auto', 8, '2025-11-02 08:33:58', '2025-11-02 08:47:49', NULL),
(25, '9520213', 'Kỹ thuật điện tử - viễn thông - TS', 4.0, 'Import auto', 9, '2025-11-02 08:33:58', '2025-11-02 08:47:51', NULL),
(26, '9520216', 'Kỹ thuật điều khiển và tự động hóa - TS', 4.0, 'Import auto', 10, '2025-11-02 08:33:58', '2025-11-02 08:48:06', NULL),
(27, '9520320', 'Kỹ thuật môi trường / Khoa học và công nghệ môi trường - TS', 4.0, 'Import auto', 11, '2025-11-02 08:33:58', '2025-11-02 08:48:10', NULL),
(28, '9440301', 'Quản lý môi trường - TS', 4.0, 'Import auto', 12, '2025-11-02 08:33:58', '2025-11-02 08:48:12', NULL),
(29, '9580203', 'Kỹ thuật xây dựng công trình DD&CN - TS', 4.0, 'Import auto', 13, '2025-11-02 08:33:58', '2025-11-02 08:48:13', NULL),
(30, '9580201', 'Kỹ thuật xây dựng - TS', 4.0, 'Import auto', 14, '2025-11-02 08:33:58', '2025-11-02 08:48:16', NULL),
(31, '9580202', 'Kỹ thuật xây dựng công trình thuỷ - TS', 4.0, 'Import auto', 15, '2025-11-02 08:33:58', '2025-11-02 08:48:18', NULL),
(32, '9520182', 'Khoa học hàng hải / Kỹ thuật hàng hải - TS', 2.0, 'Import auto', NULL, '2025-11-02 08:33:58', '2025-11-02 08:48:20', NULL),
(33, '9340111', 'Logistics quốc tế - TS', 4.0, 'Import auto', 16, '2025-11-02 08:33:58', '2025-11-02 08:48:24', NULL),
(34, '9380111', 'Luật hàng hải - TS', 4.0, 'Import auto', 17, '2025-11-02 08:33:58', '2025-11-02 08:48:25', NULL),
(35, '9520184', 'Bảo đảm an toàn hàng hải - TS', 4.0, 'Import auto', 18, '2025-11-02 08:33:58', '2025-11-02 08:48:28', NULL),
(36, '9380107', 'Luật - TS', 4.0, 'Import auto', NULL, '2025-11-02 08:33:58', '2025-11-02 08:52:34', NULL),
(37, '9520123', 'Kỹ thuật tàu thủy và công trình ngoài khơi - TS', 4.0, 'Import auto', NULL, '2025-11-02 08:33:58', '2025-11-02 08:52:39', NULL),
(38, '9310103', 'Kinh tế học (Toán kinh tế) - TS', 4.0, 'Import auto', NULL, '2025-11-02 08:33:58', '2025-11-02 08:52:43', NULL),
(39, '9440111', 'Vật lý - TS', 4.0, 'Import auto', NULL, '2025-11-02 08:33:58', '2025-11-02 08:52:46', NULL),
(40, '9440302', 'Quản lý tài nguyên và môi trường - TS', 4.0, 'Import auto', NULL, '2025-11-02 08:33:58', '2025-11-02 08:52:50', NULL),
(41, '9480101', 'Khoa học máy tính - TS', 4.0, 'Import auto', 4, '2025-11-02 08:33:58', '2025-11-02 08:48:50', NULL),
(42, '9520302', 'Kỹ thuật vật liệu - TS', 4.0, 'Import auto', NULL, '2025-11-02 08:33:58', '2025-11-02 08:52:58', NULL),
(43, '9520215', 'Kỹ thuật điện - điều khiển - TS', 4.0, 'Import auto', 9, '2025-11-02 08:33:58', '2025-11-02 08:49:04', NULL),
(44, '9520214', 'Viễn thông, xử lý tín hiệu - TS', 4.0, 'Import auto', 9, '2025-11-02 08:33:58', '2025-11-02 08:49:08', NULL),
(45, '9340101', 'Quản trị kinh doanh - TS', 4.0, 'Import auto', NULL, '2025-11-02 08:33:58', '2025-11-02 08:53:05', NULL),
(46, '9340201', 'Tài chính - TS', 4.0, 'Import auto', NULL, '2025-11-02 08:33:58', '2025-11-02 08:53:08', NULL),
(47, '9340202', 'Tài chính - Ngân hàng - TS', 4.0, 'Import auto', NULL, '2025-11-02 08:33:58', '2025-11-02 08:53:10', NULL),
(48, '9340408', 'Quản trị nhân lực - TS', 4.0, 'Import auto', NULL, '2025-11-02 08:33:58', '2025-11-02 08:53:14', NULL),
(49, '9340411', 'Quản trị logistics - TS', 4.0, 'Import auto', 16, '2025-11-02 08:33:58', '2025-11-02 08:49:17', NULL),
(50, '9340412', 'Tổ chức và quản lý vận tải - TS', 4.0, 'Import auto', 16, '2025-11-02 08:33:58', '2025-11-02 08:49:19', NULL),
(51, '9520218', 'Tự động hóa và điều khiển các quá trình công nghệ - TS', 4.0, 'Import auto', 10, '2025-11-02 08:33:58', '2025-11-02 08:49:24', NULL),
(52, '9520119', 'Thiết bị năng lượng tàu thủy - TS', 4.0, 'Import auto', 5, '2025-11-02 08:33:58', '2025-11-02 08:49:26', NULL),
(53, '9520120', 'Thiết kế và kết cấu tàu thủy - TS', 4.0, 'Import auto', 5, '2025-11-02 08:33:58', '2025-11-02 08:49:28', NULL),
(54, '9520303', 'Vật liệu công trình - TS', 4.0, 'Import auto', NULL, '2025-11-02 08:33:58', '2025-11-02 08:53:23', NULL),
(55, '9520304', 'Vật lý kỹ thuật - TS', 4.0, 'Import auto', NULL, '2025-11-02 08:33:58', '2025-11-02 08:53:26', NULL),
(56, '9520503', 'Kỹ thuật trắc địa - bản đồ - TS', 4.0, 'Import auto', NULL, '2025-11-02 08:33:58', '2025-11-02 08:53:29', NULL),
(57, '9310901', 'Triết học - TS', 4.0, 'Import auto', NULL, '2025-11-02 08:33:58', '2025-11-02 08:53:32', NULL),
(58, '9140111', 'Giảng dạy tiếng Anh - TS', 4.0, 'Import auto', NULL, '2025-11-02 08:33:58', '2025-11-02 08:53:35', NULL);

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `majors`
--
ALTER TABLE `majors`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `maNganh` (`maNganh`),
  ADD KEY `idx_parent` (`parent_id`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `majors`
--
ALTER TABLE `majors`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=60;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `majors`
--
ALTER TABLE `majors`
  ADD CONSTRAINT `fk_major_parent` FOREIGN KEY (`parent_id`) REFERENCES `majors` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
