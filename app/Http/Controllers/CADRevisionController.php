<?php

namespace App\Http\Controllers;

use App\Models\CADRevision;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CADRevisionController extends Controller
{
    /**
     * Store a newly created CAD revision
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'project_id' => 'required|integer|exists:projects,id',
                'file_name' => 'required|string|max:255',
                'revision_number' => 'nullable|integer|min:1',
                'description' => 'nullable|string',
            ]);

            $cadRevision = CADRevision::create([
                ...$validated,
                'user_id' => auth()->id() ?? 1,
                'revision_number' => $validated['revision_number'] ?? 1,
            ]);

            DashboardController::clearCache();

            return response()->json([
                'success' => true,
                'message' => 'CAD revision created successfully',
                'data' => $cadRevision,
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create CAD revision',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get all CAD revisions
     */
    public function index(): JsonResponse
    {
        try {
            $cadRevisions = CADRevision::with(['project', 'user'])
                ->orderBy('created_at', 'desc')
                ->get();
            return response()->json($cadRevisions, 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch CAD revisions',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
