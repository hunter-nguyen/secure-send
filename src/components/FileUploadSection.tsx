"use client"

import FileUploader from "./FileUploader"
import { supabase } from "@/lib/supabase"
import { encryptFile, generateAESKey } from "@/app/utils/encryption"

export default function FileUploadSection() {
    const handleFileUpload = async (file: File) => {
        // TODO: Implement encryption and upload to Supabase
        const aesKey = await generateAESKey();
        const encryptedFile = await encryptFile(file, aesKey);

        const { data, error } = await supabase.storage
        .from('uploads')
        .upload(file.name, new Blob([encryptedFile]), {
            contentType: file.type
        })

        if (error) {
            alert('Upload failed'); // TODO finish
        } else {
            // successfully uploaded file
        }
    }

    return (
        <FileUploader onFileUpload={handleFileUpload}></FileUploader>
    )
}