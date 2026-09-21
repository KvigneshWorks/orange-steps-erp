<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schema;

class CategoryController extends Controller
{
    private const CACHE_KEY = 'categories_all';
    private const CACHE_TTL = 3600;

    public function index()
    {
        $categories = Category::select('id', 'name', 'code', 'type', 'description', 'is_active', 'created_by_name')
            ->orderBy('type')
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $categories
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255|unique:categories,name',
            'code'        => 'nullable|string|max:20|unique:categories,code',
            'description' => 'nullable|string|max:500',
            'type'        => 'required|in:income,expense',
        ]);

        $user = auth()->user();

        $category = Category::create([
            'name'            => $validated['name'],
            'code'            => $validated['code'] ?? null,
            'description'     => $validated['description'] ?? null,
            'type'            => $validated['type'],
            'is_active'       => true,
            'created_by'      => $user->id,
            'created_by_name' => $user->name,
        ]);

        Cache::forget(self::CACHE_KEY);
        Cache::forget('master_data_all');

        return response()->json([
            'success' => true,
            'message' => 'Category created successfully',
            'data'    => $category
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $category = Category::findOrFail($id);

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('categories')->ignore($category->id)
            ],
            'code' => [
                'nullable',
                'string',
                'max:20',
                Rule::unique('categories')->ignore($category->id)
            ],
            'description' => 'nullable|string|max:500',
            'type'        => 'required|in:income,expense',
            'is_active'   => 'boolean',
        ]);

        $user = auth()->user();

        $category->update([
            'name'            => $validated['name'],
            'code'            => $validated['code'] ?? null,
            'description'     => $validated['description'] ?? null,
            'type'            => $validated['type'],
            'is_active'       => $validated['is_active'] ?? $category->is_active,
            'updated_by'      => $user->id,
            'updated_by_name' => $user->name,
        ]);

        Cache::forget(self::CACHE_KEY);
        Cache::forget('master_data_all');

        return response()->json([
            'success' => true,
            'message' => 'Category updated successfully',
            'data'    => $category->fresh()
        ]);
    }

    public function destroy($id)
    {
        if (!Schema::hasColumn('categories', 'deleted_at')) {
            Schema::table('categories', function ($t) {
                $t->softDeletes();
            });
        }
        $category = Category::findOrFail($id);
        $category->delete();
        Cache::forget(self::CACHE_KEY);
        Cache::forget('master_data_all');

        return response()->json([
            'success' => true,
            'message' => 'Category moved to Recycle Bin'
        ]);
    }
}
