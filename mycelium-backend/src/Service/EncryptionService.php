<?php

declare(strict_types=1);

namespace App\Service;

use Exception;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use SensitiveParameter;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

class EncryptionService
{
    public const int HASH_ITERATIONS = 5000;
    public const string HASH_ALGORITHM = 'sha512';

    private string $jwtPrivateKeyContents;
    private string $jwtPublicKeyContents;
    private string $iv;

    public function __construct(
        #[Autowire(param: 'mycelium.jwt.private_key')]
        private string $jwtPrivateKey,
        #[Autowire(param: 'mycelium.jwt.public_key')]
        private string $jwtPublicKey,
        #[Autowire(param: 'mycelium.jwt.algorithm')]
        private string $jwtAlgorithm,
        #[Autowire(param: 'kernel.secret')]
        private string $appSecret,
    ) {
        $this->jwtPrivateKeyContents = file_get_contents($this->jwtPrivateKey);
        $this->jwtPublicKeyContents = file_get_contents($this->jwtPublicKey);
        $this->iv = substr(hash('sha256', $this->appSecret), 0, 16);
    }

    public function generateToken(): string
    {
        return $this->hash(bin2hex(random_bytes(128)) . $this->appSecret . microtime(), false);
    }

    public function hash(#[SensitiveParameter] string $token, bool $base64 = true): string
    {
        $salt = $this->appSecret;
        $salted = $token . '{' . $salt . '}';
        $digest = hash(self::HASH_ALGORITHM, $salted, true);

        for ($i = 1; $i < self::HASH_ITERATIONS; ++$i) {
            $digest = hash(self::HASH_ALGORITHM, $digest . $salted, true);
        }

        return $base64 ? base64_encode($digest) : bin2hex($digest);
    }

    public function encodeToken(array $payload): string
    {
        return JWT::encode($payload, $this->jwtPrivateKeyContents, $this->jwtAlgorithm);
    }

    public function decodeToken(string $token): array
    {
        return (array)JWT::decode($token, new Key($this->jwtPublicKeyContents, $this->jwtAlgorithm));
    }

    public function encrypt(string $data): string
    {
        return base64_encode(
            openssl_encrypt(
                $data,
                'aes-256-cbc',
                $this->appSecret,
                \OPENSSL_RAW_DATA,
                $this->iv,
            ),
        );
    }

    public function decrypt(string $data): string
    {
        return openssl_decrypt(
            base64_decode($data, true),
            'aes-256-cbc',
            $this->appSecret,
            \OPENSSL_RAW_DATA,
            $this->iv,
        );
    }

    public function getJwks(): array
    {
        $key = openssl_pkey_get_public($this->jwtPublicKeyContents);
        $details = openssl_pkey_get_details($key);

        if (!isset($details['rsa'])) {
            throw new Exception('Only RSA keys are supported for now.');
        }

        return [
            'keys' => [
                [
                    'kty' => 'RSA',
                    'alg' => 'RS256',
                    'use' => 'sig',
                    'kid' => $this->generateKid($this->jwtPublicKeyContents),
                    'n'   => $this->base64UrlEncode($details['rsa']['n']),
                    'e'   => $this->base64UrlEncode($details['rsa']['e']),
                ],
            ],
        ];
    }

    private function generateKid(string $key): string
    {
        return substr(hash('sha256', $key), 0, 16);
    }

    private function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }
}
