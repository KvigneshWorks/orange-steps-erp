<?php

namespace App\Http\Controllers;

use App\Models\IDType;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;

class IDTypeController extends Controller
{
    /**
     * Display a listing of ID Types
     */
    public function index(): JsonResponse
    {
        $idTypes = IDType::orderBy('type_name', 'asc')->get();
        
        return response()->json([
            'data' => $idTypes
        ]);
    }

    /**
     * Store a newly created ID Type
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'type_name'      => 'required|string|max:255|unique:id_types,type_name',
            'format_pattern' => 'nullable|string|max:255',
            'description'    => 'nullable|string',
        ]);

        $idType = IDType::create([
            'type_name'      => $request->type_name,
            'format_pattern' => $request->format_pattern,
            'description'    => $request->description,
            'is_active'      => true,
            'created_by'      => Auth::id(),
            'created_by_name' => Auth::user()?->name,
        ]);

        return response()->json([
            'message' => 'ID Type created successfully!',
            'data'    => $idType
        ], 201);
    }

    /**
     * Update the specified ID Type
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $idType = IDType::findOrFail($id);

        $request->validate([
            'type_name'      => [
                'required',
                'string',
                'max:255',
                Rule::unique('id_types')->ignore($idType->id)
            ],
            'format_pattern' => 'nullable|string|max:255',
            'description'    => 'nullable|string',
        ]);

        $idType->update([
            'type_name'      => $request->type_name,
            'format_pattern' => $request->format_pattern,
            'description'    => $request->description,
        ]);

        return response()->json([
            'message' => 'ID Type updated successfully!',
            'data'    => $idType
        ]);
    }

    /**
     * Remove the specified ID Type
     */
    public function destroy(string $id): JsonResponse
    {
        if (!\Illuminate\Support\Facades\Schema::hasColumn('id_types', 'deleted_at')) {
            \Illuminate\Support\Facades\Schema::table('id_types', fn($t) => $t->softDeletes());
        }
        $idType = IDType::findOrFail($id);
        $name = $idType->type_name;
        $idType->delete();

        return response()->json(['message' => "\"{$name}\" moved to Recycle Bin"]);
    }
}