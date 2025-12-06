<?php

declare(strict_types=1);

namespace App\Security\PasswordReset;

use App\Model\UserActionToken\UserActionTokenComponents;
use DateTimeInterface;

class PasswordResetTokenGenerator
{
    public function __construct(
        private string $signingKey,
        private int $selectorLength,
        private int $verifierLength,
    ) {
    }

    public function getRandomAlphaNumStr(int $length = 20): string
    {
        $string = '';

        while (($len = \strlen($string)) < $length) {
            /** @var int<1, max> $size */
            $size = 20 - $len;

            $bytes = random_bytes($size);

            $string .= substr(
                str_replace(['/', '+', '='], '', base64_encode($bytes)),
                0,
                $size,
            );
        }

        return $string;
    }

    /**
     * Get a cryptographically secure token with it's non-hashed components.
     *
     * @param ?string $verifier Only required for token comparison
     */
    public function createToken(
        int|string $userId,
        ?DateTimeInterface $expiresAt = null,
        ?string $verifier = null,
    ): UserActionTokenComponents {
        if (null === $verifier) {
            $verifier = $this->getRandomAlphaNumStr($this->verifierLength);
        }

        $selector = $this->getRandomAlphaNumStr($this->selectorLength);

        if (null === $expiresAt) {
            $encodedData = json_encode([$verifier, $userId]);
        } else {
            $encodedData = json_encode([$verifier, $userId, $expiresAt->getTimestamp()]);
        }

        return new UserActionTokenComponents(
            $selector,
            $verifier,
            $this->getHashedToken($encodedData),
        );
    }

    private function getHashedToken(string $data): string
    {
        return base64_encode(hash_hmac('sha256', $data, $this->signingKey, true));
    }
}
