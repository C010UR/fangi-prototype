<?php

declare(strict_types=1);

namespace App\EventListener;

use App\Repository\UserRepository;
use App\Security\State\StateManagerInterface;
use ErrorException;
use InvalidArgumentException;
use RuntimeException;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\Event\ResponseEvent;
use Symfony\Component\Security\Core\Authentication\AuthenticationTrustResolverInterface;
use Symfony\Component\Security\Core\Authentication\Token\AbstractToken;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Exception\UnsupportedUserException;
use Symfony\Component\Security\Core\Exception\UserNotFoundException;
use Symfony\Component\Security\Core\User\EquatableInterface;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\User\UserProviderInterface;
use Symfony\Component\Security\Http\Event\TokenDeauthenticatedEvent;
use UnexpectedValueException;

class AuthenticationListener
{
    public function __construct(
        private TokenStorageInterface $tokenStorage,
        private StateManagerInterface $stateManager,
        private UserRepository $userRepository,
        private EventDispatcherInterface $dispatcher,
        private UserProviderInterface $userProvider,
        private AuthenticationTrustResolverInterface $trustResolver,
    ) {
    }

    #[AsEventListener(event: 'kernel.request', priority: 128)]
    public function onKernelRequest(RequestEvent $event): void
    {
        if (!$event->isMainRequest()) {
            return;
        }

        $request = $event->getRequest();

        $accessToken = null;
        $authorizationHeader = $request->headers->get('Authorization');

        if (null !== $authorizationHeader && str_starts_with($authorizationHeader, 'Bearer ')) {
            $rawToken = substr($authorizationHeader, 7);
            $accessToken = $this->stateManager->isUserKeyValid($rawToken) ? $rawToken : null;
        }

        if (null === $accessToken) {
            $accessToken = $this->stateManager->generateKey();
        }

        $request->attributes->set('_security_access_token', $accessToken);

        $token = $this->stateManager->get($accessToken);
        $token = \is_string($token) ? $token : null;

        if (null === $token) {
            $this->tokenStorage->setToken(null);

            return;
        }

        $token = $this->safelyUnserialize($token);

        if ($token instanceof TokenInterface) {
            if (!$token->getUser()) {
                throw new UnexpectedValueException(\sprintf('Cannot authenticate a "%s" token because it doesn\'t store a user.', $token::class));
            }

            $originalToken = $token;
            $token = $this->refreshUser($token);

            if (!$token) {
                $this->dispatcher?->dispatch(new TokenDeauthenticatedEvent($originalToken, $request));
            }
        } elseif (null !== $token) {
            $token = null;
        }

        $this->tokenStorage->setToken($token);
    }

    #[AsEventListener(event: 'kernel.response', priority: -1000)]
    public function onKernelResponse(ResponseEvent $event): void
    {
        if (!$event->isMainRequest()) {
            return;
        }

        $request = $event->getRequest();
        $accessToken = $request->attributes->get('_security_access_token');

        if (null === $accessToken) {
            return;
        }

        $token = $this->tokenStorage->getToken();

        if (!$this->trustResolver->isAuthenticated($token)) {
            $this->stateManager->destroy($accessToken);
        } else {
            $this->stateManager->set($accessToken, serialize($token));
        }
    }

    /**
     * Refreshes the user by reloading it from the user provider.
     *
     * @throws RuntimeException
     */
    private function refreshUser(TokenInterface $token): ?TokenInterface
    {
        $user = $token->getUser();

        $userClass = $user::class;

        if (!$this->userProvider instanceof UserProviderInterface) {
            throw new InvalidArgumentException(\sprintf('User provider "%s" must implement "%s".', get_debug_type($this->userProvider), UserProviderInterface::class));
        }

        if (!$this->userProvider->supportsClass($userClass)) {
            throw new RuntimeException(\sprintf('There is no user provider for user "%s". Shouldn\'t the "supportsClass()" method of your user provider return true for this classname?', $userClass));
        }

        try {
            $refreshedUser = $this->userProvider->refreshUser($user);
            $newToken = clone $token;
            $newToken->setUser($refreshedUser, false);

            // tokens can be deauthenticated if the user has been changed.
            if ($token instanceof AbstractToken && self::hasUserChanged($user, $newToken)) {
                return null;
            }

            $token->setUser($refreshedUser);

            return $token;
        } catch (UnsupportedUserException) {
            // let's try the next user provider
        } catch (UserNotFoundException $e) {
            return null;
        }
    }

    private function safelyUnserialize(string $serializedToken): mixed
    {
        $token = null;
        $prevUnserializeHandler = ini_set('unserialize_callback_func', __CLASS__ . '::handleUnserializeCallback');
        $prevErrorHandler = set_error_handler(function ($type, $msg, $file, $line, $context = []) use (&$prevErrorHandler) {
            if (__FILE__ === $file && !\in_array($type, [\E_DEPRECATED, \E_USER_DEPRECATED], true)) {
                throw new ErrorException($msg, 0x37313BC, $type, $file, $line);
            }

            return $prevErrorHandler ? $prevErrorHandler($type, $msg, $file, $line, $context) : false;
        });

        try {
            $token = unserialize($serializedToken);
        } catch (ErrorException $e) {
            if (0x37313BC !== $e->getCode()) {
                throw $e;
            }
        } finally {
            restore_error_handler();
            ini_set('unserialize_callback_func', $prevUnserializeHandler);
        }

        return $token;
    }

    private static function hasUserChanged(UserInterface $originalUser, TokenInterface $refreshedToken): bool
    {
        $refreshedUser = $refreshedToken->getUser();

        if ($originalUser instanceof EquatableInterface) {
            return !$originalUser->isEqualTo($refreshedUser);
        }

        if ($originalUser instanceof PasswordAuthenticatedUserInterface || $refreshedUser instanceof PasswordAuthenticatedUserInterface) {
            if (!$originalUser instanceof PasswordAuthenticatedUserInterface || !$refreshedUser instanceof PasswordAuthenticatedUserInterface) {
                return true;
            }

            $originalPassword = $originalUser->getPassword();
            $refreshedPassword = $refreshedUser->getPassword();

            if (
                null !== $originalPassword
                && $refreshedPassword !== $originalPassword
                && (8 !== \strlen($originalPassword) || hash('crc32c', $refreshedPassword ?? $originalPassword) !== $originalPassword)
            ) {
                return true;
            }
        }

        $refreshedRoles = array_map('strval', $refreshedUser->getRoles());
        $originalRoles = $refreshedToken->getRoleNames(); // This comes from cloning the original token, so it still contains the roles of the original user

        if (
            \count($refreshedRoles) !== \count($originalRoles)
            || \count($refreshedRoles) !== \count(array_intersect($refreshedRoles, $originalRoles))
        ) {
            return true;
        }

        if ($originalUser->getUserIdentifier() !== $refreshedUser->getUserIdentifier()) {
            return true;
        }

        return false;
    }

    /**
     * @internal
     */
    public static function handleUnserializeCallback(string $class): never
    {
        throw new ErrorException('Class not found: ' . $class, 0x37313BC);
    }
}
