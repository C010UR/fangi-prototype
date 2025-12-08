<?php

declare(strict_types=1);

namespace App\Controller;

use App\Controller\Abstract\ExtendedAbstractController;
use App\OpenApi\Attribute as OAC;
use App\Service\FileService;
use Doctrine\ORM\EntityManagerInterface;
use OpenApi\Attributes as OA;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/v1', name: 'api_v1_file_')]
class FileController extends ExtendedAbstractController
{
    public function __construct(
        private FileService $fileService,
        private EntityManagerInterface $entityManager,
    ) {
    }

    private function normalizePath(string $path): string
    {
        return '/' . ltrim($path, '/');
    }

    #[Route('/ls/{path}', name: 'list', requirements: ['path' => '.*'], defaults: ['path' => '/'], methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    #[OA\Get(
        operationId: 'v1FileList',
        summary: 'List files',
        tags: [
            'files',
        ],
        parameters: [
            new OA\Parameter(
                name: 'path',
                in: 'path',
                description: 'File path.',
                required: false,
                schema: new OA\Schema(type: 'string', example: '/path/to/file.txt'),
            ),
        ],
        responses: [
            new OAC\JsonResponse(
                response: 200,
                description: 'Successfully listed files.',
                type: 'array',
                items: new OA\Items(
                    ref: '#/components/schemas/ServerFile',
                ),
            ),
            new OAC\UnauthorizedResponse(),
            new OAC\BadRequestResponse(),
            new OAC\AccessDeniedResponse(),
            new OAC\InternalServerErrorResponse(),
        ],
    )]
    public function list(string $path): JsonResponse
    {
        $files = $this->fileService->list($this->normalizePath($path));

        return $this->jsonl($files);
    }

    #[Route('/head/{path}', name: 'head', requirements: ['path' => '.+'], methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    #[OA\Get(
        operationId: 'v1FileHead',
        summary: 'Get file Header',
        tags: [
            'files',
        ],
        parameters: [
            new OA\Parameter(
                name: 'path',
                in: 'path',
                description: 'File path.',
                required: false,
                schema: new OA\Schema(type: 'string', example: '/path/to/file.txt'),
            ),
        ],
        responses: [
            new OAC\JsonResponse(
                response: 200,
                description: 'Successfully retrieved file information.',
                schema: '#/components/schemas/ServerFile',
            ),
            new OAC\UnauthorizedResponse(),
            new OAC\BadRequestResponse(),
            new OAC\AccessDeniedResponse(),
            new OAC\InternalServerErrorResponse(),
        ],
    )]
    public function head(string $path): JsonResponse
    {
        $file = $this->fileService->head($this->normalizePath($path));

        return $this->jsonl($file);
    }

    #[Route('/read/{path}', name: 'read', requirements: ['path' => '.+'], methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    #[OA\Get(
        operationId: 'v1FileRead',
        summary: 'Read file',
        tags: [
            'files',
        ],
        parameters: [
            new OA\Parameter(
                name: 'path',
                in: 'path',
                description: 'File path.',
                required: false,
                schema: new OA\Schema(type: 'string', example: '/path/to/file.txt'),
            ),
            new OA\Parameter(
                name: 'inline',
                in: 'query',
                description: 'Inline file.',
                required: false,
                schema: new OA\Schema(type: 'boolean', example: true),
            ),
        ],
        responses: [
            new OAC\BinaryFileResponse(
                response: 200,
                description: 'Successfully read file.',
            ),
            new OAC\UnauthorizedResponse(),
            new OAC\BadRequestResponse(),
            new OAC\AccessDeniedResponse(),
            new OAC\InternalServerErrorResponse(),
        ],
    )]
    public function read(Request $request, string $path): BinaryFileResponse
    {
        $path = $this->normalizePath($path);
        $fullPath = $this->fileService->read($path);

        $response = new BinaryFileResponse($fullPath);

        if ($request->query->getBoolean('inline', false)) {
            $response->setContentDisposition(ResponseHeaderBag::DISPOSITION_INLINE, basename($path));
        } else {
            $response->setContentDisposition(ResponseHeaderBag::DISPOSITION_ATTACHMENT, basename($path));
        }

        return $response;
    }

    #[Route('/mkdir/{path}', name: 'mkdir', requirements: ['path' => '.+'], methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    #[OA\Post(
        operationId: 'v1FileMkdir',
        summary: 'Create directory',
        tags: [
            'files',
        ],
        parameters: [
            new OA\Parameter(
                name: 'path',
                in: 'path',
                description: 'File path.',
                required: false,
                schema: new OA\Schema(type: 'string', example: '/path/to/file.txt'),
            ),
        ],
        responses: [
            new OAC\JsonResponse(
                response: 200,
                description: 'Successfully created directory.',
                schema: '#/components/schemas/ServerFile',
            ),
            new OAC\UnauthorizedResponse(),
            new OAC\BadRequestResponse(),
            new OAC\AccessDeniedResponse(),
            new OAC\InternalServerErrorResponse(),
        ],
    )]
    public function mkdir(string $path): JsonResponse
    {
        $file = $this->fileService->createDirectory($this->normalizePath($path));
        $this->entityManager->flush();

        return $this->jsonl($file);
    }

    #[Route('/write/{path}', name: 'write', requirements: ['path' => '.+'], methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    #[OA\Post(
        operationId: 'v1FileWrite',
        summary: 'Write file',
        tags: [
            'files',
        ],
        parameters: [
            new OA\Parameter(
                name: 'path',
                in: 'path',
                description: 'File path.',
                required: false,
                schema: new OA\Schema(type: 'string', example: '/path/to/file.txt'),
            ),
        ],
        responses: [
            new OAC\JsonResponse(
                response: 200,
                description: 'Successfully written file.',
                schema: '#/components/schemas/ServerFile',
            ),
            new OAC\UnauthorizedResponse(),
            new OAC\BadRequestResponse(),
            new OAC\AccessDeniedResponse(),
            new OAC\InternalServerErrorResponse(),
        ],
    )]
    public function touch(Request $request, string $path): JsonResponse
    {
        /** @var UploadedFile|null $file */
        $file = $request->files->get('file');

        if (!$file instanceof UploadedFile) {
            throw new BadRequestHttpException('file.no_file_provided');
        }

        $file = $this->fileService->createFile($this->normalizePath($path), $file);
        $this->entityManager->flush();

        return $this->jsonl($file);
    }

    #[Route('/rm/{path}', name: 'delete', requirements: ['path' => '.+'], methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    #[OA\Post(
        operationId: 'v1FileDelete',
        summary: 'Delete file',
        tags: [
            'files',
        ],
        parameters: [
            new OA\Parameter(
                name: 'path',
                in: 'path',
                description: 'File path.',
                required: false,
                schema: new OA\Schema(type: 'string', example: '/path/to/file.txt'),
            ),
        ],
        responses: [
            new OAC\JsonResponse(
                response: 200,
                description: 'Empty response.',
            ),
            new OAC\UnauthorizedResponse(),
            new OAC\BadRequestResponse(),
            new OAC\AccessDeniedResponse(),
            new OAC\InternalServerErrorResponse(),
        ],
    )]
    public function delete(string $path): JsonResponse
    {
        $this->fileService->delete($this->normalizePath($path));
        $this->entityManager->flush();

        return $this->jsonl(null);
    }

    #[Route('/mv/{path}:{newPath}', name: 'move', requirements: ['path' => '[^:]+', 'newPath' => '.+'], methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    #[OA\Post(
        operationId: 'v1FileMove',
        summary: 'Move file',
        tags: [
            'files',
        ],
        parameters: [
            new OA\Parameter(
                name: 'path',
                in: 'path',
                description: 'File path.',
                required: false,
                schema: new OA\Schema(type: 'string', example: '/path/to/file.txt'),
            ),
            new OA\Parameter(
                name: 'newPath',
                in: 'path',
                description: 'New file path.',
                required: false,
                schema: new OA\Schema(type: 'string', example: '/path/to/file.txt'),
            ),
        ],
        responses: [
            new OAC\JsonResponse(
                response: 200,
                description: 'Successfully moved file.',
                schema: '#/components/schemas/ServerFile',
            ),
            new OAC\UnauthorizedResponse(),
            new OAC\BadRequestResponse(),
            new OAC\AccessDeniedResponse(),
            new OAC\InternalServerErrorResponse(),
        ],
    )]
    public function move(string $path, string $newPath): JsonResponse
    {
        $file = $this->fileService->move($this->normalizePath($path), $this->normalizePath($newPath));
        $this->entityManager->flush();

        return $this->jsonl($file);
    }

    #[Route('/cp/{path}:{newPath}', name: 'copy', requirements: ['path' => '[^:]+', 'newPath' => '.+'], methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    #[OA\Post(
        operationId: 'v1FileCopy',
        summary: 'Copy file',
        tags: [
            'files',
        ],
        parameters: [
            new OA\Parameter(
                name: 'path',
                in: 'path',
                description: 'File path.',
                required: false,
                schema: new OA\Schema(type: 'string', example: '/path/to/file.txt'),
            ),
            new OA\Parameter(
                name: 'newPath',
                in: 'path',
                description: 'New file path.',
                required: false,
                schema: new OA\Schema(type: 'string', example: '/path/to/file.txt'),
            ),
        ],
        responses: [
            new OAC\JsonResponse(
                response: 200,
                description: 'Successfully copied file.',
                schema: '#/components/schemas/ServerFile',
            ),
            new OAC\UnauthorizedResponse(),
            new OAC\BadRequestResponse(),
            new OAC\AccessDeniedResponse(),
            new OAC\InternalServerErrorResponse(),
        ],
    )]
    public function copy(string $path, string $newPath): JsonResponse
    {
        $file = $this->fileService->copy($this->normalizePath($path), $this->normalizePath($newPath));
        $this->entityManager->flush();

        return $this->jsonl($file);
    }
}
