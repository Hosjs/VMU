-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: localhost
-- Thời gian đã tạo: Th10 25, 2025 lúc 04:52 AM
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
-- Cấu trúc bảng cho bảng `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `hoc_vien`
--

CREATE TABLE `hoc_vien` (
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

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `lop`
--

CREATE TABLE `lop` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenLop` varchar(100) NOT NULL,
  `maTrinhDoDaoTao` varchar(10) NOT NULL,
  `maNganhHoc` varchar(10) NOT NULL,
  `khoaHoc` int(11) NOT NULL,
  `idGiaoVienChuNhiem` bigint(20) UNSIGNED DEFAULT NULL,
  `trangThai` enum('DangHoc','DaTotNghiep','GiaiThe') NOT NULL DEFAULT 'DangHoc',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `createdBy` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2025_01_24_000001_create_trinh_do_dao_tao_table', 1),
(5, '2025_01_24_000002_create_nganh_hoc_table', 1),
(6, '2025_01_24_000003_create_lop_table', 1),
(7, '2025_01_25_000001_create_hoc_vien_table', 1),
(8, '2025_10_03_043406_create_roles_table', 1),
(9, '2025_10_03_043417_create_user_roles_table', 1),
(10, '2025_10_18_100000_create_permission_modules_tables', 1),
(11, '2025_10_23_065341_create_oauth_auth_codes_table', 1),
(12, '2025_10_23_065342_create_oauth_access_tokens_table', 1),
(13, '2025_10_23_065343_create_oauth_refresh_tokens_table', 1),
(14, '2025_10_23_065344_create_oauth_clients_table', 1),
(15, '2025_10_23_065345_create_oauth_device_codes_table', 1);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `nganh_hoc`
--

