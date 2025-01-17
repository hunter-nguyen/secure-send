"use client"

import { useState } from "react"
import FileUploader from "@/components/FileUploader"
import FilePreview from "@/components/FilePreview"
import { supabase } from "@/lib/supabase"
import { encryptFile, generateAESKey } from "@/app/utils/encryption"
import { generateSecureFileName, validateFileType, validateFileSize } from "@/app/utils/validation"
import { ShareModal } from "@/components/ShareModal"

interface FileUploadSectionProps {
    onUploadComplete?: () => Promise<void>;
}

export default function FileUploadSection({
    onUploadComplete
}:
    {
        onUploadComplete?: () => Promise<void>;
    }) {
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [fileId, setFileId] = useState<string | null>(null);

    const handleModalClose = () => {
        setShowModal(false);
        setFileId(null);
    };


    const handleFileSelect = (file: File) => {
        setSelectedFile(file);
    };

    // Handle confirm in preview
    const handleConfirmUpload = async () => {
        if (!selectedFile) return;
        await handleFileUpload(selectedFile);
        setSelectedFile(null);
    }

    // handle when user cancels in preview
    const handleCancelUpload = () => {
        setSelectedFile(null);
    }

    const handleFileUpload = async (file: File) => {
        setUploadStatus('uploading');
        try {
            const { data: { user } } = await supabase.auth.getUser();
            // console.log("Current user", user);
            if (!user) throw new Error('Not authenticated');

            const aesKey = await generateAESKey();
            const { encryptedData } = await encryptFile(file, aesKey);

            const secureFileName = generateSecureFileName(file.name);
            // console.log("Attempting to upload to the console filename", secureFileName);


            // Call validation functions
            if (!validateFileType(file)) {
                throw new Error('File type not supported. Please upload PDF, PNG, JPEG, DOC, or TXT files only.');
            }

            if (!validateFileSize(file)) {
                throw new Error('File size exceeds 10MB limit.');
            }

            // console.log("Starting storage upload...");
            const { data, error } = await supabase.storage
            .from('uploads')
            .upload(`${user.id}/${secureFileName}`,
                new Blob([encryptedData], {
                type: file.type
            }), {
                contentType: file.type,
                upsert: true
            }
        );
        // console.log("Storage upload result:", { data, error });

            if (error) throw error;

            const { data: fileData, error: dbError } = await supabase
            .from('files')
            .insert([
                {
                    filename: secureFileName,
                    created_at: new Date(),
                    user_id: user.id,
                    size: file.size
                }
            ])
            .select()
            .single();

            setFileId(fileData.id);
            setShowModal(true);

            console.log("File insert attempt:", {
                filename: secureFileName,
                user_id: user.id,
                size: file.size,
                error: dbError
            });

            // console.log("Database insert result:", { dbError} );
            if (dbError) throw dbError;

            const { error: activityError } = await supabase
                .from('file_activities')
                .insert([{
                    user_id: user.id,
                    type: 'upload',
                    filename: file.name,
                    created_at: new Date().toISOString()
                }]);

            if (activityError) throw activityError;

            setUploadStatus('success');
            if (onUploadComplete) {
                console.log("Calling onUploadComplete")
                await onUploadComplete();
            }
        } catch(error: any) {
            console.error("full error", error);
            setErrorMessage(error.message);
            setUploadStatus('error');
        }

    }

    return (
        <div>
            {!selectedFile ? (
                <FileUploader onFileSelect={handleFileSelect}></FileUploader>
            ) : (
                <FilePreview
                file={selectedFile}
                onUpload={handleConfirmUpload}
                onCancel={handleCancelUpload}
            />
            )}
            {uploadStatus === 'uploading' && <div>Uploading...</div>}
            {uploadStatus === 'success' && (
                <>
                <div className="text-green-500">File uploaded successfully!</div> &&
                <ShareModal
                    isOpen={true}
                    onClose={handleModalClose}
                    fileId={selectedFile?.name!}
                />
                </>
            )}
            {uploadStatus === 'error' && <div className="text-red-500">Error: {errorMessage}</div>}
        </div>
    )
}