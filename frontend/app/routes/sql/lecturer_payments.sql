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
-- Cấu trúc bảng cho bảng `lecturer_payments`
--

CREATE TABLE `lecturer_payments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `lecturer_id` bigint(20) UNSIGNED NOT NULL,
  `teaching_assignment_id` bigint(20) UNSIGNED DEFAULT NULL,
  `lop_id` bigint(20) UNSIGNED DEFAULT NULL COMMENT 'ID lớp',
  `semester_code` varchar(50) NOT NULL COMMENT 'Mã học kỳ: VD QLVT 2024.1.2',
  `subject_code` varchar(50) DEFAULT NULL COMMENT 'Mã học phần',
  `subject_name` varchar(255) NOT NULL COMMENT 'Tên môn học',
  `education_level` varchar(50) DEFAULT NULL COMMENT 'Trình độ: VCB, TC...',
  `credits` int(11) NOT NULL DEFAULT 0 COMMENT 'Số tín chỉ',
  `class_name` varchar(100) DEFAULT NULL COMMENT 'Tên lớp',
  `student_count` int(11) NOT NULL DEFAULT 0 COMMENT 'Số học viên',
  `start_date` date NOT NULL COMMENT 'Từ ngày',
  `end_date` date NOT NULL COMMENT 'Đến ngày',
  `completion_date` date DEFAULT NULL COMMENT 'Ngày hết hạn',
  `teaching_hours_start` decimal(8,2) NOT NULL DEFAULT 0.00 COMMENT 'Lý thuyết - Đơn giá đầu kỳ (giờ)',
  `teaching_hours_end` decimal(8,2) NOT NULL DEFAULT 0.00 COMMENT 'Lý thuyết - Đơn giá cuối kỳ (giờ)',
  `practical_hours` decimal(8,2) NOT NULL DEFAULT 0.00 COMMENT 'Thực hành (giờ)',
  `theory_sessions` int(11) NOT NULL DEFAULT 0 COMMENT 'Số lượng lượt học - Lý thuyết',
  `practical_sessions` int(11) NOT NULL DEFAULT 0 COMMENT 'Số lượng lượt học - Thực hành',
  `total_sessions` int(11) NOT NULL DEFAULT 0 COMMENT 'Tổng số lượng lượt học',
  `hourly_rate` decimal(15,2) NOT NULL DEFAULT 0.00 COMMENT 'Đơn giá/giờ (VND)',
  `total_amount` decimal(15,2) NOT NULL DEFAULT 0.00 COMMENT 'Thành tiền (VND)',
  `insurance_rate` decimal(5,2) NOT NULL DEFAULT 0.00 COMMENT 'Tỉ lệ bảo hiểm (%)',
  `insurance_amount` decimal(15,2) NOT NULL DEFAULT 0.00 COMMENT 'Số tiền bảo hiểm (VND)',
  `net_amount` decimal(15,2) NOT NULL DEFAULT 0.00 COMMENT 'Thực nhận (VND)',
  `payment_status` enum('pending','approved','paid','rejected') NOT NULL DEFAULT 'pending' COMMENT 'Trạng thái thanh toán',
  `payment_date` date DEFAULT NULL COMMENT 'Ngày thanh toán',
  `payment_method` varchar(100) DEFAULT NULL COMMENT 'Phương thức thanh toán',
  `bank_account` varchar(100) DEFAULT NULL COMMENT 'Số tài khoản',
  `bank_name` varchar(255) DEFAULT NULL COMMENT 'Tên ngân hàng',
  `notes` text DEFAULT NULL COMMENT 'Ghi chú',
  `rejection_reason` text DEFAULT NULL COMMENT 'Lý do từ chối',
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `updated_by` bigint(20) UNSIGNED DEFAULT NULL,
  `approved_by` bigint(20) UNSIGNED DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `lecturer_payments`
--

INSERT INTO `lecturer_payments` (`id`, `lecturer_id`, `teaching_assignment_id`, `lop_id`, `semester_code`, `subject_code`, `subject_name`, `education_level`, `credits`, `class_name`, `student_count`, `start_date`, `end_date`, `completion_date`, `teaching_hours_start`, `teaching_hours_end`, `practical_hours`, `theory_sessions`, `practical_sessions`, `total_sessions`, `hourly_rate`, `total_amount`, `insurance_rate`, `insurance_amount`, `net_amount`, `payment_status`, `payment_date`, `payment_method`, `bank_account`, `bank_name`, `notes`, `rejection_reason`, `created_by`, `updated_by`, `approved_by`, `approved_at`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 351, NULL, NULL, '2025.2', '529 ITHC', 'Tương tác người- máy nâng cao', 'Ths', 2, 'TTNM01', 0, '2025-12-04', '2026-01-11', '2025-12-19', 95000.00, 95000.00, 0.00, 15, 15, 30, 95000.00, 8550000.00, 10.00, 855000.00, 7695000.00, 'paid', '2025-12-17', 'Chuyển khoản', NULL, NULL, NULL, NULL, 1, 1, 1, '2025-12-16 02:44:06', '2025-12-16 00:30:50', '2025-12-16 19:07:13', NULL);

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `lecturer_payments`
--
ALTER TABLE `lecturer_payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `lecturer_payments_teaching_assignment_id_foreign` (`teaching_assignment_id`),
  ADD KEY `lecturer_payments_lecturer_id_semester_code_payment_status_index` (`lecturer_id`,`semester_code`,`payment_status`),
  ADD KEY `lecturer_payments_payment_status_payment_date_index` (`payment_status`,`payment_date`),
  ADD KEY `lecturer_payments_semester_code_index` (`semester_code`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `lecturer_payments`
--
ALTER TABLE `lecturer_payments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `lecturer_payments`
--
ALTER TABLE `lecturer_payments`
  ADD CONSTRAINT `lecturer_payments_lecturer_id_foreign` FOREIGN KEY (`lecturer_id`) REFERENCES `lecturers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `lecturer_payments_teaching_assignment_id_foreign` FOREIGN KEY (`teaching_assignment_id`) REFERENCES `teaching_assignments` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
