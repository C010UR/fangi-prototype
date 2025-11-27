<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\Server;
use App\Entity\User;
use App\Model\MFA\EmailTwoFactorInterface;
use App\Model\UserActionToken\UserActionToken;
use SensitiveParameter;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class MailerService
{
    public function __construct(
        private MailerInterface $mailer,
        private TranslatorInterface $translator,
    ) {
    }

    public function sendEmailMfa(EmailTwoFactorInterface $user, string $subject, string $template): void
    {
        $mfa = $user->getEmailMFA();

        $email = new TemplatedEmail()
            ->to($mfa->getRecipient())
            ->subject($this->translator->trans($subject, domain: 'emails'))
            ->htmlTemplate($template)
            ->context([
                'name' => $user->getUsername(),
                'code' => $mfa->getAuthCode(),
                'sent_at' => $mfa->getLastCodeSentAt(),
                'expires_in' =>  $mfa->getLastCodeSentAt()->diff($mfa->getLastCodeExpiresAt()),
                'expires_at' => $mfa->getLastCodeExpiresAt(),
            ]);

        $this->mailer->send($email);
    }

    public function sendPasswordResetEmail(
        #[SensitiveParameter]
        UserActionToken $token,
        User $user,
        string $url,
        string $subject,
        string $template,
    ): void {
        $email = new TemplatedEmail()
            ->to($user->getEmail())
            ->subject($this->translator->trans($subject, domain: 'emails'))
            ->htmlTemplate($template)
            ->context([
                'name' => $user->getUsername(),
                'url' => $url,
                'sent_at' => $token->getGeneratedAt(),
                'expires_in' => $token->getExpiresIn(),
                'expires_at' => $token->getExpiresAt(),
            ]);

        $this->mailer->send($email);
    }

    public function sendAccountActivationEmail(
        #[SensitiveParameter]
        UserActionToken $token,
        User $user,
        Server $server,
        string $url,
        string $subject,
        string $template,
    ): void {
        $email = new TemplatedEmail()
            ->to($user->getEmail())
            ->subject($this->translator->trans($subject, domain: 'emails'))
            ->htmlTemplate($template)
            ->context([
                'name' => $user->getUsername(),
                'created_by_name' => $server->getCreatedByFormattedName(),
                'server_name' => $server->getName(),
                'url' => $url,
                'sent_at' => $token->getGeneratedAt(),
            ]);

        $this->mailer->send($email);
    }

    public function sendAccountRegistrationEmail(
        #[SensitiveParameter]
        UserActionToken $token,
        User $user,
        string $url,
        string $subject,
        string $template,
    ): void {
        $email = new TemplatedEmail()
            ->to($user->getEmail())
            ->subject($this->translator->trans($subject, domain: 'emails'))
            ->htmlTemplate($template)
            ->context([
                'name' => $user->getUsername(),
                'url' => $url,
                'sent_at' => $token->getGeneratedAt(),
            ]);

        $this->mailer->send($email);
    }
}
