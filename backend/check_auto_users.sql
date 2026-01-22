-- =====================================================
-- SQL Script để kiểm tra tính năng tự động tạo user
-- =====================================================

-- 1. Kiểm tra users được tạo từ hệ thống
SELECT
    id,
    name,
    email,
    position,
    role_id,
    lecturer_id,
    is_active,
    notes,
    created_at
FROM users
WHERE notes LIKE '%Tài khoản tự động tạo%'
ORDER BY created_at DESC
LIMIT 10;

-- 2. Kiểm tra giảng viên có user account
SELECT
    l.id AS lecturer_id,
    l.hoTen AS lecturer_name,
    u.id AS user_id,
    u.email AS user_email,
    u.position,
    u.role_id
FROM lecturers l
LEFT JOIN users u ON u.lecturer_id = l.id
WHERE u.notes LIKE '%Tài khoản tự động tạo%'
ORDER BY l.created_at DESC
LIMIT 10;

-- 3. Kiểm tra học sinh có email match với user
SELECT
    s.maHV,
    s.hoDem,
    s.ten,
    s.email AS student_email,
    u.id AS user_id,
    u.email AS user_email,
    u.position,
    u.role_id
FROM students s
LEFT JOIN users u ON u.email = s.email
WHERE u.notes LIKE '%Tài khoản tự động tạo%'
ORDER BY s.created_at DESC
LIMIT 10;

-- 4. Thống kê users theo role
SELECT
    r.id AS role_id,
    r.display_name AS role_name,
    COUNT(u.id) AS user_count,
    COUNT(CASE WHEN u.notes LIKE '%Tài khoản tự động tạo%' THEN 1 END) AS auto_created_count
FROM roles r
LEFT JOIN users u ON u.role_id = r.id
WHERE r.id IN (2, 3)  -- Giảng viên và Học sinh
GROUP BY r.id, r.display_name;

-- 5. Kiểm tra user vừa được tạo trong 24h qua
SELECT
    id,
    name,
    email,
    position,
    role_id,
    lecturer_id,
    created_at,
    TIMESTAMPDIFF(HOUR, created_at, NOW()) AS hours_ago
FROM users
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
    AND notes LIKE '%Tài khoản tự động tạo%'
ORDER BY created_at DESC;

-- 6. Test tạo học sinh mới (uncomment để chạy)
-- INSERT INTO students (
--     maHV, hoDem, ten, ngaySinh, gioiTinh, soGiayToTuyThan,
--     dienThoai, email, quocTich, danToc, tonGiao,
--     maTrinhDoDaoTao, maNganh, trangThai, ngayNhapHoc, namVaoTruong,
--     created_at, updated_at
-- ) VALUES (
--     'SQL001', 'Test', 'SQL', '2000-01-01', 'Nam', '999999999',
--     '0909999999', 'test.sql@st.vimaru.edu.vn', 'Việt Nam', 'Kinh', 'Không',
--     'ThacSi', '8310110', 'DangHoc', NOW(), 2026,
--     NOW(), NOW()
-- );

-- 7. Xóa test data (uncomment để chạy)
-- DELETE FROM users WHERE email LIKE '%test%@st.vimaru.edu.vn' AND notes LIKE '%Tài khoản tự động tạo%';
-- DELETE FROM students WHERE maHV LIKE 'TEST%' OR maHV LIKE 'SQL%';
-- DELETE FROM lecturers WHERE hoTen LIKE '%Test%' AND ghiChu LIKE '%Test%';
