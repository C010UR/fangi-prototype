<?php

declare(strict_types=1);

namespace App\Model\UserActionToken;

use DateInterval;
use DateTimeInterface;
use LogicException;
use RuntimeException;

class UserActionToken
{
    /** @param string|null $token selector + non-hashed verifier token */
    public function __construct(
        private ?string $token,
        private ?DateTimeInterface $expiresAt,
        private DateTimeInterface $generatedAt,
    ) {
    }

    /**
     * Returns the full token the user should use.
     *
     * Internally, this consists of two parts - the selector and
     * the hashed token - but that's an implementation detail
     * of how the token will later be parsed.
     */
    public function getToken(): string
    {
        if (null === $this->token) {
            throw new RuntimeException('The token property is not set. Calling getToken() after calling clearToken() is not allowed.');
        }

        return $this->token;
    }

    /**
     * Allow the token object to be safely persisted in a session.
     */
    public function clearToken(): void
    {
        $this->token = null;
    }

    public function getExpiresAt(): DateTimeInterface
    {
        return $this->expiresAt;
    }

    /**
     * Get the interval that the token is valid for.
     *
     * @throws LogicException
     *
     * @psalm-suppress PossiblyFalseArgument
     */
    public function getExpiresIn(): DateInterval
    {
        return $this->expiresAt->diff($this->generatedAt);
    }

    public function getGeneratedAt(): DateTimeInterface
    {
        return $this->generatedAt;
    }
}
