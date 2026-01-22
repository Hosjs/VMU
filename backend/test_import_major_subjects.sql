-- Quick test import for major_subjects
-- Import này để test nhanh, sau đó import file đầy đủ

SET FOREIGN_KEY_CHECKS=0;
TRUNCATE TABLE major_subjects;
SET FOREIGN_KEY_CHECKS=1;

-- Insert 20 records test cho major_id = 4 (Công nghệ thông tin)
INSERT INTO `major_subjects` (`id`, `major_id`, `subject_id`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 4, 4, '2025-11-16 23:35:20', '2025-11-16 23:35:20', NULL),
(2, 4, 5, '2025-11-16 23:35:20', '2025-11-16 23:35:20', NULL),
(3, 4, 6, '2025-11-16 23:35:20', '2025-11-16 23:35:20', NULL),
(4, 4, 7, '2025-11-16 23:35:20', '2025-11-16 23:35:20', NULL),
(5, 4, 8, '2025-11-16 23:35:20', '2025-11-16 23:35:20', NULL),
(6, 4, 9, '2025-11-16 23:35:20', '2025-11-16 23:35:20', NULL),
(7, 4, 10, '2025-11-16 23:35:20', '2025-11-16 23:35:20', NULL),
(8, 4, 11, '2025-11-16 23:35:20', '2025-11-16 23:35:20', NULL),
(9, 4, 12, '2025-11-16 23:35:20', '2025-11-16 23:35:20', NULL),
(10, 4, 13, '2025-11-16 23:35:20', '2025-11-16 23:35:20', NULL),
(11, 4, 14, '2025-11-16 23:35:20', '2025-11-16 23:35:20', NULL),
(12, 4, 15, '2025-11-16 23:35:20', '2025-11-16 23:35:20', NULL),
(13, 4, 16, '2025-11-16 23:35:20', '2025-11-16 23:35:20', NULL),
(14, 4, 17, '2025-11-16 23:35:20', '2025-11-16 23:35:20', NULL),
(15, 4, 18, '2025-11-16 23:35:20', '2025-11-16 23:35:20', NULL),
(16, 4, 19, '2025-11-16 23:35:20', '2025-11-16 23:35:20', NULL),
(17, 4, 20, '2025-11-16 23:35:20', '2025-11-16 23:35:20', NULL);

-- Verify
SELECT COUNT(*) as test_count FROM major_subjects;
SELECT
    ms.id,
    m.tenNganh,
    s.tenMon
FROM major_subjects ms
JOIN majors m ON ms.major_id = m.id
JOIN subjects s ON ms.subject_id = s.id
LIMIT 5;
