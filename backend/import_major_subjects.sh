#!/bin/bash

# Script to import major_subjects data from SQL file

echo "🔄 Importing major_subjects data..."

# Truncate existing data
mysql -u root vmu -e "SET FOREIGN_KEY_CHECKS=0; TRUNCATE TABLE major_subjects; SET FOREIGN_KEY_CHECKS=1;"

# Import from SQL file
mysql -u root vmu < /Applications/XAMPP/xamppfiles/htdocs/VMU/frontend/app/routes/sql/major_subjects.sql

# Check count
COUNT=$(mysql -u root vmu -se "SELECT COUNT(*) FROM major_subjects;")

echo "✅ Done! Total records: $COUNT"
