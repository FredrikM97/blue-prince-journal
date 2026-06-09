export type FileAccessMode = "read" | "readwrite";

export interface FsDirectoryHandle {
  readonly name: string;
  getDirectoryHandle(name: string, options?: { create?: boolean }): Promise<FsDirectoryHandle>;
  getFileHandle(name: string, options?: { create?: boolean }): Promise<FsFileHandle>;
  values?(): AsyncIterable<FileSystemHandle>;
  removeEntry?(name: string, options?: { recursive?: boolean }): Promise<void>;
  queryPermission(descriptor: { mode: FileAccessMode }): Promise<PermissionState>;
  requestPermission(descriptor: { mode: FileAccessMode }): Promise<PermissionState>;
}

export interface FsFileHandle {
  getFile(): Promise<File>;
  createWritable(): Promise<{
    write(data: string | BufferSource | Blob): Promise<void>;
    close(): Promise<void>;
  }>;
}

declare global {
  interface Window {
    showDirectoryPicker(options?: {
      mode?: FileAccessMode;
      startIn?: FsDirectoryHandle;
    }): Promise<FsDirectoryHandle>;
  }
}
