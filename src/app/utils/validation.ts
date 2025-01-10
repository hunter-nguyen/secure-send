const allowedFileTypes = ["application/pdf", "image/png", "image/jpeg"];

export function validateFileType(file: File): boolean {
    return allowedFileTypes.includes(file.type);
}

export function validateFileSize(file: File): boolean {
    return file.size <= 10485760;
}