<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class MasterDataController extends Controller
{
    /**
     * GET /api/master-data
     *
     * Returns all dropdown/reference data in a single request.
     * Replaces 4 separate calls (categories, sub-categories, bio-data, sub-names)
     * that were serialised by php artisan serve's single-threaded model.
     *
     * Cached briefly: this endpoint is called on nearly every page (Attendance,
     * Daybook, Workforce Register, ...) so an uncached hit means 5 extra
     * queries on every navigation. Master data (categories, bio data, etc.)
     * rarely changes second-to-second, so a short cache keeps pages fast
     * while still picking up edits within a couple minutes.
     */
    public function index()
    {
        // Actually wired up now -- the docblock above already described this
        // endpoint as "cached briefly" but nothing here ever called
        // Cache::remember(), so every one of the "nearly every page" hits
        // this doc warns about ran all 5 queries, every time. A 60s TTL is
        // short enough that a newly-added category/party/etc. still shows up
        // within a minute even if a write happens to land right after this
        // cached, and every create/update/delete across Category, Sub
        // Category, Bio Data, Sub Name and ID Type explicitly forgets this
        // key on save, so the common case (edit, then immediately reload) is
        // still instant, not a 60s wait.
        $payload = Cache::remember('master_data_all', 60, function () {
            $categories = DB::table('categories')
                ->whereNull('deleted_at')
                ->orderBy('name')
                ->get(['id', 'name', 'type']);

            $subCategories = DB::table('sub_categories')
                ->whereNull('deleted_at')
                ->orderBy('name')
                ->get(['id', 'name', 'category_id']);

            $bioData = DB::table('bio_data')
                ->whereNull('deleted_at')
                ->orderBy('name')
                ->get(['id', 'name', 'category_id', 'sub_category_id', 'is_active']);

            $subNames = DB::table('sub_names')
                ->whereNull('deleted_at')
                ->orderBy('alternate_name')
                ->get(['id', 'alternate_name', 'bio_data_id']);

            $idTypes = DB::table('id_types')
                ->whereNull('deleted_at')
                ->orderBy('type_name')
                ->get(['id', 'type_name']);

            return [
                'categories'     => $categories,
                'sub_categories' => $subCategories,
                'bio_data'       => $bioData,
                'sub_names'      => $subNames,
                'id_types'       => $idTypes,
            ];
        });

        return response()->json(array_merge(['success' => true], $payload));
    }
}
