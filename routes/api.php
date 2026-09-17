    <?php

    use Illuminate\Http\Request;
    use Illuminate\Support\Facades\Route;
    use App\Http\Controllers\AuthController;
    use App\Http\Controllers\CategoryController;
    use App\Http\Controllers\DashboardController;
    use App\Http\Controllers\ProjectController;
    use App\Http\Controllers\InspectionController;
    use App\Http\Controllers\BOQController;
    use App\Http\Controllers\CADRevisionController;
    use App\Http\Controllers\IDTypeController;
    use App\Http\Controllers\SubCategoryController;
    use App\Http\Controllers\BioDataController;
    use App\Http\Controllers\SubNameController;
    use App\Http\Controllers\DaybookEntryController;
    use App\Http\Controllers\ClientPortalController;
    use App\Http\Controllers\CreditVendorController;
    use App\Http\Controllers\ReportController;
    use App\Http\Controllers\MasterDataController;
    use App\Http\Controllers\TrashController;
    use App\Http\Controllers\WorkerController;
    use App\Http\Controllers\AttendanceController;
    use App\Http\Controllers\LabourPaymentController;
    use App\Http\Controllers\ApprovalController;

    // ───────────────────────────────────────────────────────
    //  SETUP — adds deleted_at columns, call once in browser
    // ─────────────────────────────────────────────────────────
    Route::get('/setup/soft-deletes', function () {
        $tables = ['categories', 'sub_categories', 'id_types', 'sub_names', 'bio_data'];
        $added = [];
        $skipped = [];
        foreach ($tables as $table) {
            if (\Illuminate\Support\Facades\Schema::hasTable($table)) {
                if (!\Illuminate\Support\Facades\Schema::hasColumn($table, 'deleted_at')) {
                    \Illuminate\Support\Facades\Schema::table($table, function ($t) {
                        $t->softDeletes();
                    });
                    $added[] = $table;
                } else {
                    $skipped[] = $table;
                }
            }
        }
        return response()->json(['added' => $added, 'already_had_column' => $skipped]);
    });

    // ─────────────────────────────────────────────────────────────────────────────
    //  PUBLIC AUTH ROUTES
    //  NOTE: public self-registration has been removed. Account creation now
    //  happens only from inside the app (Account Settings module — admin can
    //  create a 'user' account pending super_admin approval, super_admin can
    //  create either directly). See the role-gated /auth/register below.
    // ─────────────────────────────────────────────────────────────────────────────
    Route::prefix('auth')->group(function () {
        Route::post('/login',  [AuthController::class, 'login']);
        Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
        Route::get('/me',   [AuthController::class, 'me'])->middleware('auth:sanctum');
        Route::post('/change-password', [AuthController::class, 'changePassword'])->middleware('auth:sanctum');
    });

    // ─────────────────────────────────────────────────────────────────────────────
    //  PROTECTED ROUTES
    // ─────────────────────────────────────────────────────────────────────────────
    Route::middleware('auth:sanctum')->group(function () {

        Route::get('/user', fn(Request $r) => $r->user());

        Route::middleware('role')->prefix('dashboard')->group(function () {
            Route::get('/overview', [DashboardController::class, 'overview']);
            Route::get('/stats',    [DashboardController::class, 'stats']);
            Route::get('/projects', [DashboardController::class, 'projects']);
        });

        // Account creation — only admin & super_admin may reach this now
        // (super_admin bypasses the 'admin' check via CheckRole). Public
        // self-registration and the old email/WhatsApp "digit code" link
        // flow are gone; this feeds the future in-app Account Settings module.
        Route::middleware('role:admin')->prefix('auth')->group(function () {
            Route::post('/register', [AuthController::class, 'register']);
            Route::get('/registration-status/{id}', [AuthController::class, 'registrationStatus']);
        });

        Route::middleware('role')->prefix('approval-requests')->group(function () {
            Route::get('/',              [ApprovalController::class, 'index']);
            Route::post('/{id}/approve', [ApprovalController::class, 'approveApi']);
            Route::post('/{id}/reject',  [ApprovalController::class, 'rejectApi']);
        });

        // "All Accounts" tab in Account Settings — super_admin only.
        Route::middleware('role')->prefix('users')->group(function () {
            Route::get('/', [AuthController::class, 'listAllUsers']);
        });

        Route::middleware('role:admin,user')->group(function () {
            Route::get('/master-data', [MasterDataController::class, 'index']);
        });

        Route::middleware('role:admin')->group(function () {
            Route::apiResource('categories',     CategoryController::class)->except(['destroy']);
            Route::apiResource('sub-categories', SubCategoryController::class)->except(['destroy']);
            Route::apiResource('id-types',       IDTypeController::class)->except(['destroy']);
            Route::apiResource('sub-names',      SubNameController::class)->except(['destroy']);
            Route::get('/bio-data/names', [BioDataController::class, 'names']);
            Route::apiResource('bio-data', BioDataController::class)->except(['destroy']);
        });
        
        Route::middleware('role')->group(function () {
            Route::delete('/categories/{id}',      [CategoryController::class, 'destroy']);
            Route::delete('/sub-categories/{id}',  [SubCategoryController::class, 'destroy']);
            Route::delete('/id-types/{id}',        [IDTypeController::class, 'destroy']);
            Route::delete('/sub-names/{id}',       [SubNameController::class, 'destroy']);
            Route::delete('/bio-data/{id}',        [BioDataController::class, 'destroy']);
        });

        Route::middleware('role')->group(function () {
            Route::post('/projects',      [ProjectController::class, 'store']);
            Route::get('/projects',       [ProjectController::class, 'index']);
            Route::post('/inspections',   [InspectionController::class, 'store']);
            Route::get('/inspections',    [InspectionController::class, 'index']);
            Route::post('/boqs',          [BOQController::class, 'store']);
            Route::get('/boqs',           [BOQController::class, 'index']);
            Route::post('/cad-revisions', [CADRevisionController::class, 'store']);
            Route::get('/cad-revisions',  [CADRevisionController::class, 'index']);
        });


        Route::middleware('role:admin')->group(function () {
            Route::get('/daybook/all', [DaybookEntryController::class, 'allEntries']);
            Route::get('/daybook/transactions', [DaybookEntryController::class, 'transactions']);
            Route::apiResource('daybook', DaybookEntryController::class)->except(['destroy']);
            Route::delete('/daybook/{daybook}', [DaybookEntryController::class, 'destroy'])->middleware('role');
        });

        // ─────────────────────────────────────────────────────────────────────────
        //  CLIENT PORTAL — super_admin only (hidden from admin & user)
        // ─────────────────────────────────────────────────────────────────────────
        Route::middleware('role')->prefix('client-portal')->group(function () {

            // Dashboard widgets
            Route::get('/summary',         [ClientPortalController::class, 'summary']);
            Route::get('/upcoming-dues',   [ClientPortalController::class, 'upcomingDues']);
            Route::get('/monthly-revenue', [ClientPortalController::class, 'monthlyRevenue']);
            Route::get('/recent-projects', [ClientPortalController::class, 'recentProjects']);

            // Bio-data lookup
            Route::get('/bio-data', [ClientPortalController::class, 'getBioDataRecords']);

            // Clients CRUD
            Route::get('/clients',           [ClientPortalController::class, 'indexClients']);
            Route::post('/clients',          [ClientPortalController::class, 'storeClient']);
            Route::get('/clients/{id}',      [ClientPortalController::class, 'showClient']);
            Route::put('/clients/{id}',      [ClientPortalController::class, 'updateClient']);
            Route::delete('/clients/{id}',   [ClientPortalController::class, 'destroyClient']);

            // Projects CRUD
            Route::get('/clients/{clientId}/projects',                [ClientPortalController::class, 'indexProjects']);
            Route::post('/clients/{clientId}/projects',               [ClientPortalController::class, 'storeProject']);
            Route::get('/clients/{clientId}/projects/{projectId}',    [ClientPortalController::class, 'showProject']);
            Route::put('/clients/{clientId}/projects/{projectId}',    [ClientPortalController::class, 'updateProject']);
            Route::delete('/clients/{clientId}/projects/{projectId}', [ClientPortalController::class, 'destroyProject']);

            // Budget & Payment Actions (ADD THESE)
            Route::post('/clients/{clientId}/projects/{projectId}/add-budget',     [ClientPortalController::class, 'addBudget']);
            Route::post('/clients/{clientId}/projects/{projectId}/collect-payment', [ClientPortalController::class, 'collectPayment']);
            Route::get('/clients/{clientId}/projects/{projectId}/budget-history', [ClientPortalController::class, 'budgetHistory']);
            Route::put('/budget-history/{historyId}',    [ClientPortalController::class, 'updateBudgetHistory']);
            Route::delete('/budget-history/{historyId}', [ClientPortalController::class, 'destroyBudgetHistory']);

            // Payments
            Route::post('/projects/{projectId}/payments', [ClientPortalController::class, 'storePayment']);
            Route::put('/payments/{paymentId}',           [ClientPortalController::class, 'updatePayment']);
            Route::delete('/payments/{paymentId}',        [ClientPortalController::class, 'destroyPayment']);
        });

        // ─────────────────────────────────────────────────────────────────────────
        //  CREDIT MANAGEMENT — admin & super_admin only (not 'user')
        // ─────────────────────────────────────────────────────────────────────────
        Route::middleware('role:admin')->prefix('credit-management')->group(function () {

            // Meta & summary — register BEFORE parameterised vendor routes
            Route::get('/meta',    [CreditVendorController::class, 'meta']);
            Route::get('/summary', [CreditVendorController::class, 'summary']);

            Route::get('/notifications', [CreditVendorController::class, 'getNotifications']);

            // Vendors CRUD
            Route::get('/vendors',         [CreditVendorController::class, 'indexVendors']);
            Route::post('/vendors',        [CreditVendorController::class, 'storeVendor']);
            Route::get('/vendors/{id}',    [CreditVendorController::class, 'showVendor']);
            Route::put('/vendors/{id}',    [CreditVendorController::class, 'updateVendor']);
            Route::delete('/vendors/{id}', [CreditVendorController::class, 'destroyVendor'])->middleware('role');

            // Entries (nested under vendor)
            Route::get('/vendors/{vendorId}/entries',  [CreditVendorController::class, 'indexEntries']);
            Route::post('/vendors/{vendorId}/entries', [CreditVendorController::class, 'storeEntry']);
            Route::put('/entries/{entryId}',           [CreditVendorController::class, 'updateEntry']);
            Route::delete('/entries/{entryId}',        [CreditVendorController::class, 'destroyEntry'])->middleware('role');

            // Vendor balance sheet
            Route::get('/vendors/{vendorId}/balance-sheet', [CreditVendorController::class, 'vendorBalanceSheet']);
            Route::get('/vendors/{vendorId}/payments',  [CreditVendorController::class, 'indexPayments']);
            Route::post('/vendors/{vendorId}/payments', [CreditVendorController::class, 'storePayment']);
            Route::put('/payments/{paymentId}',         [CreditVendorController::class, 'updatePayment']);
            Route::delete('/payments/{paymentId}',      [CreditVendorController::class, 'destroyPayment'])->middleware('role');
        });

        // ─────────────────────────────────────────────────────────────────────────
        //  RECYCLE BIN / TRASH — admin & super_admin only (not 'user')
        // ─────────────────────────────────────────────────────────────────────────
        Route::middleware('role:admin')->prefix('trash')->group(function () {
            Route::get('/',                             [TrashController::class, 'index']);
            Route::post('/{type}/{id}/restore',         [TrashController::class, 'restore']);
            Route::post('/{type}/restore-all',          [TrashController::class, 'restoreAll']);
            // Permanent delete is destructive & irreversible — super_admin only.
            Route::delete('/{type}/{id}/force',         [TrashController::class, 'forceDelete'])->middleware('role');
            Route::delete('/{type}/force-all',          [TrashController::class, 'forceDeleteAll'])->middleware('role');
        });

        // ─────────────────────────────────────────────────────────────────────────
        //  WORKFORCE — Workers/Attendance/Sub-names: admin & 'user' both allowed
        //  (this is exactly the "Labour Register + Labour Attendance" access the
        //  'user' role is scoped to). Payment/Bills stay admin & super_admin only.
        // ─────────────────────────────────────────────────────────────────────────
        Route::middleware('role:admin,user')->prefix('workforce')->group(function () {
            // Dashboard — small labour-only summary, used by the 'user' role's
            // Dashboard page and available to admin too.
            Route::get('/dashboard-stats',    [AttendanceController::class, 'dashboardStats']);
            Route::get('/recent-activity',    [AttendanceController::class, 'recentActivity']);

            // Workers — trashed must come BEFORE {id} wildcard
            Route::get('/workers/trashed',              [WorkerController::class, 'trashed']);
            Route::get('/workers',                      [WorkerController::class, 'index']);
            Route::post('/workers',                     [WorkerController::class, 'store']);
            Route::put('/workers/{id}',                 [WorkerController::class, 'update']);
            Route::delete('/workers/{id}',              [WorkerController::class, 'destroy'])->middleware('role');
            Route::patch('/workers/{id}/toggle-status', [WorkerController::class, 'toggleStatus']);

            // Meta helpers
            Route::get('/skills', [WorkerController::class, 'skills']);
            Route::get('/sites',  [WorkerController::class, 'sites']);

            // Attendance
            Route::get('/attendance',         [AttendanceController::class, 'index']);
            Route::post('/attendance',        [AttendanceController::class, 'store']);
            Route::put('/attendance/{id}',    [AttendanceController::class, 'update']);
            Route::delete('/attendance/{id}', [AttendanceController::class, 'destroy'])->middleware('role');
            Route::post('/attendance/{id}/restore', [AttendanceController::class, 'restore']);

            // Sub names (temporary referred workers per head worker)
            Route::get('/sub-names',                                [AttendanceController::class, 'allSubNames']);
            Route::get('/workers/{workerId}/sub-names',             [AttendanceController::class, 'subNames']);
            Route::post('/workers/{workerId}/sub-names',            [AttendanceController::class, 'storeSubName']);
            Route::put('/workers/{workerId}/sub-names/{subId}',     [AttendanceController::class, 'updateSubName']);
            Route::delete('/workers/{workerId}/sub-names/{subId}',  [AttendanceController::class, 'deleteSubName'])->middleware('role');
            Route::patch('/workers/{workerId}/sub-names/{subId}/toggle-status', [AttendanceController::class, 'toggleSubNameStatus']);
        });

        // ── Labour Payment — admin, user & super_admin. Deleting a
        //    payment session/bill still stays super_admin-only via the
        //    bare ->middleware('role') on those two routes below.
        Route::middleware('role:admin,user')->prefix('workforce')->group(function () {
            // ── NEW: Worker-centric payment system ──────────────────────────
            Route::get('/payment/setup',                         [LabourPaymentController::class, 'setupTables']);
            Route::get('/payment/workers',                       [LabourPaymentController::class, 'paymentWorkerList']);
            Route::get('/payment/workers/{id}',                  [LabourPaymentController::class, 'paymentWorkerDetail']);
            Route::post('/payment/workers/{id}/pay',             [LabourPaymentController::class, 'recordWorkerPayment']);
            Route::get('/payment/sessions',                      [LabourPaymentController::class, 'paymentSessionsList']);
            Route::delete('/payment/sessions/{id}',              [LabourPaymentController::class, 'deletePaymentSession'])->middleware('role');

            // ── LEGACY: Weekly Payment Bills (kept for backward compat) ──────
            Route::get('/bills',                     [LabourPaymentController::class, 'index']);
            Route::post('/bills/generate',           [LabourPaymentController::class, 'generate']);
            Route::get('/bills/{id}/pdf',            [LabourPaymentController::class, 'downloadPDF']);
            Route::post('/bills/{id}/whatsapp',      [LabourPaymentController::class, 'sendWhatsApp']);
            Route::get('/bills/{id}',                [LabourPaymentController::class, 'show']);
            Route::post('/bills/{id}/payments',      [LabourPaymentController::class, 'recordPayments']);
            Route::delete('/bills/{id}',             [LabourPaymentController::class, 'destroy'])->middleware('role');
        });

        // ─────────────────────────────────────────────────────────────────────────
        //  REPORTS — admin & super_admin only. "Client Report" (portal/*) is
        //  further restricted to super_admin only, matching Client Portal access.
        // ─────────────────────────────────────────────────────────────────────────
        Route::middleware('role:admin')->prefix('reports')->group(function () {
            Route::get('/summary',          [ReportController::class, 'summary']);
            Route::get('/daybook',          [ReportController::class, 'daybook']);
            Route::get('/credit',           [ReportController::class, 'credit']);
            Route::get('/monthly-revenue',  [ReportController::class, 'monthlyRevenue']);
            Route::get('/income-statement', [ReportController::class, 'incomeStatement']);
        });
        Route::middleware('role')->prefix('reports')->group(function () {
            Route::get('/portal',           [ReportController::class, 'portal']);
            Route::get('/portal/payments',  [ReportController::class, 'getAllPayments']);
        });
    });
