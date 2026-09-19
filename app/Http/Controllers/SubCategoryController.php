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
                $query = SubCategory::with(['category', 'creator'])
                    ->select('sub_categories.*');

                if ($search) {
                    $query->where(function ($q) use ($search) {
                        $q->where('sub_categories.name', 'like', "%{$search}%")
                            ->orWhereHas('category', fn($c) => $c->where('name', 'like', "%{$search}%"));
                    });
                }

                return $query->orderBy('sub_categories.name')
                    ->paginate($perPage);
            });

            return response()->json([
                'success' => true,
                'data' => $result->items(),
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
                'category_id' => 'required|exists:categories,id',
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'additional_field' => 'nullable|string',
                'is_active' => 'boolean',
            ]);

            $user = auth()->user();

            $id = DB::table('sub_categories')->insertGetId([
                'category_id' => $validated['category_id'],
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
                'additional_field' => $validated['additional_field'] ?? null,
                'is_active' => $validated['is_active'] ?? true,
                'created_by' => $user?->id,
                'created_by_name' => $user?->name ?? 'System',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $this->clearSubCategoryCache();

            $subCategory = DB::table('sub_categories')->where('id', $id)->first();

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
                'category_id' => 'required|exists:categories,id',
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'additional_field' => 'nullable|string',
                'is_active' => 'boolean',
            ]);

            $user = auth()->user();

            DB::table('sub_categories')
                ->where('id', $id)
                ->update([
                    'category_id' => $validated['category_id'],
                    'name' => $validated['name'],
                    'description' => $validated['description'] ?? null,
                    'additional_field' => $validated['additional_field'] ?? null,
                    'is_active' => $validated['is_active'] ?? true,
                    'updated_by' => $user?->id,
                    'updated_by_name' => $user?->name ?? 'System',
                    'updated_at' => now(),
                ]);

            $this->clearSubCategoryCache();

            $subCategory = DB::table('sub_categories')->where('id', $id)->first();

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
    }
}
