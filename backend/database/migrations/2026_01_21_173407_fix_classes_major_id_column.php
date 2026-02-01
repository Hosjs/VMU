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

        // Step 1: Drop existing foreign keys if they exist
        try {
            $foreignKeys = Schema::getConnection()->select(
                "SELECT CONSTRAINT_NAME
                FROM information_schema.TABLE_CONSTRAINTS
                WHERE TABLE_SCHEMA = DATABASE()
                AND TABLE_NAME = 'classes'
                AND CONSTRAINT_TYPE = 'FOREIGN KEY'
                AND CONSTRAINT_NAME IN ('lop_manganhhoc_foreign', 'lop_major_id_foreign')"
            );

            foreach ($foreignKeys as $fk) {
                Schema::table('classes', function (Blueprint $table) use ($fk) {
                    $table->dropForeign($fk->CONSTRAINT_NAME);
                });
                echo "✅ Dropped foreign key: {$fk->CONSTRAINT_NAME}\n";
            }
        } catch (\Exception $e) {
            echo "⚠️  Could not drop foreign keys: {$e->getMessage()}\n";
        }

        // Step 2: Add temporary column to store mapped IDs
        Schema::table('classes', function (Blueprint $table) {
            $table->unsignedBigInteger('major_id_temp')->nullable()->after('major_id');
        });
        echo "✅ Added temporary column\n";

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

        // Step 4: Drop old major_id column
        Schema::table('classes', function (Blueprint $table) {
            $table->dropColumn('major_id');
        });
        echo "✅ Dropped old major_id column\n";

        // Step 5: Rename temp column to major_id
        Schema::table('classes', function (Blueprint $table) {
            $table->renameColumn('major_id_temp', 'major_id');
        });
        echo "✅ Renamed temp column to major_id\n";

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

        // No need to drop FK - they're defined in Models now

        // Add temp column for reverse mapping
        Schema::table('classes', function (Blueprint $table) {
            $table->string('major_id_temp', 10)->nullable()->after('major_id');
        });

        // Map back to maNganh using Eloquent
        $classesData = classes::whereNotNull('major_id')->get();

        foreach ($classesData as $class) {
            $major = Major::find($class->major_id);

            if ($major) {
                $class->major_id_temp = $major->maNganh;
                $class->save();
            }
        }

        // Drop new column and rename temp back
        Schema::table('classes', function (Blueprint $table) {
            $table->dropColumn('major_id');
        });

        Schema::table('classes', function (Blueprint $table) {
            $table->renameColumn('major_id_temp', 'major_id');
        });

        // No FK recreation - handled by Models
        echo "✅ Rolled back to old structure (FKs in Models)\n";
    }
};
