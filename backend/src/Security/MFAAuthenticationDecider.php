<?php

declare(strict_types=1);

namespace App\Security;

use App\Entity\User;
use App\Enum\MfaType;
use App\Util\Environment;
use LogicException;
use Scheb\TwoFactorBundle\Security\Authentication\Token\TwoFactorTokenInterface;
use Scheb\TwoFactorBundle\Security\TwoFactor\AuthenticationContextInterface;
use Scheb\TwoFactorBundle\Security\TwoFactor\Condition\TwoFactorConditionInterface;
use Scheb\TwoFactorBundle\Security\TwoFactor\Provider\TwoFactorProviderDeciderInterface;

class MFAAuthenticationDecider implements TwoFactorConditionInterface, TwoFactorProviderDeciderInterface
{
    public function shouldPerformTwoFactorAuthentication(AuthenticationContextInterface $context): bool
    {
        $request = $context->getRequest();
        $user = $context->getUser();

        if (!($user instanceof User)) {
            return false;
        }

        if (Environment::isDev() && $request->query->has('ignore-mfa') && $request->query->getBoolean('ignore-mfa')) {
            return false;
        }

        return null !== $user->getPriorityMfaMethod();
    }

    public function getPreferredTwoFactorProvider(
        array $activeProviders,
        TwoFactorTokenInterface $token,
        AuthenticationContextInterface $context,
    ): ?string {
        $user = $context->getUser();

        if (!($user instanceof User)) {
            return null;
        }

        $primaryMfaMethod = $user->getPriorityMfaMethod();

        if (null === $primaryMfaMethod) {
            throw new LogicException('Deciding preferred MFA method for user without MFA.');
        }

        $provider = MfaType::toFullName($primaryMfaMethod->getMethod());

        if (!\in_array($provider, $activeProviders, true)) {
            throw new LogicException(\sprintf('Provider "%s" is not valid. Please check Security extension configuration', $provider));
        }

        return $provider;
    }
}
