#!/bin/bash
# =============================================================
# Upload Backend Laravel lên cPanel qua SFTP/SCP
# Chạy từ máy LOCAL
# Yêu cầu: rsync, ssh access vào cPanel hosting
# =============================================================

set -e

# ---- Thay đổi thông tin này cho phù hợp ----
CPANEL_HOST="103.18.6.88"
CPANEL_USER="sdtvimaru"       # SSH username cPanel (thường = cPanel username)
CPANEL_PORT="21098"           # cPanel SSH port thường là 21098 hoặc 22
BACKEND_SRC="$(dirname "$0")/../backend/"
REMOTE_DIR="/home/${CPANEL_USER}/laravel_backend"
# --------------------------------------------

echo "=============================="
echo " Upload backend lên cPanel..."
echo "=============================="

rsync -avz --progress \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='.env' \
  --exclude='storage/logs/*.log' \
  --exclude='storage/framework/cache/*' \
  --exclude='storage/framework/sessions/*' \
  --exclude='storage/framework/views/*' \
  -e "ssh -p ${CPANEL_PORT}" \
  "${BACKEND_SRC}" \
  "${CPANEL_USER}@${CPANEL_HOST}:${REMOTE_DIR}/"

echo ""
echo "✅ Upload backend hoàn tất!"
echo "   Tiếp theo: Chạy 03_setup_backend_on_server.sh"

