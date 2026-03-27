#!/bin/bash
# =============================================================
# Build Frontend (React Router v7) thành static files
# Chạy từ máy LOCAL trước khi upload lên cPanel
# =============================================================

set -e

echo "=============================="
echo " Build Frontend cho production"
echo "=============================="

cd "$(dirname "$0")/../frontend"

echo "▶ Cài dependencies..."
npm install

echo "▶ Build production (SSR=off, static SPA)..."
npm run build

echo ""
echo "✅ Build hoàn tất!"
echo "   Upload nội dung thư mục: frontend/build/client/"
echo "   Lên: public_html/ (domain chính sdtvimaru.com)"
echo ""
echo "⚠️  Lưu ý: File .htaccess trong public/ sẽ được copy vào build/client/"
echo "   tự động. Nếu không, hãy copy thủ công."

