<?php

namespace App\Http\Controllers;

use App\Models\BioData;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class BioDataController extends Controller
{
    public function index()
    {
        try {
            // Use raw DB query to bypass any model-level caching or scope issues
            $rows = DB::table('bio_data')
                ->whereNull('bio_data.deleted_at')
                ->leftJoin('id_types',      'bio_data.id_type_id',      '=', 'id_types.id')
                ->leftJoin('categories',    'bio_data.category_id',     '=', 'categories.id')
                ->leftJoin('sub_categories','bio_data.sub_category_id', '=', 'sub_categories.id')
                ->leftJoin('users',         'bio_data.created_by',      '=', 'users.id')
                ->select(
                    'bio_data.*',
                    'id_types.type_name          as id_type_name',
                    'categories.name             as category_name',
                    'sub_categories.name         as sub_category_name',
                    DB::raw('COALESCE(users.name, bio_data.created_by_name) as created_by_name_resolved')
                )
                ->orderBy('bio_data.name')
                ->get()
                ->map(function ($r) {
                    $arr = (array) $r;
                    $arr['created_by_name'] = $arr['created_by_name_resolved'];
                    unset($arr['created_by_name_resolved']);
                    return $arr;
                })
                ->values();

            \Log::info('BioData index() raw', ['count' => $rows->count()]);

            return response()->json([
                'success' => true,
                'data'    => $rows,
            ]);
        } catch (\Exception $e) {
            \Log::error('BioData index() error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch bio data',
                'error'   => $e->getMessage(),
            ], 500);
        }
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

        Cache::forget('master_data_all');

        return response()->json([
            'success' => true,
            'message' => 'Bio Data registered successfully',
            'data'    => $bio
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $bio = BioData::findOrFail($id);

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

        $bio->update([
            'name'            => $request->name,
            'id_type_id'      => $request->id_type_id,
            'id_details'      => $request->id_details,
            'category_id'     => $request->category_id,
            'sub_category_id' => $request->sub_category_id,
            'address'         => $request->address,
            'description'     => $request->description,
            'created_by'      => $user->id,
            'created_by_name' => $user->name ?? 'System',
        ]);

        Cache::forget('master_data_all');

        return response()->json([
            'success' => true,
            'message' => 'Bio Data updated successfully',
            'data'    => $bio
        ]);
    }

    public function destroy($id)
    {
        if (!\Illuminate\Support\Facades\Schema::hasColumn('bio_data', 'deleted_at')) {
            \Illuminate\Support\Facades\Schema::table('bio_data', fn($t) => $t->softDeletes());
        }

        $bio = BioData::findOrFail($id);
        $bio->delete(); // soft delete — moves to Recycle Bin

        Cache::forget('master_data_all');

        return response()->json([
            'success' => true,
            'message' => 'Bio Data moved to Recycle Bin'
        ]);
    }
}
