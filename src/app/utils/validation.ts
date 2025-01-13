
export const allowedFileTypes = [
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/jpg",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain"
  ] as const;

  export type AllowedFileType = typeof allowedFileTypes[number];

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

  export function validateFileType(file: File): boolean {
    return allowedFileTypes.includes(file.type as AllowedFileType);
  }

  export function validateFileSize(file: File): boolean {
    return file.size <= MAX_FILE_SIZE;
  }
  
  export function getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  }

  export function generateSecureFileName(originalName: string): string {
    const extension = getFileExtension(originalName);
    const randomString = crypto.randomUUID();
    return `${randomString}.${extension}`;
  }