import { useState, useRef } from 'react';
import { sporaeClient, type ServerFile } from '@/lib/sporae';
import { useSporaeProfile, useSporaeFiles, useSporaeLogout } from '@/lib/hooks/use-sporae';
import { toast } from 'sonner';

import LoadingPage from '@/pages/loading';

import { BrandLogo } from '@/components/ui/brand-logo';
import { UserProfile } from '@/pages/main/components/user-profile';
import { FileBreadcrumbs } from '@/pages/main/components/file-breadcrumbs';
import { FileToolbar } from '@/pages/main/components/file-toolbar';
import { FileList } from '@/pages/main/components/file-list';
import { CreateFolderDialog } from '@/pages/main/components/create-folder-dialog';
import { DeleteFileDialog } from '@/pages/main/components/delete-file-dialog';
import { Card } from '@/components/ui/card';
import LoginPage from '../login';

export default function MainPage() {
  const [currentPath, setCurrentPath] = useState('/');
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [renamingFile, setRenamingFile] = useState<ServerFile | null>(null);
  const [renamingName, setRenamingName] = useState('');
  const [fileToDelete, setFileToDelete] = useState<ServerFile | null>(null);

  const {
    data: userProfile,
    isLoading: isProfileLoading,
    error: profileError,
  } = useSporaeProfile();

  const {
    data: files = [],
    isLoading: isFilesLoading,
    error: filesError,
    refetch: refetchFiles,
  } = useSporaeFiles(currentPath);

  const logout = useSporaeLogout();

  const navigateTo = (path: string) => {
    setCurrentPath(path);
  };

  const handleCreateFolder = () => {
    setNewFolderName('');
    setIsCreateFolderOpen(true);
  };

  const handleCreateFolderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName) return;

    try {
      await sporaeClient.mkdir(`${currentPath === '/' ? '' : currentPath}/${newFolderName}`);
      toast.success('Folder created');
      refetchFiles();
      setIsCreateFolderOpen(false);
    } catch (error) {
      console.error('Failed to create folder:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create folder');
    }
  };

  const handleRenameFile = (file: ServerFile) => {
    setRenamingFile(file);
    setRenamingName(file.name);
  };

  const handleRenameCancel = () => {
    setRenamingFile(null);
    setRenamingName('');
  };

  const handleRenameSubmit = async () => {
    if (!renamingFile || !renamingName || renamingName === renamingFile.name) {
      handleRenameCancel();
      return;
    }

    try {
      const parentPath = renamingFile.path.split('/').slice(0, -1).join('/') || '/';
      const newPath = `${parentPath === '/' ? '' : parentPath}/${renamingName}`;
      await sporaeClient.mv(renamingFile.path, newPath);
      toast.success('File renamed');
      refetchFiles();
    } catch (error) {
      console.error('Failed to rename file:', error);
      toast.error('Failed to rename file');
    } finally {
      handleRenameCancel();
    }
  };

  const handleDeleteClick = (file: ServerFile) => {
    setFileToDelete(file);
  };

  const handleDeleteConfirm = async () => {
    if (!fileToDelete) return;

    try {
      await sporaeClient.rm(fileToDelete.path);
      toast.success('File deleted');
      refetchFiles();
    } catch (error) {
      console.error('Failed to delete file:', error);
      toast.error('Failed to delete file');
    } finally {
      setFileToDelete(null);
    }
  };

  const handleUploadClick = () => {
    uploadInputRef.current?.click();
  };

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const toastId = toast.loading('Uploading files...');
    for (const file of Array.from(files)) {
      try {
        await sporaeClient.write(`${currentPath === '/' ? '' : currentPath}/${file.name}`, file);
      } catch (err) {
        console.error(err);
        toast.error(`Failed to upload ${file.name}`, { id: toastId });
      }
    }
    toast.success('Upload complete', { id: toastId });
    refetchFiles();
    if (uploadInputRef.current) uploadInputRef.current.value = '';
  };

  const handleFileClick = async (file: ServerFile) => {
    try {
      const blob = await sporaeClient.read(file.path, true);
      const finalBlob = new Blob([blob], { type: file.content_type || blob.type });
      const url = window.URL.createObjectURL(finalBlob);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Failed to read file:', error);
      toast.error('Failed to open file');
    }
  };

  const handleFileDownload = async (e: React.MouseEvent | undefined, file: ServerFile) => {
    e?.stopPropagation();
    try {
      const blob = await sporaeClient.read(file.path, false);
      const finalBlob = blob.type ? blob : new Blob([blob], { type: file.content_type });
      const url = window.URL.createObjectURL(finalBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download file:', error);
      toast.error('Failed to download file');
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (isProfileLoading) {
    return <LoadingPage message="Initializing..." />;
  }

  if (profileError || !userProfile) {
    return <LoginPage />;
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <BrandLogo />
      <UserProfile userProfile={userProfile} onLogout={handleLogout} />

      <main className="flex-1 flex flex-col min-h-0 container mx-auto p-6 pt-24 max-w-8xl">
        <input
          type="file"
          ref={uploadInputRef}
          className="hidden"
          onChange={handleUploadFile}
          multiple
        />
        <Card className="overflow-hidden flex flex-col flex-1 min-h-0 gap-0 p-0">
          <FileBreadcrumbs currentPath={currentPath} onNavigate={navigateTo} />

          <FileToolbar
            itemCount={files.length}
            onCreateFolder={handleCreateFolder}
            onUploadClick={handleUploadClick}
          />

          <FileList
            files={files}
            isLoading={isFilesLoading}
            error={filesError}
            currentPath={currentPath}
            onNavigate={navigateTo}
            onRefresh={refetchFiles}
            onRename={handleRenameFile}
            onDelete={handleDeleteClick}
            onUpload={handleUploadClick}
            onCreateFolder={handleCreateFolder}
            renamingFile={renamingFile}
            renamingName={renamingName}
            setRenamingName={setRenamingName}
            onRenameSubmit={handleRenameSubmit}
            onRenameCancel={handleRenameCancel}
            onFileClick={handleFileClick}
            onDownload={handleFileDownload}
          />
        </Card>
      </main>

      <CreateFolderDialog
        open={isCreateFolderOpen}
        onOpenChange={setIsCreateFolderOpen}
        onSubmit={handleCreateFolderSubmit}
        folderName={newFolderName}
        setFolderName={setNewFolderName}
      />

      <DeleteFileDialog
        file={fileToDelete}
        onOpenChange={open => !open && setFileToDelete(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
