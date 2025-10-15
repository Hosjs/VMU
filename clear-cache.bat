@echo off
cd C:\xampp\htdocs\gara\backend
php artisan route:clear
php artisan cache:clear
php artisan config:clear
echo Cache cleared successfully!
pause

