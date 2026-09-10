<?php

namespace App\Http\Controllers;

use App\Models\BioData;
use Illuminate\Http\Request;

class BioDataController extends Controller
{
    public function index()
    {
        $bioData = BioData::with(['idType', 'category', 'subCategory', 'creator'])
            ->orderBy('name')
            ->get()
            ->map(function ($b) {
                $arr = $b->toArray();
                $arr['id_type_name'] = $b->idType?->type_name ?? null;
                $arr['category_name'] = $b->category?->name ?? null;
                $arr['sub_category_name'] = $b->subCategory?->name ?? null;
                $arr['created_by_name'] = $b->creator?->name ?? $b->created_by_name ?? null;
                return $arr;
            });

        return response()->json([
            'success' => true,
            'data' => $bioData
        ]);
    }

    /**
     * Lightweight name list for dropdowns (e.g. Client Portal name picker).
     * GET /api/bio-data/names
     */
    public function names()
    {
        $names = BioData::where('is_active', true)
            ->orderBy('name')
            ->pluck('name');

        return response()->json([
            'success' => true,
            'data'    => $names,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'           => 'required|string|max:255',
            'id_type_id'     => 'required|exists:id_types,id',
            'id_details'     => 'required|string',
            'category_id'    => 'required|exists:categories,id',
            'sub_category_id'=> 'nullable|exists:sub_categories,id',
            'address'        => 'nullable|string',
            'description'    => 'nullable|string',
        ]);

        $user = auth()->user();

        $bio = BioData::create([
            'name'            => $request->name,
            'id_type_id'      => $request->id_type_id,
            'id_details'      => $request->id_details,
            'category_id'     => $request->category_id,
            'sub_category_id' => $request->sub_category_id,
            'address'         => $request->address,
            'description'     => $request->description,
            'is_active'       => true,
            'created_by'      => $user->id,
            'created_by_name' => $user->name ?? 'System',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Bio Data registered successfully',
            'data'    => $bio
        ], 201);
    }

    public function destroy($id)
    {
        $bio = BioData::findOrFail($id);
        $bio->delete();

        return response()->json([
            'success' => true,
            'message' => 'Bio Data deleted successfully'
        ]);
    }
}
