<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Fix classes.major_id: Convert from string (maNganh) to unsignedBigInteger (majors.id)
     */
    public function up(): void
    {
        echo "🔧 Fixing classes.major_id column...\n";

        // Step 1: Drop existing foreign key constraint
        Schema::table('classes', function (Blueprint $table) {
            $table->dropForeign('lop_manganhhoc_foreign');
        });
        echo "✅ Dropped old foreign key\n";

        // Step 2: Add temporary column to store mapped IDs
        Schema::table('classes', function (Blueprint $table) {
            $table->unsignedBigInteger('major_id_temp')->nullable()->after('major_id');
        });
        echo "✅ Added temporary column\n";

        // Step 3: Map maNganh to majors.id and update temp column
        $classes = DB::table('classes')->whereNotNull('major_id')->get();
        $updated = 0;

        foreach ($classes as $class) {
            $major = DB::table('majors')
                ->where('maNganh', $class->major_id)
                ->first();

            if ($major) {
                DB::table('classes')
                    ->where('id', $class->id)
                    ->update(['major_id_temp' => $major->id]);
                $updated++;
            } else {
                echo "⚠️  Warning: Class {$class->id} has invalid major_id: {$class->major_id}\n";
            }
        }
        echo "✅ Mapped {$updated} classes to new major_id\n";

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

        // Step 6: Add new foreign key constraint
        Schema::table('classes', function (Blueprint $table) {
            $table->foreign('major_id', 'lop_major_id_foreign')
                ->references('id')
                ->on('majors')
                ->onDelete('restrict');
        });
        echo "✅ Added new foreign key constraint\n";

        echo "🎉 Successfully fixed classes.major_id column!\n";
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        echo "⏮️  Rolling back classes.major_id fix...\n";

        // Drop new foreign key
        Schema::table('classes', function (Blueprint $table) {
            $table->dropForeign('lop_major_id_foreign');
        });

        // Add temp column for reverse mapping
        Schema::table('classes', function (Blueprint $table) {
            $table->string('major_id_temp', 10)->nullable()->after('major_id');
        });

        // Map back to maNganh
        $classes = DB::table('classes')->whereNotNull('major_id')->get();
        foreach ($classes as $class) {
            $major = DB::table('majors')->where('id', $class->major_id)->first();
            if ($major) {
                DB::table('classes')
                    ->where('id', $class->id)
                    ->update(['major_id_temp' => $major->maNganh]);
            }
        }

        // Drop new column and rename temp back
        Schema::table('classes', function (Blueprint $table) {
            $table->dropColumn('major_id');
        });

        Schema::table('classes', function (Blueprint $table) {
            $table->renameColumn('major_id_temp', 'major_id');
        });

        // Add back old foreign key
        Schema::table('classes', function (Blueprint $table) {
            $table->foreign('major_id', 'lop_manganhhoc_foreign')
                ->references('maNganh')
                ->on('majors')
                ->onDelete('restrict');
        });

        echo "✅ Rolled back to old structure\n";
    }
};
