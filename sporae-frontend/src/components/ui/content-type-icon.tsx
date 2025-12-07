import {
  File,
  FileArchive,
  FileAudio,
  FileCode,
  FileCog,
  FileImage,
  FileText,
  FileVideo,
  Folder,
  type LucideProps,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ContentTypeIconProps extends LucideProps {
  contentType?: string;
}

export function ContentTypeIcon({ contentType, className, ...props }: ContentTypeIconProps) {
  const type = contentType?.toLowerCase() ?? '';

  if (type === 'directory' || type === 'inode/directory' || type === 'application/x-directory') {
    return <Folder className={cn('size-4 fill-current', className)} {...props} />;
  }

  if (type.startsWith('image/')) {
    return <FileImage className={cn('size-4', className)} {...props} />;
  }

  if (type.startsWith('video/')) {
    return <FileVideo className={cn('size-4', className)} {...props} />;
  }

  if (type.startsWith('audio/')) {
    return <FileAudio className={cn('size-4', className)} {...props} />;
  }

  if (type.startsWith('text/') || type === 'application/pdf') {
    if (
      [
        'text/html',
        'text/css',
        'text/javascript',
        'text/typescript',
        'text/x-python',
        'text/x-java-source',
        'text/x-c',
        'text/x-c++',
        'text/xml',
      ].some((t) => type.startsWith(t))
    ) {
      return <FileCode className={cn('size-4', className)} {...props} />;
    }
    return <FileText className={cn('size-4', className)} {...props} />;
  }

  if (
    [
      'application/json',
      'application/xml',
      'application/javascript',
      'application/typescript',
      'application/x-httpd-php',
    ].some((t) => type.startsWith(t))
  ) {
    return <FileCode className={cn('size-4', className)} {...props} />;
  }

  if (
    [
      'application/zip',
      'application/x-zip-compressed',
      'application/x-tar',
      'application/gzip',
      'application/x-7z-compressed',
      'application/x-rar-compressed',
      'application/x-bzip',
      'application/x-bzip2',
    ].some((t) => type.startsWith(t))
  ) {
    return <FileArchive className={cn('size-4', className)} {...props} />;
  }

  if (
    [
      'application/x-msdownload',
      'application/x-apple-diskimage',
      'application/vnd.android.package-archive',
      'application/x-debian-package',
      'application/x-redhat-package-manager',
    ].some((t) => type.startsWith(t))
  ) {
    return <FileCog className={cn('size-4', className)} {...props} />;
  }

  return <File className={cn('size-4', className)} {...props} />;
}

