<?php
/**
 * OrangeSteps Server Diagnostic & Environment Checker
 * Open in browser: https://orangesteps.in/check-environment.php
 */

header('Content-Type: text/html; charset=utf-8');

// Action: API Test for Authorization Header
if (isset($_GET['action']) && $_GET['action'] === 'test-header') {
    header('Content-Type: application/json');
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? $_SERVER['HTTP_X_AUTHORIZATION'] ?? null;
    echo json_encode([
        'success' => !empty($authHeader),
        'header' => $authHeader,
        'http_authorization' => $_SERVER['HTTP_AUTHORIZATION'] ?? null,
        'redirect_authorization' => $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? null,
        'x_authorization' => $_SERVER['HTTP_X_AUTHORIZATION'] ?? null,
    ]);
    exit;
}

// Action: Clear Laravel Bootstrap & Application Cache
$cacheClearedMessage = null;
if (isset($_GET['action']) && $_GET['action'] === 'clear-cache') {
    $bootstrapCacheFiles = glob(__DIR__ . '/../bootstrap/cache/*.php');
    $count = 0;
    if (is_array($bootstrapCacheFiles)) {
        foreach ($bootstrapCacheFiles as $file) {
            if (basename($file) !== '.gitignore') {
                @unlink($file);
                $count++;
            }
        }
    }

    $frameworkCacheDir = __DIR__ . '/../storage/framework/cache/data';
    $dataCount = 0;
    if (is_dir($frameworkCacheDir)) {
        $files = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($frameworkCacheDir, RecursiveDirectoryIterator::SKIP_DOTS),
            RecursiveIteratorIterator::CHILD_FIRST
        );
        foreach ($files as $fileinfo) {
            if ($fileinfo->isFile() && $fileinfo->getFilename() !== '.gitignore') {
                @unlink($fileinfo->getRealPath());
                $dataCount++;
            }
        }
    }

    $cacheClearedMessage = "Cleared {$count} bootstrap config files and {$dataCount} framework data cache files!";
}

$phpVersion = PHP_VERSION;
$phpVersionOk = version_compare(PHP_VERSION, '8.2.0', '>=');

$requiredExtensions = [
    'bcmath'    => 'BCMath PHP Extension',
    'ctype'     => 'Ctype PHP Extension',
    'curl'      => 'cURL PHP Extension',
    'dom'       => 'DOM PHP Extension',
    'fileinfo'  => 'Fileinfo PHP Extension',
    'filter'    => 'Filter PHP Extension',
    'hash'      => 'Hash PHP Extension',
    'mbstring'  => 'Mbstring PHP Extension',
    'openssl'   => 'OpenSSL PHP Extension',
    'pcre'      => 'PCRE PHP Extension',
    'pdo'       => 'PDO PHP Extension',
    'pdo_mysql' => 'PDO MySQL Driver',
    'session'   => 'Session PHP Extension',
    'tokenizer' => 'Tokenizer PHP Extension',
    'xml'       => 'XML PHP Extension',
    'zip'       => 'Zip PHP Extension',
    'gd'        => 'GD Image Library',
];

$extensionStatus = [];
$allExtensionsOk = true;

foreach ($requiredExtensions as $ext => $label) {
    $isLoaded = extension_loaded($ext);
    $extensionStatus[$ext] = [
        'label'  => $label,
        'loaded' => $isLoaded,
    ];
    if (!$isLoaded) {
        $allExtensionsOk = false;
    }
}

$writableDirs = [
    '../storage'                  => is_writable(__DIR__ . '/../storage'),
    '../storage/app'              => is_writable(__DIR__ . '/../storage/app'),
    '../storage/framework'        => is_writable(__DIR__ . '/../storage/framework'),
    '../storage/framework/cache'  => is_writable(__DIR__ . '/../storage/framework/cache'),
    '../storage/framework/views'  => is_writable(__DIR__ . '/../storage/framework/views'),
    '../storage/framework/sessions' => is_writable(__DIR__ . '/../storage/framework/sessions'),
    '../storage/logs'             => is_writable(__DIR__ . '/../storage/logs'),
    '../bootstrap/cache'          => is_writable(__DIR__ . '/../bootstrap/cache'),
];

$envExists = file_exists(__DIR__ . '/../.env');
$hasConfigCache = file_exists(__DIR__ . '/../bootstrap/cache/config.php');

$dbConnected = false;
$dbError = null;
$parsedUser = null;
$parsedDb = null;
$pdo = null;

$adminCreatedMessage = null;
$existingUsers = [];
$tableCounts = [];

