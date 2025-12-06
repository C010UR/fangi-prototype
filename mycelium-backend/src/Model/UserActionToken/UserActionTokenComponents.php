<?php

declare(strict_types=1);

namespace App\Model\UserActionToken;

class UserActionTokenComponents
{
    public function __construct(
        private string $selector,
        private string $verifier,
        private string $hashedToken,
    ) {
    }

    /**
     * @return string Non-hashed random string used to fetch request objects from persistence
     */
    public function getSelector(): string
    {
        return $this->selector;
    }

    /**
     * @return string The hashed non-public token used to validate reset password requests
     */
    public function getHashedToken(): string
    {
        return $this->hashedToken;
    }

    /**
     * The public token consists of a concatenated random non-hashed selector string and random non-hashed verifier string.
     */
    public function getPublicToken(): string
    {
        return $this->selector . $this->verifier;
    }
}