CREATE TABLE `nganh_hoc` (
  `maNganh` varchar(10) NOT NULL,
  `tenNganh` varchar(100) NOT NULL,
  `moTa` varchar(255) DEFAULT NULL,
  `trangThai` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `createdBy` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `nganh_hoc`
--

INSERT INTO `nganh_hoc` (`maNganh`, `tenNganh`, `moTa`, `trangThai`, `created_at`, `updated_at`, `deleted_at`, `createdBy`) VALUES
('8310110', 'Kỹ thuật Điện tử, Truyền thông', 'Ngành đào tạo về điện tử và truyền thông', 1, '2025-10-24 19:36:39', '2025-10-24 19:36:39', NULL, NULL),
('8480101', 'Kinh tế', 'Ngành đào tạo về kinh tế', 1, '2025-10-24 19:36:39', '2025-10-24 19:36:39', NULL, NULL),
('8520101', 'Quản trị kinh doanh', 'Ngành đào tạo về quản trị', 1, '2025-10-24 19:36:39', '2025-10-24 19:36:39', NULL, NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `oauth_access_tokens`
--

CREATE TABLE `oauth_access_tokens` (
  `id` char(80) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `client_id` char(36) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `scopes` text DEFAULT NULL,
  `revoked` tinyint(1) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `expires_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `oauth_access_tokens`
--

INSERT INTO `oauth_access_tokens` (`id`, `user_id`, `client_id`, `name`, `scopes`, `revoked`, `created_at`, `updated_at`, `expires_at`) VALUES
('83a8ee59e4bbc535090f4f8a4bec95f04dc8d82660a77a99937a01455ec1de910ccff5804c335afc', 1, '52fd4317-1239-43ef-a059-9635dc958d6e', 'GarageApp', '[]', 0, '2025-10-24 19:46:00', '2025-10-24 19:46:00', '2026-10-25 02:46:00'),
('94f4d0e073b5d476c6c0c07d227b10980232d0ab321c0a84b986069e13e76103c3ab803d28ae8674', 1, '52fd4317-1239-43ef-a059-9635dc958d6e', 'GarageApp', '[]', 0, '2025-10-24 19:37:08', '2025-10-24 19:37:08', '2026-10-25 02:37:08');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `oauth_auth_codes`
--

CREATE TABLE `oauth_auth_codes` (
  `id` char(80) NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `client_id` char(36) NOT NULL,
  `scopes` text DEFAULT NULL,
  `revoked` tinyint(1) NOT NULL,
  `expires_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `oauth_clients`
--

CREATE TABLE `oauth_clients` (
  `id` char(36) NOT NULL,
  `owner_type` varchar(255) DEFAULT NULL,
  `owner_id` bigint(20) UNSIGNED DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `secret` varchar(255) DEFAULT NULL,
  `provider` varchar(255) DEFAULT NULL,
  `redirect_uris` text NOT NULL,
  `grant_types` text NOT NULL,
  `revoked` tinyint(1) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `oauth_clients`
--

INSERT INTO `oauth_clients` (`id`, `owner_type`, `owner_id`, `name`, `secret`, `provider`, `redirect_uris`, `grant_types`, `revoked`, `created_at`, `updated_at`) VALUES
('52fd4317-1239-43ef-a059-9635dc958d6e', NULL, NULL, 'GarageApp Personal Access Client', 'AWAVNCTS4y8LkIcNELpXMtGdZV3cWBdeCVmOSVXr', NULL, '[\"http:\\/\\/localhost\"]', '[\"personal_access\"]', 0, '2025-10-24 19:36:39', '2025-10-24 19:36:39'),
('6301e788-2880-4e4f-b69d-05071e7e42bd', NULL, NULL, 'GarageApp Password Grant Client', 'MwfQUn3r1qKyviOoS1706J0j9dcXvtic2yE0JiwA', 'users', '[\"http:\\/\\/localhost\"]', '[\"password\"]', 0, '2025-10-24 19:36:39', '2025-10-24 19:36:39');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `oauth_device_codes`
--

CREATE TABLE `oauth_device_codes` (
  `id` char(80) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `client_id` char(36) NOT NULL,
  `user_code` char(8) NOT NULL,
  `scopes` text NOT NULL,
  `revoked` tinyint(1) NOT NULL,
  `user_approved_at` datetime DEFAULT NULL,
  `last_polled_at` datetime DEFAULT NULL,
  `expires_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `oauth_refresh_tokens`
--

CREATE TABLE `oauth_refresh_tokens` (
  `id` char(80) NOT NULL,
  `access_token_id` char(80) NOT NULL,
  `revoked` tinyint(1) NOT NULL,
  `expires_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `permission_actions`
--

CREATE TABLE `permission_actions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `module_id` bigint(20) UNSIGNED NOT NULL,
  `action` varchar(255) NOT NULL,
  `display_name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `permission_actions`
--

INSERT INTO `permission_actions` (`id`, `module_id`, `action`, `display_name`, `description`, `sort_order`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 1, 'view', 'Xem danh sách học viên', 'Cho phép xem danh sách và thông tin học viên', 0, 1, '2025-10-24 19:36:39', '2025-10-24 19:36:39'),
(2, 1, 'create', 'Thêm học viên', 'Cho phép thêm học viên mới', 0, 1, '2025-10-24 19:36:39', '2025-10-24 19:36:39'),
(3, 1, 'edit', 'Sửa học viên', 'Cho phép chỉnh sửa thông tin học viên', 0, 1, '2025-10-24 19:36:39', '2025-10-24 19:36:39'),
(4, 1, 'delete', 'Xóa học viên', 'Cho phép xóa học viên', 0, 1, '2025-10-24 19:36:39', '2025-10-24 19:36:39'),
(5, 1, 'export', 'Xuất dữ liệu', 'Cho phép xuất danh sách học viên ra Excel/PDF', 0, 1, '2025-10-24 19:36:39', '2025-10-24 19:36:39');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `permission_modules`
--

CREATE TABLE `permission_modules` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `display_name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `permission_modules`
--

INSERT INTO `permission_modules` (`id`, `name`, `display_name`, `description`, `sort_order`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'students', 'Quản lý học viên', 'Quản lý thông tin học viên, hồ sơ, phân lớp', 0, 1, '2025-10-24 19:36:39', '2025-10-24 19:36:39');

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
(1, 'admin', 'Administrator', 'Full system access with all permissions', '{\"users\":[\"view\",\"create\",\"edit\",\"delete\"],\"roles\":[\"view\",\"create\",\"edit\",\"delete\"],\"dashboard\":[\"view\"],\"students\":[\"view\",\"create\",\"edit\",\"delete\",\"export\"],\"classes\":[\"view\",\"create\",\"edit\",\"delete\"],\"teachers\":[\"view\",\"create\",\"edit\",\"delete\"],\"courses\":[\"view\",\"create\",\"edit\",\"delete\"],\"training_levels\":[\"view\",\"create\",\"edit\",\"delete\"],\"majors\":[\"view\",\"create\",\"edit\",\"delete\"],\"classrooms\":[\"view\",\"create\",\"edit\",\"delete\"],\"vehicles\":[\"view\",\"create\",\"edit\",\"delete\"],\"service_requests\":[\"view\",\"create\",\"edit\",\"delete\"],\"orders\":[\"view\",\"create\",\"edit\",\"delete\"],\"reports\":[\"view\",\"export\"],\"settings\":[\"view\",\"edit\"]}', 1, 1, '2025-10-24 19:36:39', '2025-10-24 19:36:39', NULL),
(2, 'manager', 'Manager', 'Management level access', '{\"users\":[\"view\"],\"vehicles\":[\"view\",\"edit\"],\"service_requests\":[\"view\",\"edit\"],\"orders\":[\"view\",\"edit\"],\"reports\":[\"view\",\"export\"]}', 1, 0, '2025-10-24 19:36:39', '2025-10-24 19:36:39', NULL),
(3, 'accountant', 'Accountant', 'Financial and accounting access', '{\"orders\":[\"view\",\"edit\"],\"reports\":[\"view\",\"export\"]}', 1, 0, '2025-10-24 19:36:39', '2025-10-24 19:36:39', NULL),
(4, 'mechanic', 'Mechanic', 'Technical service access', '{\"service_requests\":[\"view\",\"edit\"],\"vehicles\":[\"view\"]}', 1, 0, '2025-10-24 19:36:39', '2025-10-24 19:36:39', NULL),
(5, 'employee', 'Employee', 'Basic employee access', '{\"service_requests\":[\"view\"],\"vehicles\":[\"view\"]}', 1, 0, '2025-10-24 19:36:39', '2025-10-24 19:36:39', NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
('CuNhan', 'Cử nhân', 'Trình độ đại học', 1, '2025-10-24 19:36:39', '2025-10-24 19:36:39', NULL, NULL),
('ThacSi', 'Thạc sỹ', 'Trình độ sau đại học', 1, '2025-10-24 19:36:39', '2025-10-24 19:36:39', NULL, NULL),
('TienSi', 'Tiến sỹ', 'Trình độ nghiên cứu sinh', 1, '2025-10-24 19:36:39', '2025-10-24 19:36:39', NULL, NULL);

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

INSERT INTO `users` (`id`, `name`, `email`, `phone`, `avatar`, `birth_date`, `gender`, `address`, `employee_code`, `position`, `department`, `hire_date`, `salary`, `role_id`, `custom_permissions`, `is_active`, `notes`, `email_verified_at`, `password`, `remember_token`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'System Administrator', 'admin@example.com', '0900000000', NULL, NULL, NULL, NULL, 'ADMIN-001', 'System Administrator', 'Management', '2025-10-25', 30000000.00, 1, NULL, 1, NULL, '2025-10-24 19:36:40', '$2y$12$jCHywdklBpI6fP2uwJ3sZeW2v2hrIwdWr2Yx1oSIG/5LbXxm7MqjK', NULL, '2025-10-24 19:36:40', '2025-10-24 19:36:40', NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `user_roles`
--

CREATE TABLE `user_roles` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `role_id` bigint(20) UNSIGNED NOT NULL,
  `assigned_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `assigned_by` bigint(20) UNSIGNED DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `user_roles`
--

INSERT INTO `user_roles` (`id`, `user_id`, `role_id`, `assigned_at`, `assigned_by`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 1, 1, '2025-10-25 02:36:40', NULL, 1, '2025-10-24 19:36:40', '2025-10-24 19:36:40');

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`);

--
-- Chỉ mục cho bảng `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`);

--
-- Chỉ mục cho bảng `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Chỉ mục cho bảng `hoc_vien`
--
ALTER TABLE `hoc_vien`
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
-- Chỉ mục cho bảng `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Chỉ mục cho bảng `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `lop`
--
ALTER TABLE `lop`
  ADD PRIMARY KEY (`id`),
  ADD KEY `lop_matrinhdodaotao_foreign` (`maTrinhDoDaoTao`),
  ADD KEY `lop_manganhhoc_foreign` (`maNganhHoc`),
  ADD KEY `lop_createdby_foreign` (`createdBy`),
  ADD KEY `lop_khoahoc_index` (`khoaHoc`),
  ADD KEY `lop_trangthai_index` (`trangThai`);

--
-- Chỉ mục cho bảng `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `nganh_hoc`
--
ALTER TABLE `nganh_hoc`
  ADD PRIMARY KEY (`maNganh`),
  ADD KEY `nganh_hoc_createdby_foreign` (`createdBy`);

--
-- Chỉ mục cho bảng `oauth_access_tokens`
--
ALTER TABLE `oauth_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `oauth_access_tokens_user_id_index` (`user_id`);

--
-- Chỉ mục cho bảng `oauth_auth_codes`
--
ALTER TABLE `oauth_auth_codes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `oauth_auth_codes_user_id_index` (`user_id`);

--
-- Chỉ mục cho bảng `oauth_clients`
--
ALTER TABLE `oauth_clients`
  ADD PRIMARY KEY (`id`),
  ADD KEY `oauth_clients_owner_type_owner_id_index` (`owner_type`,`owner_id`);

--
-- Chỉ mục cho bảng `oauth_device_codes`
--
ALTER TABLE `oauth_device_codes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `oauth_device_codes_user_code_unique` (`user_code`),
  ADD KEY `oauth_device_codes_user_id_index` (`user_id`),
  ADD KEY `oauth_device_codes_client_id_index` (`client_id`);

--
-- Chỉ mục cho bảng `oauth_refresh_tokens`
--
ALTER TABLE `oauth_refresh_tokens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `oauth_refresh_tokens_access_token_id_index` (`access_token_id`);

--
-- Chỉ mục cho bảng `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Chỉ mục cho bảng `permission_actions`
--
ALTER TABLE `permission_actions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `permission_actions_module_id_action_unique` (`module_id`,`action`),
  ADD KEY `permission_actions_module_id_is_active_sort_order_index` (`module_id`,`is_active`,`sort_order`);

--
-- Chỉ mục cho bảng `permission_modules`
--
ALTER TABLE `permission_modules`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `permission_modules_name_unique` (`name`),
  ADD KEY `permission_modules_is_active_sort_order_index` (`is_active`,`sort_order`);

--
-- Chỉ mục cho bảng `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `roles_name_unique` (`name`),
  ADD KEY `roles_name_index` (`name`),
  ADD KEY `roles_is_active_index` (`is_active`);

--
-- Chỉ mục cho bảng `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Chỉ mục cho bảng `trinh_do_dao_tao`
--
ALTER TABLE `trinh_do_dao_tao`
  ADD PRIMARY KEY (`maTrinhDoDaoTao`),
  ADD KEY `trinh_do_dao_tao_createdby_foreign` (`createdBy`);

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
  ADD KEY `users_deleted_at_index` (`deleted_at`);

--
-- Chỉ mục cho bảng `user_roles`
--
ALTER TABLE `user_roles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_roles_user_id_is_active_index` (`user_id`,`is_active`),
  ADD KEY `user_roles_role_id_is_active_index` (`role_id`,`is_active`),
  ADD KEY `user_roles_assigned_at_index` (`assigned_at`),
  ADD KEY `user_roles_assigned_by_index` (`assigned_by`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `lop`
--
ALTER TABLE `lop`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT cho bảng `permission_actions`
--
ALTER TABLE `permission_actions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT cho bảng `permission_modules`
--
ALTER TABLE `permission_modules`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `roles`
--
ALTER TABLE `roles`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT cho bảng `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `user_roles`
--
ALTER TABLE `user_roles`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `hoc_vien`
--
ALTER TABLE `hoc_vien`
  ADD CONSTRAINT `hoc_vien_createdby_foreign` FOREIGN KEY (`createdBy`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `hoc_vien_idlop_foreign` FOREIGN KEY (`idLop`) REFERENCES `lop` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `hoc_vien_manganh_foreign` FOREIGN KEY (`maNganh`) REFERENCES `nganh_hoc` (`maNganh`),
  ADD CONSTRAINT `hoc_vien_matrinhdodaotao_foreign` FOREIGN KEY (`maTrinhDoDaoTao`) REFERENCES `trinh_do_dao_tao` (`maTrinhDoDaoTao`);

--
-- Các ràng buộc cho bảng `lop`
--
ALTER TABLE `lop`
  ADD CONSTRAINT `lop_createdby_foreign` FOREIGN KEY (`createdBy`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `lop_manganhhoc_foreign` FOREIGN KEY (`maNganhHoc`) REFERENCES `nganh_hoc` (`maNganh`),
  ADD CONSTRAINT `lop_matrinhdodaotao_foreign` FOREIGN KEY (`maTrinhDoDaoTao`) REFERENCES `trinh_do_dao_tao` (`maTrinhDoDaoTao`);

--
-- Các ràng buộc cho bảng `nganh_hoc`
--
ALTER TABLE `nganh_hoc`
  ADD CONSTRAINT `nganh_hoc_createdby_foreign` FOREIGN KEY (`createdBy`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `trinh_do_dao_tao`
--
ALTER TABLE `trinh_do_dao_tao`
  ADD CONSTRAINT `trinh_do_dao_tao_createdby_foreign` FOREIGN KEY (`createdBy`) REFERENCES `users` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
