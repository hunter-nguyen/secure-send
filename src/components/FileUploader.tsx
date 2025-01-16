"use client"

import Dropzone from 'react-dropzone'
import { FaUpload } from 'react-icons/fa'

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
}

export default function FileUploader({ onFileSelect }: FileUploaderProps) {
  const supportedFileTypes = [
    'PDF',
    'PNG',
    'JPEG/JPG',
    'Word Documents',
    'Plain Text'
  ].join(', ');

  return (
    <div className="flex justify-center items-center p-4 inset-0 m-auto">
      <Dropzone onDrop={(files) => {
        if (files.length > 0) {
          onFileSelect(files[0])
        }
      }}>
        {({ getRootProps, getInputProps, isDragActive }) => (
          <div
            {...getRootProps()}
            className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer
              ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
          >
            <input {...getInputProps()} />
            <div className="flex justify-center items-center">
              <FaUpload className="text-gray-600 mb-4" size={24} />
            </div>
            {isDragActive ? (
              <p className="text-blue-500">Drop the files here...</p>
            ) : (
              <div>
                <p className="text-gray-600">Drag, drop, or click to select files</p>
                <p className="text-sm text-gray-400 mt-2">Supported files: {supportedFileTypes}.
                  <br/>
                  Max file size: 10 MB</p>
              </div>
            )}
          </div>
        )}
      </Dropzone>
    </div>
  )
}