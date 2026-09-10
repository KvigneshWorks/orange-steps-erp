<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ProjectController extends Controller
{
    /**
     * Store a newly created project
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'sub' => 'nullable|string|max:255',
                'status' => 'required|in:active,pending,review,hold',
                'progress' => 'nullable|integer|min:0|max:100',
                'value' => 'required|numeric|min:0',
            ]);

            // Create project
            $project = Project::create([
                ...$validated,
                'user_id' => auth()->id() ?? 1,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Project created successfully',
                'data' => $project,
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create project',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get all projects
     */
    public function index(): JsonResponse
    {
        try {
            $projects = Project::with('user')->orderBy('created_at', 'desc')->get();
            return response()->json($projects, 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch projects',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
