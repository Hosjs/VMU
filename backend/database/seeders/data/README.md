# Seeders Data Directory

This directory contains SQL data files for seeders that have large datasets.

## Files:

### lecturers.sql
- Contains 300+ lecturer records
- Used by `LecturersSeeder`
- Auto-imported on first `php artisan db:seed`

## Usage:

The seeder will automatically:
1. Check if file exists here
2. Parse and import all data
3. Skip if lecturers already exist in database

## For Production:

✅ Include this folder when deploying
✅ Files will be read from within Laravel (no external dependencies)
✅ After first import, manage lecturers via admin panel

