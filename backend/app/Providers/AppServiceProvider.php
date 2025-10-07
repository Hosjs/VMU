<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Laravel\Passport\Passport;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Cấu hình Passport
        Passport::tokensExpireIn(now()->addDays(config('passport.token_expiration', 15)));
        Passport::refreshTokensExpireIn(now()->addDays(config('passport.refresh_token_expiration', 30)));
        Passport::personalAccessTokensExpireIn(now()->addDays(config('passport.personal_access_token_expiration', 365)));

        // Đăng ký các routes cho Passport (optional - nếu muốn tùy chỉnh)
        // Passport::ignoreRoutes();
    }
}
