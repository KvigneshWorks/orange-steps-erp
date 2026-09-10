<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\Inspection;
use App\Models\BOQ;
use App\Models\CADRevision;
use App\Models\User;
use Illuminate\Database\Seeder;

class DashboardSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get or create test user
        $user = User::firstOrCreate(
            ['email' => 'admin@whitenode.local'],
            [
                'name' => 'Admin User',
                'password' => bcrypt('password'),
                'role' => 'admin',
            ]
        );

        // Create team members
        for ($i = 1; $i <= 5; $i++) {
            User::firstOrCreate(
                ['email' => "team$i@whitenode.local"],
                [
                    'name' => "Team Member $i",
                    'password' => bcrypt('password'),
                    'role' => 'team',
                ]
            );
        }

        // Get all users for random assignment
        $users = User::all();

        // Create projects
        $projectsData = [
            [
                'name' => 'Skyline Residences',
                'sub' => 'Block C · Phase 2',
                'status' => 'active',
                'progress' => 67,
                'value' => 1840000, // ₹18.4L
            ],
            [
                'name' => 'Kovai Tech Park',
                'sub' => 'Foundation · Wing A',
                'status' => 'pending',
                'progress' => 23,
                'value' => 4210000, // ₹42.1L
            ],
            [
                'name' => 'Heritage Bungalow',
                'sub' => 'Interior · Level 2',
                'status' => 'review',
                'progress' => 88,
                'value' => 670000, // ₹6.7L
            ],
            [
                'name' => 'NH47 Flyover Study',
                'sub' => 'Feasibility Report',
                'status' => 'hold',
                'progress' => 15,
                'value' => 920000, // ₹9.2L
            ],
            [
                'name' => 'Green Valley Villas',
                'sub' => 'Landscape · Phase 1',
                'status' => 'active',
                'progress' => 54,
                'value' => 1180000, // ₹11.8L
            ],
            [
                'name' => 'Downtown Mall Extension',
                'sub' => 'Foundation Works',
                'status' => 'active',
                'progress' => 45,
                'value' => 2500000, // ₹25L
            ],
            [
                'name' => 'Riverside Apartments',
                'sub' => 'Structural Design',
                'status' => 'active',
                'progress' => 78,
                'value' => 3200000, // ₹32L
            ],
            [
                'name' => 'Business Hub Tower',
                'sub' => 'MEP Planning',
                'status' => 'pending',
                'progress' => 32,
                'value' => 4500000, // ₹45L
            ],
        ];

        $projects = [];
        foreach ($projectsData as $data) {
            $projects[] = Project::create([
                ...$data,
                'user_id' => $users->random()->id,
            ]);
        }

        // Create inspections (this month)
        for ($i = 0; $i < 137; $i++) {
            Inspection::create([
                'project_id' => $projects[array_rand($projects)]->id,
                'title' => "Site Inspection #$i",
                'description' => 'Regular site inspection and compliance check',
                'inspector_id' => $users->random()->id,
                'status' => collect(['pending', 'completed', 'flagged'])->random(),
                'created_at' => now()->subDays(rand(0, 30)),
            ]);
        }

        // Create BOQs
        for ($i = 0; $i < 25; $i++) {
            BOQ::create([
                'project_id' => $projects[array_rand($projects)]->id,
                'title' => "BOQ Item $i",
                'description' => 'Bill of quantities for project',
                'amount' => rand(50000, 500000),
                'status' => collect(['pending', 'approved', 'rejected'])->random(),
            ]);
        }

        // Create CAD Revisions (this week)
        for ($i = 0; $i < 58; $i++) {
            CADRevision::create([
                'project_id' => $projects[array_rand($projects)]->id,
                'file_name' => "Drawing_Rev_" . sprintf("%03d", $i),
                'revision_number' => rand(1, 10),
                'description' => 'Updated CAD drawing revision',
                'user_id' => $users->random()->id,
                'created_at' => now()->subDays(rand(0, 7)),
            ]);
        }
    }
}
