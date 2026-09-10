<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CategoryController extends Controller
{
    /**
     * Display a listing of categories
     */
    public function index()
    {
        $categories = Category::orderBy('name')->get();

        return response()->json([
            'success' => true,
            'data'    => $categories
        ]);
    }

    /**
     * Store a newly created category
     */
    public function store(Request $request)
    {
        $request->validate([
            'name'        => 'required|string|max:255|unique:categories,name',
            'code'        => 'nullable|string|max:20|unique:categories,code',
            'description' => 'nullable|string|max:500',
            'type'        => 'required|in:income,expense',
        ]);

        $user = auth()->user();  
        $category = Category::create([
            'name'            => $request->name,
            'code'            => $request->code,
            'description'     => $request->description,
            'type'            => $request->type,
            'is_active'       => true,
            'created_by'      => $user->id,             
            'created_by_name' => $user->name, 
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Category created successfully',
            'data'    => $category
        ], 201);
    }

    /**
     * Update the specified category
     */
    public function update(Request $request, $id)
    {
        $category = Category::findOrFail($id);

        $request->validate([
            'name'        => [
                'required',
                'string',
                'max:255',
                Rule::unique('categories')->ignore($category->id)
            ],
            'code'        => [
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
            'name'            => $request->name,
            'code'            => $request->code,
            'description'     => $request->description,
            'type'            => $request->type,
            'is_active'       => $request->is_active,
            'created_by'      => $user->id,           
            'created_by_name' => $user->name,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Category updated successfully',
            'data'    => $category
        ]);
    }

    /**
     * Remove the specified category
     */
    public function destroy($id)
    {
        $category = Category::findOrFail($id);
        $category->delete();

        return response()->json([
            'success' => true,
            'message' => 'Category deleted successfully'
        ]);
    }
}