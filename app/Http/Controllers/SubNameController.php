<?php

namespace App\Http\Controllers;

use App\Models\SubName;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class SubNameController extends Controller
{
    public function index()
    {
        $subNames = SubName::with('bioData')
            ->orderBy('alternate_name')
            ->get()
            ->map(function ($s) {
                $arr = $s->toArray();
                $arr['bio_data_name'] = $s->bioData?->name ?? null;
                return $arr;
            });

        return response()->json([
            'success' => true,
            'data'    => $subNames
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'bio_data_id'     => 'required|exists:bio_data,id',
            'sub_category_id' => 'nullable|exists:sub_categories,id',
            'alternate_name'  => 'required|string|max:255',
            'classification' => 'nullable|string|max:255',
            'description'     => 'nullable|string',
        ]);

        $user = auth()->user();

        $subName = SubName::create([
            'bio_data_id'      => $request->bio_data_id,
            'sub_category_id'  => $request->sub_category_id,
            'alternate_name'   => $request->alternate_name,
            'classification'   => $request->classification,
            'description'      => $request->description,
            'is_active'        => true,
            'created_by'       => $user->id,
            'created_by_name'  => $user->name ?? 'System',
        ]);

        Cache::forget('master_data_all');

        return response()->json([
            'success' => true,
            'message' => 'Sub-Name created successfully',
            'data'    => $subName->load('bioData')
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $subName = SubName::findOrFail($id);

        $request->validate([
            'bio_data_id'     => 'required|exists:bio_data,id',
            'sub_category_id' => 'nullable|exists:sub_categories,id',
            'alternate_name'  => 'required|string|max:255',
            'classification'  => 'nullable|string|max:255',
            'description'     => 'nullable|string',
        ]);

        $user = auth()->user();

        $subName->update([
            'bio_data_id'      => $request->bio_data_id,
            'sub_category_id'  => $request->sub_category_id,
            'alternate_name'   => $request->alternate_name,
            'classification'   => $request->classification,
            'description'      => $request->description,
            'created_by'       => $user->id,
            'created_by_name'  => $user->name ?? 'System',
        ]);

        Cache::forget('master_data_all');

        return response()->json([
            'success' => true,
            'message' => 'Sub-Name updated successfully',
            'data'    => $subName->load('bioData')
        ]);
    }

    public function destroy($id)
    {
        if (!\Illuminate\Support\Facades\Schema::hasColumn('sub_names', 'deleted_at')) {
            \Illuminate\Support\Facades\Schema::table('sub_names', fn($t) => $t->softDeletes());
        }
        $subName = SubName::findOrFail($id);
        $subName->delete();

        Cache::forget('master_data_all');

        return response()->json([
            'success' => true,
            'message' => 'Sub-Name moved to Recycle Bin'
        ]);
    }
}
