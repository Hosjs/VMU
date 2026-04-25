<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class Cors
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Handle preflight OPTIONS request
        if ($request->isMethod('OPTIONS')) {
            return response()->json(['status' => 'ok'], 200)
                ->header('Access-Control-Allow-Origin', $this->getAllowedOrigin($request))
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-CSRF-TOKEN')
                ->header('Access-Control-Allow-Credentials', 'true')
                ->header('Access-Control-Max-Age', '86400'); // Cache preflight for 24 hours
        }

        // Process the request
        $response = $next($request);

        // Add CORS headers to response
        return $response
            ->header('Access-Control-Allow-Origin', $this->getAllowedOrigin($request))
            ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
            ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-CSRF-TOKEN')
            ->header('Access-Control-Allow-Credentials', 'true')
            ->header('Access-Control-Expose-Headers', 'Authorization, Content-Type');
    }

    /**
     * Get the allowed origin based on the request
     *
     * @param Request $request
     * @return string
     */
    protected function getAllowedOrigin(Request $request): string
    {
        // Get the origin from the request
        $origin = $request->headers->get('Origin');

        // Define allowed origins
        $allowedOrigins = [
            'http://localhost:5173', // Vite default dev server
            'http://localhost:3000', // Alternative React dev server
            'http://localhost:4173', // Vite preview server
            'http://localhost',
            'http://127.0.0.1:5173',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:4173',
            'http://127.0.0.1',
            'https://www.sdtvimaru.com',
            'https://sdtvimaru.com',
        ];

        // Use config() so values are correct even when config is cached (php artisan config:cache)
        if ($productionUrl = config('app.frontend_url')) {
            if (!in_array($productionUrl, $allowedOrigins)) {
                $allowedOrigins[] = $productionUrl;
            }
        }

        if ($appUrl = config('app.url')) {
            if (!in_array($appUrl, $allowedOrigins)) {
                $allowedOrigins[] = $appUrl;
            }
        }

        // Check if the origin is allowed
        if ($origin && in_array($origin, $allowedOrigins)) {
            return $origin;
        }

        // For development, allow localhost origins, local network IPs, and Cloudflare tunnels
        if ($origin && (
            str_starts_with($origin, 'http://localhost') ||
            str_starts_with($origin, 'http://127.0.0.1') ||
            str_starts_with($origin, 'http://192.168.') ||
            str_starts_with($origin, 'http://10.') ||
            str_starts_with($origin, 'http://172.') ||
            str_starts_with($origin, 'https://') && str_contains($origin, '.trycloudflare.com')
        )) {
            return $origin;
        }

        // Default: allow all origins in development/local mode
        if (app()->environment('development', 'local')) {
            return $origin ?: '*';
        }

        // For production: return the first matching https:// origin
        foreach ($allowedOrigins as $allowed) {
            if (str_starts_with($allowed, 'https://')) {
                return $allowed;
            }
        }

        return $allowedOrigins[0];
    }
}
