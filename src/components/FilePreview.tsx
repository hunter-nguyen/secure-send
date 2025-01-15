"use client"
interface FilePreviewProps {
    file: File;
    onUpload: () => void;
    onCancel: () => void;
}

export default function FilePreview({ file, onUpload, onCancel }: FilePreviewProps) {
    // Format bytes to readable size (e.g., "2.5 MB")
    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
    };

    return (
        <div className="border rounded-lg p-4 mt-4">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold text-black">File name: {file.name}</h3>
                    <p className="text-sm text-gray-500">File size: {formatFileSize(file.size)}</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={onUpload}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Upload
                    </button>
                    <button
                        onClick={onCancel}
                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}