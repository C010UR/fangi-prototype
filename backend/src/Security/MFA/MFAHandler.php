<?php

declare(strict_types=1);

namespace App\Security\MFA;

use App\Enum\MfaType;
use App\Model\MFA\EmailTwoFactorInterface;
use LogicException;
use Scheb\TwoFactorBundle\Security\Authentication\Token\TwoFactorTokenInterface;
use Scheb\TwoFactorBundle\Security\TwoFactor\Provider\PreparationRecorderInterface;
use Scheb\TwoFactorBundle\Security\TwoFactor\Provider\TwoFactorProviderRegistry;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use UnexpectedValueException;

class MFAHandler
{
    public function __construct(
        private TwoFactorProviderRegistry $providerRegistry,
        private PreparationRecorderInterface $preparationRecorder,
        private string $emailProvider,
    ) {
    }

    private function validateToken(TokenInterface $token): TwoFactorTokenInterface
    {
        if (!($token instanceof TwoFactorTokenInterface)) {
            throw new UnexpectedValueException(\sprintf('Cannot prepare MFA for a "%s" token because it is not a "%s".', $token::class, TwoFactorTokenInterface::class));
        }

        $user = $token->getUser();

        if (!$user) {
            throw new UnexpectedValueException(\sprintf('Cannot preapre MFA for a "%s" token because it doesn\'t store a user.', $token::class));
        }

        return $token;
    }

    public function sendCode(TokenInterface $token, string $method): ?array
    {
        $token = $this->validateToken($token);
        $user = $token->getUser();
        $mfa = null;
        $providerName = null;

        switch ($method) {
            case MfaType::Email->value:
                if (!($user instanceof EmailTwoFactorInterface) || !$this->emailProvider) {
                    return null;
                }

                $mfa = $user->getEmailMFA();
                $providerName = $this->emailProvider;
                break;
            default:
                return null;
        }

        $firewallName = $token->getFirewallName();
        $this->providerRegistry->getProvider($providerName)->prepareAuthentication($user);
        $this->preparationRecorder->setTwoFactorProviderPrepared($firewallName, $providerName);

        if (!$mfa->getLastCodeSentAt() || !$mfa->getLastCodeExpiresAt()) {
            throw new LogicException('MFA process did not start.');
        }

        return [
            'sent_at' => $mfa->getLastCodeSentAt(),
        ];
    }
}
