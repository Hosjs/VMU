<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    // D4 — External student API (hệ thống SĐH ngoài). Cấu hình qua .env.
    'external_student' => [
        'source'    => env('EXTERNAL_STUDENT_SOURCE', 'vmu_sdh'),
        'base_url'  => env('EXTERNAL_STUDENT_API_URL'),
        'token'     => env('EXTERNAL_STUDENT_API_TOKEN'),
        'timeout'   => (int) env('EXTERNAL_STUDENT_API_TIMEOUT', 30),
    ],

];
