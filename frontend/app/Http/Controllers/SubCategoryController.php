<?php

namespace App\Http\Controllers;

use App\Models\SubCategory;
use Illuminate\Http\Request;

class SubCategoryController extends Controller
{
    public function index()
    {
        $subCategories = SubCategory::with('category')
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $subCategories
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'category_id'     => 'required|exists:categories,id',
            'name'            => 'required|string|max:255',
            'description'     => 'nullable|string',
            'additional_field'=> 'nullable|string',
            'is_active'       => 'boolean',
        ]);

        $user = auth()->user();

        $subCategory = SubCategory::create([
            'category_id'     => $request->category_id,
            'name'            => $request->name,
            'description'     => $request->description,
            'additional_field'=> $request->additional_field,
            'is_active'       => $request->is_active ?? true,
            'created_by'      => $user->id,
            'created_by_name' => $user->name ?? 'System',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Sub-Category created successfully',
            'data'    => $subCategory
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $subCategory = SubCategory::findOrFail($id);

        $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'additional_field' => 'nullable|string',
            'is_active'   => 'boolean',
        ]);

        $user = auth()->user();

        $subCategory->update([
            'category_id'     => $request->category_id,
            'name'            => $request->name,
            'description'     => $request->description,
            'additional_field'=> $request->additional_field,
            'is_active'       => $request->is_active ?? true,
            'created_by'      => $user->id,
            'created_by_name' => $user->name ?? 'System',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Sub-Category updated successfully',
            'data'    => $subCategory
        ]);
    }

    public function destroy($id)
    {
        $subCategory = SubCategory::findOrFail($id);
        $subCategory->delete();

        return response()->json([
            'success' => true,
            'message' => 'Sub-Category deleted successfully'
        ]);
    }
}