"use client"

import { useState } from "react"
import FileUploader from "./FileUploader"
import { supabase } from "@/lib/supabase"
import { encryptFile, generateAESKey } from "@/app/utils/encryption"
import { generateSecureFileName } from "@/app/utils"

export default function FileUploadSection() {
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

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

            
            // TODO call validate functions from validation.ts
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

            const { error: dbError } = await supabase
            .from('files')
            .insert([
                {
                    filename: secureFileName,
                    created_at: new Date(),
                    user_id: user.id
                }
            ]);

            // console.log("Database insert result:", { dbError} );
            if (dbError) throw dbError;

            setUploadStatus('success');
        } catch(error: any) {
            console.error("full error", error);
            setErrorMessage(error.message);
            setUploadStatus('error');
        }

    }

    return (
        <div>
            <FileUploader onFileUpload={handleFileUpload}></FileUploader>
            {uploadStatus === 'uploading' && <div>Uploading...</div>}
            {uploadStatus === 'success' && <div className="text-green-500">File uploaded successfully!</div>}
            {uploadStatus === 'error' && <div className="text-red-500">Error: {errorMessage}</div>}
        </div>
    )
}