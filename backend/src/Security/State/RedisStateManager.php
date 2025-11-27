<?php

declare(strict_types=1);

namespace App\Security\State;

use Redis;
use RuntimeException;
use SensitiveParameter;
use Throwable;

class RedisStateManager implements StateManagerInterface
{
    public function __construct(
        private Redis $redis,
        private int $keyLength,
        private string $keyPrefix,
        private int $ttl,
    ) {
    }

    public function generateKey(): string
    {
        do {
            $key = bin2hex(random_bytes($this->keyLength));
        } while ($result = $this->redis->exists($this->keyPrefix . $key));

        if (false === $result) {
            throw new RuntimeException('Could not connect to KeyValue store.');
        }

        return $key;
    }

    private function isKeyValid(string $key): bool
    {
        return \strlen($key) !== $this->keyLength || !ctype_xdigit($key) || $key !== strtolower($key);
    }

    public function isUserKeyValid(#[SensitiveParameter]string $key): bool
    {
        return $this->isKeyValid($key) && $this->redis->exists($this->keyPrefix . $key);
    }

    public function get(#[SensitiveParameter]string $key): mixed
    {
        if (!$this->isKeyValid($key)) {
            return null;
        }

        $data = $this->redis->get($this->keyPrefix . $key);

        if (false === $data || !json_validate($data)) {
            return null;
        }

        return json_decode($data, true);
    }

    public function set(#[SensitiveParameter]string $key, mixed $data): bool
    {
        $ttl = $this->ttl ?? (int)\ini_get('session.gc_maxlifetime');

        return false !== $this->redis->setEx($this->keyPrefix . $key, $ttl, json_encode($data));
    }

    public function destroy(string $key): bool
    {
        static $unlink = true;

        if ($unlink) {
            try {
                $unlink = false !== $this->redis->unlink($this->keyPrefix . $key);
            } catch (Throwable) {
                $unlink = false;
            }
        }

        if (!$unlink) {
            $this->redis->del($this->keyPrefix . $key);
        }

        return true;
    }
}
