<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    // ── WhatsApp via Green API (free tier) ──────────────────────
    // Register free at https://console.green-api.com
    // Scan QR with your personal WhatsApp — no business account needed
    'whatsapp' => [
        'instance_id' => env('WHATSAPP_INSTANCE_ID'),
        'token'       => env('WHATSAPP_TOKEN'),
        'number'      => env('WHATSAPP_NUMBER'), // e.g. 919876543210
    ],

    // ── Account-approval flow ── who gets asked to approve/reject every
    // new user/admin/super_admin registration (AuthController@register).
    // Single person by design — see app/Http/Controllers/ApprovalController.php.
    'approver' => [
        'email'    => env('APPROVER_EMAIL'),
        'whatsapp' => env('APPROVER_WHATSAPP_NUMBER'), // digits only, with country code, e.g. 919698943833
    ],

    // ── Approval gate on/off switch ──────────────────────────────────
    // true  (default) = register() creates a pending UserApprovalRequest
    //                    and emails/WhatsApps the approver — the full
    //                    flow in ApprovalController.
    // false            = register() creates the User row directly and
    //                    logs the person in immediately, same as before
    //                    this feature existed. Nothing about the
    //                    approval flow is removed — ApprovalController,
    //                    the Mail/WhatsApp notify code, the migration,
    //                    the Pending Approvals screen, all of it stays
    //                    intact and unused. Flip REQUIRE_APPROVAL back
    //                    to true in .env to turn it back on, no code
    //                    changes needed either way.
    'approval' => [
        'required' => filter_var(env('REQUIRE_APPROVAL', true), FILTER_VALIDATE_BOOLEAN),
    ],

];
