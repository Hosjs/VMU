
<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "🔄 Updating existing sessions with class_id...\n\n";

$sessions = App\Models\TeachingSession::with('teachingAssignment')->get();
$updated = 0;

foreach ($sessions as $session) {
    if ($session->teachingAssignment && $session->teachingAssignment->class_id) {
        $session->update(['class_id' => $session->teachingAssignment->class_id]);
        echo "✅ Session #{$session->id} → class_id: {$session->teachingAssignment->class_id}\n";
        $updated++;
    }
}

echo "\n✅ Total updated: $updated sessions\n";
