<?php

namespace App\Http\Controllers;

use App\Models\Inspection;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class InspectionController extends Controller
{
    /**
     * Store a newly created inspection
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'project_id' => 'required|integer|exists:projects,id',
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'status' => 'required|in:pending,completed,flagged',
            ]);

            $inspection = Inspection::create([
                ...$validated,
                'inspector_id' => auth()->id() ?? 1,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Inspection created successfully',
                'data' => $inspection,
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create inspection',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get all inspections
     */
    public function index(): JsonResponse
    {
        try {
            $inspections = Inspection::with(['project', 'inspector'])
                ->orderBy('created_at', 'desc')
                ->get();
            return response()->json($inspections, 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch inspections',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