if ($envExists) {
    try {
        $envContent = file_get_contents(__DIR__ . '/../.env');
        preg_match('/DB_HOST=(.*)/', $envContent, $hostMatch);
        preg_match('/DB_PORT=(.*)/', $envContent, $portMatch);
        preg_match('/DB_DATABASE=(.*)/', $envContent, $dbMatch);
        preg_match('/DB_USERNAME=(.*)/', $envContent, $userMatch);
        preg_match('/DB_PASSWORD=(.*)/', $envContent, $passMatch);

        $host = isset($hostMatch[1]) ? trim(trim($hostMatch[1]), "\"'") : '127.0.0.1';
        $port = isset($portMatch[1]) ? trim(trim($portMatch[1]), "\"'") : '3306';
        $db   = isset($dbMatch[1]) ? trim(trim($dbMatch[1]), "\"'") : '';
        $user = isset($userMatch[1]) ? trim(trim($userMatch[1]), "\"'") : '';
        $pass = isset($passMatch[1]) ? trim(trim($passMatch[1]), "\"'") : '';

        $parsedUser = $user;
        $parsedDb   = $db;

        if (extension_loaded('pdo_mysql') && !empty($db)) {
            $pdo = new PDO("mysql:host={$host};port={$port};dbname={$db}", $user, $pass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_TIMEOUT => 5,
            ]);
            $dbConnected = true;

            // Action: Create Default Admin User
            if (isset($_GET['action']) && ($_GET['action'] === 'create-admin' || $_GET['action'] === 'create-md')) {
                $targetUsers = [
                    ['email' => 'md@orangesteps.in', 'pass' => 'orangesteps', 'name' => 'Managing Director'],
                    ['email' => 'md@orangesteps', 'pass' => 'orangesteps', 'name' => 'Managing Director'],
                    ['email' => 'admin@orangesteps.in', 'pass' => 'password123', 'name' => 'Super Admin'],
                ];

                $msgList = [];
                foreach ($targetUsers as $tUser) {
                    $uEmail = strtolower($tUser['email']);
                    $uPass = $tUser['pass'];
                    $uName = $tUser['name'];
                    $hashedPass = password_hash($uPass, PASSWORD_BCRYPT);

                    $stmt = $pdo->prepare("SELECT id FROM users WHERE LOWER(email) = ?");
                    $stmt->execute([$uEmail]);
                    $existing = $stmt->fetch();

                    if ($existing) {
                        $uStmt = $pdo->prepare("UPDATE users SET password = ?, role = 'super_admin', updated_at = NOW() WHERE id = ?");
                        $uStmt->execute([$hashedPass, $existing['id']]);
                        $msgList[] = "Updated '{$uEmail}' password to '{$uPass}'";
                    } else {
                        $iStmt = $pdo->prepare("INSERT INTO users (name, email, password, role, email_verified_at, created_at, updated_at) VALUES (?, ?, ?, 'super_admin', NOW(), NOW(), NOW())");
                        $iStmt->execute([$uName, $uEmail, $hashedPass]);
                        $msgList[] = "Created user '{$uEmail}' with password '{$uPass}'";
                    }
                }
                $adminCreatedMessage = implode(' | ', $msgList);
            }

            // Ensure deleted_at soft delete columns exist on all application tables
            $allSoftDeleteTables = ['categories', 'sub_categories', 'id_types', 'sub_names', 'bio_data', 'daybook_entries', 'workers', 'clients', 'client_projects', 'client_payments', 'credit_vendors', 'credit_entries', 'attendance_records'];
            foreach ($allSoftDeleteTables as $stTable) {
                try {
                    $cols = $pdo->query("SHOW COLUMNS FROM `{$stTable}` LIKE 'deleted_at'")->fetchAll();
                    if (empty($cols)) {
                        $pdo->exec("ALTER TABLE `{$stTable}` ADD COLUMN `deleted_at` TIMESTAMP NULL DEFAULT NULL");
                    }
                } catch (\Throwable $e) { /* table might not exist yet */ }
            }

            // Fetch Table Counts
            $checkTables = ['users', 'workers', 'categories', 'daybook_entries', 'bio_data', 'clients', 'credit_vendors', 'user_approval_requests'];
            foreach ($checkTables as $t) {
                try {
                    $cStmt = $pdo->query("SELECT COUNT(*) FROM `{$t}`");
                    $tableCounts[$t] = $cStmt->fetchColumn();
                } catch (\Throwable $ex) {
                    $tableCounts[$t] = 'Table Missing';
                }
            }

            // Fetch Existing Users
            try {
                $uListStmt = $pdo->query("SELECT id, name, email, role, created_at FROM users ORDER BY id ASC");
                $existingUsers = $uListStmt->fetchAll(PDO::FETCH_ASSOC);
            } catch (\Throwable $ex) {
                // Table might not exist yet
            }
        }
    } catch (\Throwable $e) {
        $dbError = $e->getMessage();
    }
}

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OrangeSteps — Server Diagnostic</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 24px; line-height: 1.5; }
        .card { max-width: 800px; margin: 0 auto; background: #1e293b; border-radius: 12px; padding: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
        h1 { font-size: 1.5rem; margin-top: 0; color: #38bdf8; border-bottom: 1px solid #334155; padding-bottom: 12px; }
        h2 { font-size: 1.1rem; color: #94a3b8; margin-top: 24px; }
        .badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-weight: 600; font-size: 0.85rem; }
        .badge-success { background: #059669; color: #fff; }
        .badge-danger { background: #dc2626; color: #fff; }
        .badge-warning { background: #d97706; color: #fff; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 12px; margin-top: 12px; }
        .item { background: #0f172a; padding: 10px 14px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; font-size: 0.9rem; }
        .code { background: #000; color: #f43f5e; padding: 8px 12px; border-radius: 6px; font-family: monospace; font-size: 0.85rem; word-break: break-all; margin-top: 8px; }
        .btn { display: inline-block; background: #0284c7; color: #fff; text-decoration: none; padding: 8px 16px; border-radius: 6px; font-weight: 600; margin-top: 12px; }
        .btn:hover { background: #0369a1; }
        .btn-success { background: #059669; }
        .btn-success:hover { background: #047857; }
        .alert { background: #065f46; color: #ecfdf5; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-weight: 600; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 0.9rem; }
        th, td { text-align: left; padding: 8px 12px; border-bottom: 1px solid #334155; }
        th { background: #0f172a; color: #38bdf8; }
    </style>
</head>
<body>
<div class="card">
    <h1>OrangeSteps — Server Environment Diagnostic</h1>

    <?php if ($cacheClearedMessage): ?>
        <div class="alert"><?= htmlspecialchars($cacheClearedMessage) ?></div>
    <?php endif; ?>

    <?php if ($adminCreatedMessage): ?>
        <div class="alert"><?= htmlspecialchars($adminCreatedMessage) ?></div>
    <?php endif; ?>

    <h2>0. HTTP Authorization Header Diagnostic</h2>
    <p style="font-size:0.85rem; color:#94a3b8; margin-bottom: 8px;">
        Note: Visiting this page directly in a browser address bar will always show <code>NOT SET</code> because standard page navigations do not include Authorization Bearer tokens. Click below to test transmitting an Authorization header via JavaScript (Fetch API):
    </p>
    <button onclick="testAuthHeader()" class="btn" style="cursor:pointer; margin-bottom:12px;">Test Authorization Header via Fetch</button>
    <div id="header-test-result" style="display:none; margin-bottom:16px;"></div>

    <script>
    function testAuthHeader() {
        const resDiv = document.getElementById('header-test-result');
        resDiv.style.display = 'block';
        resDiv.innerHTML = '<span class="badge badge-warning">Sending test request...</span>';
        
        fetch('check-environment.php?action=test-header', {
            headers: {
                'Authorization': 'Bearer test_token_12345',
                'X-Authorization': 'Bearer test_token_12345'
            }
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                resDiv.innerHTML = '<div class="alert" style="background:#065f46; color:#ecfdf5;">SUCCESS! Server successfully received Authorization Header: <code>' + data.header + '</code></div>';
            } else {
                resDiv.innerHTML = '<div class="code">Header Test Failed: Server did not receive Authorization or X-Authorization header.</div>';
            }
        })
        .catch(err => {
            resDiv.innerHTML = '<div class="code">Error testing header: ' + err.message + '</div>';
        });
    }
    </script>

    <div class="item">
        <span>HTTP_AUTHORIZATION</span>
        <code><?= htmlspecialchars($_SERVER['HTTP_AUTHORIZATION'] ?? 'NOT SET (Normal for page visit)') ?></code>
    </div>
    <div class="item">
        <span>REDIRECT_HTTP_AUTHORIZATION</span>
        <code><?= htmlspecialchars($_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? 'NOT SET') ?></code>
    </div>
    <div class="item">
        <span>REDIRECT_REDIRECT_HTTP_AUTHORIZATION</span>
        <code><?= htmlspecialchars($_SERVER['REDIRECT_REDIRECT_HTTP_AUTHORIZATION'] ?? 'NOT SET') ?></code>
    </div>
    <div class="item">
        <span>HTTP_X_AUTHORIZATION</span>
        <code><?= htmlspecialchars($_SERVER['HTTP_X_AUTHORIZATION'] ?? 'NOT SET') ?></code>
    </div>

    <h2>1. Bootstrap Config Cache</h2>
    <div class="item">
        <span>Laravel Cached Config File (<code>bootstrap/cache/config.php</code>)</span>
        <span class="badge <?= $hasConfigCache ? 'badge-warning' : 'badge-success' ?>">
            <?= $hasConfigCache ? 'CACHED (May override .env)' : 'No Cache (Uses active .env)' ?>
        </span>
    </div>
    <?php if ($hasConfigCache): ?>
        <p style="font-size:0.85rem; color:#cbd5e0; margin-top:6px;">
            Warning: A stale <code>bootstrap/cache/config.php</code> is overriding your <code>.env</code> database settings. Click below to clear it.
        </p>
        <a href="check-environment.php?action=clear-cache" class="btn">Clear Bootstrap Cache Now</a>
    <?php endif; ?>

    <h2>2. PHP Version</h2>
    <div class="item">
        <span>PHP Version Required: <strong>&ge; 8.2.0</strong> (Current: <strong><?= htmlspecialchars($phpVersion) ?></strong>)</span>
        <span class="badge <?= $phpVersionOk ? 'badge-success' : 'badge-danger' ?>">
            <?= $phpVersionOk ? 'OK' : 'OUTDATED (Upgrade PHP in cPanel)' ?>
        </span>
    </div>

    <h2>3. Required PHP Extensions (cPanel > Select PHP Version)</h2>
    <div class="grid">
        <?php foreach ($extensionStatus as $ext => $info): ?>
            <div class="item">
                <span><?= htmlspecialchars($info['label']) ?> (<code><?= htmlspecialchars($ext) ?></code>)</span>
                <span class="badge <?= $info['loaded'] ? 'badge-success' : 'badge-danger' ?>">
                    <?= $info['loaded'] ? 'Enabled' : 'MISSING' ?>
                </span>
            </div>
        <?php endforeach; ?>
    </div>

    <h2>4. Writable Storage Directories</h2>
    <div class="grid">
        <?php foreach ($writableDirs as $dir => $isWritable): ?>
            <div class="item">
                <span><code><?= htmlspecialchars($dir) ?></code></span>
                <span class="badge <?= $isWritable ? 'badge-success' : 'badge-danger' ?>">
                    <?= $isWritable ? 'Writable' : 'Not Writable (755 required)' ?>
                </span>
            </div>
        <?php endforeach; ?>
    </div>

    <h2>5. Database & Environment (.env)</h2>
    <div class="item">
        <span>Environment File (<code>.env</code>)</span>
        <span class="badge <?= $envExists ? 'badge-success' : 'badge-danger' ?>">
            <?= $envExists ? 'Found' : 'Missing' ?>
        </span>
    </div>
    <div class="item" style="margin-top:8px;">
        <span>Direct MySQL Connection (User: <code><?= htmlspecialchars($parsedUser) ?></code> / DB: <code><?= htmlspecialchars($parsedDb) ?></code>)</span>
        <span class="badge <?= $dbConnected ? 'badge-success' : 'badge-danger' ?>">
            <?= $dbConnected ? 'Connected' : 'Connection Failed' ?>
        </span>
    </div>
    <?php if ($dbError): ?>
        <div class="code">Error: <?= htmlspecialchars($dbError) ?></div>
    <?php endif; ?>

    <?php if ($dbConnected): ?>
        <h2>6. Database Table Record Summary</h2>
        <div class="grid">
            <?php foreach ($tableCounts as $tName => $cVal): ?>
                <div class="item">
                    <span><code><?= htmlspecialchars($tName) ?></code></span>
                    <span class="badge <?= is_numeric($cVal) && $cVal > 0 ? 'badge-success' : 'badge-warning' ?>">
                        <?= htmlspecialchars($cVal) ?> records
                    </span>
                </div>
            <?php endforeach; ?>
        </div>

        <h2>7. Registered Users in Database</h2>
        <?php if (!empty($existingUsers)): ?>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Created At</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($existingUsers as $uRow): ?>
                        <tr>
                            <td><?= htmlspecialchars($uRow['id']) ?></td>
                            <td><?= htmlspecialchars($uRow['name']) ?></td>
                            <td><code><?= htmlspecialchars($uRow['email']) ?></code></td>
                            <td><span class="badge badge-success"><?= htmlspecialchars($uRow['role']) ?></span></td>
                            <td><?= htmlspecialchars($uRow['created_at']) ?></td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        <?php else: ?>
            <p style="color: #f87171; font-weight: 600;">No registered users found in the database!</p>
        <?php endif; ?>

        <div style="margin-top:16px; display:flex; gap:10px; flex-wrap:wrap;">
            <a href="check-environment.php?action=create-md" class="btn btn-success">
                Create / Reset MD User (md@orangesteps.in / orangesteps)
            </a>
        </div>
    <?php endif; ?>

</div>
</body>
</html>
