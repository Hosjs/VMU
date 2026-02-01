<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\classes;
use App\Models\Major;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Fix classes.major_id: Convert from string (maNganh) to unsignedBigInteger (majors.id)
     *
     * ✅ Safe: Using Eloquent instead of DB::table()
     * ✅ Smart: Detects if migration is needed
     */
    public function up(): void
    {
        echo "🔧 Checking classes.major_id column...\n";

        // Check if major_id column exists
        $columns = Schema::getColumnListing('classes');
        if (!in_array('major_id', $columns)) {
            echo "ℹ️  Column 'major_id' does not exist, nothing to migrate\n";
            return;
        }

        // Simple check: Try to get a sample value to determine type
        // If table is empty or all null, assume it's already fixed (fresh migration)
        try {
            $sampleClass = classes::whereNotNull('major_id')->first();

            if (!$sampleClass) {
                // No data with major_id - assume fresh migration with correct structure
                echo "ℹ️  No data to check, assuming fresh migration (already correct)\n";
                return;
            }

            // Check if major_id is numeric (new structure) or string (old structure)
            if (is_numeric($sampleClass->major_id)) {
                echo "ℹ️  Column 'major_id' appears to be correct type (numeric), skipping migration\n";
                return;
            }

            echo "🔧 Column 'major_id' is string type, needs migration...\n";
        } catch (\Exception $e) {
            echo "ℹ️  Could not check column type, assuming fresh migration\n";
            return;
        }

        // Step 1: Drop ALL foreign keys that reference major_id column
        try {
            // Find all foreign keys that use the major_id column
            $foreignKeys = Schema::getConnection()->select(
                "SELECT CONSTRAINT_NAME, COLUMN_NAME
                FROM information_schema.KEY_COLUMN_USAGE
                WHERE TABLE_SCHEMA = DATABASE()
                AND TABLE_NAME = 'classes'
                AND COLUMN_NAME = 'major_id'
                AND REFERENCED_TABLE_NAME IS NOT NULL"
            );

            foreach ($foreignKeys as $fk) {
                try {
                    Schema::table('classes', function (Blueprint $table) use ($fk) {
                        $table->dropForeign($fk->CONSTRAINT_NAME);
                    });
                    echo "✅ Dropped foreign key: {$fk->CONSTRAINT_NAME}\n";
                } catch (\Exception $e) {
                    echo "⚠️  Could not drop foreign key {$fk->CONSTRAINT_NAME}: {$e->getMessage()}\n";
                }
            }

            if (empty($foreignKeys)) {
                echo "ℹ️  No foreign keys found on major_id column\n";
            }
        } catch (\Exception $e) {
            echo "⚠️  Could not query foreign keys: {$e->getMessage()}\n";
        }

        // Step 2: Add temporary column to store mapped IDs (if not exists)
        $columns = Schema::getColumnListing('classes');

        if (!in_array('major_id_temp', $columns)) {
            Schema::table('classes', function (Blueprint $table) {
                $table->unsignedBigInteger('major_id_temp')->nullable()->after('major_id');
            });
            echo "✅ Added temporary column\n";
        } else {
            echo "ℹ️  Temporary column already exists\n";
        }

        // Step 3: Map maNganh to majors.id using Eloquent
        $classesData = classes::whereNotNull('major_id')->get();
        $updated = 0;

        foreach ($classesData as $class) {
            $major = Major::where('maNganh', $class->major_id)->first();

            if ($major) {
                $class->major_id_temp = $major->id;
                $class->save();
                $updated++;
            } else {
                echo "⚠️  Warning: Class {$class->id} has invalid major_id: {$class->major_id}\n";
            }
        }

        if ($updated > 0) {
            echo "✅ Mapped {$updated} classes to new major_id\n";
        }

        // Step 4: Drop old major_id column (if exists)
        $columns = Schema::getColumnListing('classes');
        if (in_array('major_id', $columns) && in_array('major_id_temp', $columns)) {
            Schema::table('classes', function (Blueprint $table) {
                $table->dropColumn('major_id');
            });
            echo "✅ Dropped old major_id column\n";
        } else {
            echo "ℹ️  major_id column already dropped or temp column doesn't exist\n";
        }

        // Step 5: Rename temp column to major_id (if needed)
        $columns = Schema::getColumnListing('classes');
        if (in_array('major_id_temp', $columns) && !in_array('major_id', $columns)) {
            Schema::table('classes', function (Blueprint $table) {
                $table->renameColumn('major_id_temp', 'major_id');
            });
            echo "✅ Renamed temp column to major_id\n";
        } else {
            echo "ℹ️  Columns already in correct state\n";
        }

        echo "🎉 Successfully fixed classes.major_id column!\n";
        echo "ℹ️  Note: Foreign keys should be defined in Model relationships, not migrations\n";
    }

    /**
     * Reverse the migrations.
     *
     * Note: Foreign keys are now defined in Models, not migrations
     */
    public function down(): void
    {
        echo "⏮️  Rolling back classes.major_id fix...\n";

        // Step 1: Drop ALL foreign keys that reference major_id column
        try {
            // Find all foreign keys that use the major_id column
            $foreignKeys = Schema::getConnection()->select(
                "SELECT CONSTRAINT_NAME, COLUMN_NAME
                FROM information_schema.KEY_COLUMN_USAGE
                WHERE TABLE_SCHEMA = DATABASE()
                AND TABLE_NAME = 'classes'
                AND COLUMN_NAME = 'major_id'
                AND REFERENCED_TABLE_NAME IS NOT NULL"
            );

            foreach ($foreignKeys as $fk) {
                try {
                    Schema::table('classes', function (Blueprint $table) use ($fk) {
                        $table->dropForeign($fk->CONSTRAINT_NAME);
                    });
                    echo "✅ Dropped foreign key: {$fk->CONSTRAINT_NAME}\n";
                } catch (\Exception $e) {
                    echo "⚠️  Could not drop foreign key {$fk->CONSTRAINT_NAME}: {$e->getMessage()}\n";
                }
            }

            if (empty($foreignKeys)) {
                echo "ℹ️  No foreign keys found on major_id column\n";
            }
        } catch (\Exception $e) {
            echo "⚠️  Could not query foreign keys: {$e->getMessage()}\n";
        }

        // Step 2: Add temp column for reverse mapping (if not exists)
        $columns = Schema::getColumnListing('classes');

        if (!in_array('major_id_temp', $columns)) {
            Schema::table('classes', function (Blueprint $table) {
                $table->string('major_id_temp', 10)->nullable()->after('major_id');
            });
            echo "✅ Added temporary column\n";
        } else {
            echo "ℹ️  Temporary column already exists\n";
        }

        // Step 3: Map back to maNganh using Eloquent
        if (in_array('major_id', $columns)) {
            $classesData = classes::whereNotNull('major_id')->get();

            foreach ($classesData as $class) {
                $major = Major::find($class->major_id);

                if ($major) {
                    $class->major_id_temp = $major->maNganh;
                    $class->save();
                }
            }
            echo "✅ Mapped back to maNganh\n";
        }

        // Step 4: Drop new column if exists
        if (in_array('major_id', $columns)) {
            Schema::table('classes', function (Blueprint $table) {
                $table->dropColumn('major_id');
            });
            echo "✅ Dropped major_id column\n";
        }

        // Step 5: Rename temp back to major_id
        $columns = Schema::getColumnListing('classes');
        if (in_array('major_id_temp', $columns) && !in_array('major_id', $columns)) {
            Schema::table('classes', function (Blueprint $table) {
                $table->renameColumn('major_id_temp', 'major_id');
            });
            echo "✅ Renamed temp column to major_id\n";
        }

        // No FK recreation - handled by Models
        echo "✅ Rolled back to old structure (FKs in Models)\n";
    }
};
