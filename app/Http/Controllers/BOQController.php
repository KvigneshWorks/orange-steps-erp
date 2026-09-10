<?php

namespace App\Http\Controllers;

use App\Models\BOQ;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class BOQController extends Controller
{
    /**
     * Store a newly created BOQ
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'project_id' => 'required|integer|exists:projects,id',
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'amount' => 'required|numeric|min:0',
                'status' => 'required|in:pending,approved,rejected',
            ]);

            $boq = BOQ::create($validated);

            return response()->json([
                'success' => true,
                'message' => 'BOQ created successfully',
                'data' => $boq,
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create BOQ',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get all BOQs
     */
    public function index(): JsonResponse
    {
        try {
            $boqs = BOQ::with('project')
                ->orderBy('created_at', 'desc')
                ->get();
            return response()->json($boqs, 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch BOQs',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
