<?php

namespace App\Mail;

use App\Models\UserApprovalRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ApprovalGrantedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public UserApprovalRequest $approvalRequest,
        public string $loginUrl,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "You're approved — welcome to WhiteNode ERP",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.approval-granted',
            with: [
                'req'      => $this->approvalRequest,
                'loginUrl' => $this->loginUrl,
            ],
        );
    }
}
