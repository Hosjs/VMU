#!/bin/bash

# Script test nhanh chức năng tự động tạo user
# Chạy script này để test API

API_URL="http://localhost/api"
TOKEN="your_auth_token_here"  # Thay bằng token thật

echo "=========================================="
echo "🧪 TEST TẠO HỌC SINH TỰ ĐỘNG"
echo "=========================================="

# Test 1: Tạo học sinh mới
echo ""
echo "📝 Test 1: Tạo học sinh mới"
echo "Gửi POST request..."

curl -X POST "${API_URL}/students" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "maHV": "TEST001",
    "hoDem": "Nguyễn Văn",
    "ten": "Test",
    "ngaySinh": "2000-01-01",
    "gioiTinh": "Nam",
    "soGiayToTuyThan": "123456789",
    "dienThoai": "0901234567",
    "email": "nguyen.van.test@st.vimaru.edu.vn",
    "quocTich": "Việt Nam",
    "danToc": "Kinh",
    "tonGiao": "Không",
    "maTrinhDoDaoTao": "ThacSi",
    "maNganh": "8310110",
    "trangThai": "DangHoc",
    "ngayNhapHoc": "2026-01-21",
    "namVaoTruong": 2026
  }'

echo ""
echo ""
echo "=========================================="
echo "✅ Kiểm tra kết quả:"
echo "=========================================="
echo "1. Kiểm tra bảng students có thêm học sinh TEST001"
echo "2. Kiểm tra bảng users có tạo user mới:"
echo "   - Email: nguyen.van.test@st.vimaru.edu.vn"
echo "   - Name: Nguyễn Văn Test"
echo "   - Position: Học sinh"
echo "   - Role ID: 3"
echo "3. Thử login với:"
echo "   - Email: nguyen.van.test@st.vimaru.edu.vn"
echo "   - Password: password"
echo ""

# Test 2: Tạo giảng viên mới
echo "=========================================="
echo "📝 Test 2: Tạo giảng viên mới"
echo "=========================================="
echo "Gửi POST request..."

curl -X POST "${API_URL}/lecturers" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "hoTen": "Trần Thị Giảng Viên",
    "trinhDoChuyenMon": "TS",
    "hocHam": "PGS",
    "maNganh": 1,
    "ghiChu": "Test tự động"
  }'

echo ""
echo ""
echo "=========================================="
echo "✅ Kiểm tra kết quả:"
echo "=========================================="
echo "1. Kiểm tra bảng lecturers có thêm giảng viên mới"
echo "2. Kiểm tra bảng users có tạo user mới:"
echo "   - Email: tran.thi.giang.vien@st.vimaru.edu.vn"
echo "   - Name: Trần Thị Giảng Viên"
echo "   - Position: Giáo viên"
echo "   - Role ID: 2"
echo "   - Lecturer ID: (ID của giảng viên vừa tạo)"
echo "3. Thử login với:"
echo "   - Email: tran.thi.giang.vien@st.vimaru.edu.vn"
echo "   - Password: password"
echo ""
