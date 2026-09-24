<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use App\Models\SubCategory;
use App\Models\Category;

class SubCategoryController extends Controller
{
    private const CACHE_TTL = 3600;

    public function index(Request $request)
    {
        try {
            $perPage = $request->input('per_page', 20);
            $page = $request->input('page', 1);
            $search = $request->input('search', '');
            $cacheKey = "sub_categories_v" . $this->getSubCategoryCacheVersion() . "_page_{$page}_{$perPage}_" . md5($search);
            $result = Cache::remember($cacheKey, 300, function () use ($perPage, $search) {
                $query = SubCategory::with(['category', 'categories', 'creator'])
                    ->select('sub_categories.*');

                if ($search) {
                    $query->where(function ($q) use ($search) {
                        $q->where('sub_categories.name', 'like', "%{$search}%")
                            ->orWhereHas('categories', fn($c) => $c->where('name', 'like', "%{$search}%"));
                    });
                }

                return $query->orderBy('sub_categories.name')
                    ->paginate($perPage);
            });

            // category_ids / category_names: the full many-to-many set, so
            // the frontend can show "belongs to N categories" and filter
            // correctly no matter which one is picked. category_id / the
            // single `category` relation stay as-is for backward compat.
            $items = collect($result->items())->map(function ($sc) {
                $sc->category_ids = $sc->categories->pluck('id')->values();
                $sc->category_names = $sc->categories->pluck('name')->values();
                return $sc;
            })->values();

            return response()->json([
                'success' => true,
                'data' => $items,
                'pagination' => [
                    'total' => $result->total(),
                    'per_page' => $result->perPage(),
                    'current_page' => $result->currentPage(),
                    'last_page' => $result->lastPage(),
                    'from' => $result->firstItem(),
                    'to' => $result->lastItem(),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'category_ids' => 'required|array|min:1',
                'category_ids.*' => 'integer|exists:categories,id',
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'additional_field' => 'nullable|string',
                'is_active' => 'boolean',
            ]);

            // A sub-category is one record shared across however many
            // categories it's linked to now — so the name only needs to be
            // created once. Block a duplicate name among still-active
            // records and point the user at editing the existing one
            // instead of silently creating a second "Engineer".
            $existing = SubCategory::whereRaw('LOWER(TRIM(name)) = ?', [strtolower(trim($validated['name']))])->first();
            if ($existing) {
                return response()->json([
                    'success' => false,
                    'message' => "A sub-category named \"{$existing->name}\" already exists. Edit it instead to add more categories to it.",
                ], 422);
            }

            $user = auth()->user();

            $subCategory = SubCategory::create([
                'category_id' => $validated['category_ids'][0],
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
                'additional_field' => $validated['additional_field'] ?? null,
                'is_active' => $validated['is_active'] ?? true,
                'created_by' => $user?->id,
                'created_by_name' => $user?->name ?? 'System',
            ]);

            $subCategory->categories()->sync($validated['category_ids']);

            $this->clearSubCategoryCache();

            $subCategory->load('categories');
            $subCategory->category_ids = $subCategory->categories->pluck('id')->values();
            $subCategory->category_names = $subCategory->categories->pluck('name')->values();

            return response()->json([
                'success' => true,
                'message' => 'Sub-Category created successfully',
                'data' => $subCategory
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'category_ids' => 'required|array|min:1',
                'category_ids.*' => 'integer|exists:categories,id',
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'additional_field' => 'nullable|string',
                'is_active' => 'boolean',
            ]);

            $existing = SubCategory::whereRaw('LOWER(TRIM(name)) = ?', [strtolower(trim($validated['name']))])
                ->where('id', '!=', $id)
                ->first();
            if ($existing) {
                return response()->json([
                    'success' => false,
                    'message' => "A sub-category named \"{$existing->name}\" already exists. Edit it instead to add more categories to it.",
                ], 422);
            }

            $user = auth()->user();

            $subCategory = SubCategory::findOrFail($id);
            $subCategory->update([
                'category_id' => $validated['category_ids'][0],
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
                'additional_field' => $validated['additional_field'] ?? null,
                'is_active' => $validated['is_active'] ?? true,
                'updated_by' => $user?->id,
                'updated_by_name' => $user?->name ?? 'System',
            ]);

            // sync() replaces the full set of linked categories with exactly
            // what was ticked on the edit form.
            $subCategory->categories()->sync($validated['category_ids']);

            $this->clearSubCategoryCache();

            $subCategory->load('categories');
            $subCategory->category_ids = $subCategory->categories->pluck('id')->values();
            $subCategory->category_names = $subCategory->categories->pluck('name')->values();

            return response()->json([
                'success' => true,
                'message' => 'Sub-Category updated successfully',
                'data' => $subCategory
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            if (!\Illuminate\Support\Facades\Schema::hasColumn('sub_categories', 'deleted_at')) {
                \Illuminate\Support\Facades\Schema::table('sub_categories', function ($t) {
                    $t->softDeletes();
                });
            }

            $subCategory = SubCategory::findOrFail($id);
            $subCategory->delete();
            $this->clearSubCategoryCache();

            return response()->json(['success' => true, 'message' => 'Sub-Category moved to Recycle Bin']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    private function getSubCategoryCacheVersion(): int
    {
        return (int) Cache::get('sub_categories_cache_version', 1);
    }

    private function clearSubCategoryCache()
    {
        Cache::forever('sub_categories_cache_version', $this->getSubCategoryCacheVersion() + 1);
        Cache::forget('sub_categories_list');
        Cache::forget('master_data_all');
    }
}