<?php

namespace App\Mail;

use App\Models\UserApprovalRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ApprovalRequestMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public UserApprovalRequest $approvalRequest,
        public string $reviewUrl,
    ) {}

    public function envelope(): Envelope
    {
        $roleLabel = ucwords(str_replace('_', ' ', $this->approvalRequest->role));

        return new Envelope(
            subject: "Approval needed: new {$roleLabel} request — {$this->approvalRequest->name}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.approval-request',
            with: [
                'req'       => $this->approvalRequest,
                'reviewUrl' => $this->reviewUrl,
            ],
        );
    }
}
