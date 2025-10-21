<?php

namespace App\Http\Controllers;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Pagination\LengthAwarePaginator;

abstract class Controller
{
    /**
     * ============================================
     * CHUẨN HÓA RESPONSE FORMAT
     * ============================================
     * Đảm bảo tất cả API trả về format nhất quán
     */

    /**
     * Success response cho pagination (Laravel default)
     * ✅ KHÔNG wrap trong {success, data} - Frontend tự xử lý
     */
    protected function paginatedResponse(LengthAwarePaginator $paginator): JsonResponse
    {
        return response()->json($paginator);
    }

    /**
     * Success response cho single resource
     */
    protected function successResponse($data, string $message = null, int $status = 200): JsonResponse
    {
        $response = [
            'success' => true,
            'data' => $data
        ];

        if ($message) {
            $response['message'] = $message;
        }

        return response()->json($response, $status);
    }

    /**
     * Success response cho action (create, update, delete)
     */
    protected function messageResponse(string $message, $data = null, int $status = 200): JsonResponse
    {
        $response = [
            'success' => true,
            'message' => $message
        ];

        if ($data !== null) {
            $response['data'] = $data;
        }

        return response()->json($response, $status);
    }

    /**
     * Error response
     */
    protected function errorResponse(string $message, $errors = null, int $status = 400): JsonResponse
    {
        $response = [
            'success' => false,
            'message' => $message
        ];

        if ($errors !== null) {
            $response['errors'] = $errors;
        }

        return response()->json($response, $status);
    }

    /**
     * Validation error response
     */
    protected function validationErrorResponse($errors, string $message = 'Validation failed'): JsonResponse
    {
        return $this->errorResponse($message, $errors, 422);
    }

    /**
     * Not found response
     */
    protected function notFoundResponse(string $message = 'Resource not found'): JsonResponse
    {
        return $this->errorResponse($message, null, 404);
    }

    /**
     * Unauthorized response
     */
    protected function unauthorizedResponse(string $message = 'Unauthorized'): JsonResponse
    {
        return $this->errorResponse($message, null, 401);
    }

    /**
     * Forbidden response
     */
    protected function forbiddenResponse(string $message = 'Forbidden'): JsonResponse
    {
        return $this->errorResponse($message, null, 403);
    }

    /**
     * ============================================
     * PAGINATION HELPERS
     * ============================================
     */

    /**
     * Apply standard pagination parameters to query
     *
     * @param Builder $query
     * @param array $params [per_page, search, sort_by, sort_direction]
     * @param array $searchFields Fields to search in
     * @return Builder
     */
    protected function applyPaginationParams(Builder $query, array $params, array $searchFields = []): Builder
    {
        // Search
        if (!empty($params['search']) && !empty($searchFields)) {
            $search = $params['search'];
            $query->where(function($q) use ($search, $searchFields) {
                foreach ($searchFields as $field) {
                    if (str_contains($field, '.')) {
                        // Relation field
                        [$relation, $column] = explode('.', $field);
                        $q->orWhereHas($relation, fn($query) => $query->where($column, 'like', "%{$search}%"));
                    } else {
                        // Direct field
                        $q->orWhere($field, 'like', "%{$search}%");
                    }
                }
            });
        }

        // Sort
        $sortBy = $params['sort_by'] ?? 'created_at';
        $sortDirection = $params['sort_direction'] ?? 'desc';
        $query->orderBy($sortBy, $sortDirection);

        return $query;
    }

    /**
     * Get pagination parameters from request
     */
    protected function getPaginationParams($request): array
    {
        return [
            'per_page' => $request->input('per_page', 20),
            'search' => $request->input('search'),
            'sort_by' => $request->input('sort_by', 'created_at'),
            'sort_direction' => $request->input('sort_direction', 'desc'),
        ];
    }

    /**
     * Success response for paginated resource collection
     * Unwraps meta and links for cleaner response
     */
    protected function resourcePaginatedResponse($resourceCollection): JsonResponse
    {
        $response = $resourceCollection->response()->getData(true);
        if (isset($response['meta'])) {
            $meta = $response['meta'];
            unset($response['meta']);
            $response = array_merge($response, $meta);
        }
        unset($response['links']);
        return response()->json($response);
    }
}
