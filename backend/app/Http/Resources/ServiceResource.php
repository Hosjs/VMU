<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ServiceResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'code' => $this->code,
            'description' => $this->description,
            'unit' => $this->unit,
            'estimated_time' => $this->estimated_time,

            // Images
            'main_image' => $this->main_image,
            'gallery_images' => $this->gallery_images ? explode('|', $this->gallery_images) : [],

            // Warranty
            'has_warranty' => (bool) $this->has_warranty,
            'warranty_months' => $this->warranty_months,

            'notes' => $this->notes,
            'is_active' => (bool) $this->is_active,

            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
