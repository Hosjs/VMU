<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

/*
 * Cấu trúc cPanel:
 *   public_html/api/index.php       ← file này
 *   laravel_backend/                ← code Laravel (../../laravel_backend)
 */
$laravelPath = __DIR__ . '/../../laravel_backend';

// Maintenance mode
if (file_exists($maintenance = $laravelPath . '/storage/framework/maintenance.php')) {
    require $maintenance;
}

// Composer autoload
require $laravelPath . '/vendor/autoload.php';

// Bootstrap Laravel
$app = require_once $laravelPath . '/bootstrap/app.php';

$app->handleRequest(Request::capture());
