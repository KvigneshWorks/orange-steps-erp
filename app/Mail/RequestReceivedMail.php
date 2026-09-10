<?php

namespace App\Mail;

use App\Models\UserApprovalRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class RequestReceivedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public UserApprovalRequest $approvalRequest,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'We got your request — WhiteNode ERP',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.request-received',
            with: [
                'req' => $this->approvalRequest,
            ],
        );
    }
}
