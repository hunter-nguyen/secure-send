# Secure Send

A secure file-sharing application that enables users to upload and share files with end-to-end encryption. Files are encrypted client-side before storage and can be securely shared with other users through time-limited or single-use links.

## Tech Stack

Frontend: Next.js, TypeScript, Tailwind CSS
Backend & Authentication: Supabase (PostgreSQL and Row Level Security)
Storage: Supabase Storage with encrypted file handling
Security:
- Web Crypto API for secure filename generation
- AES-GCM encryption for file content
- Client-side encryption before upload


## Key Features
- Google OAuth Authentication
- Client-side file encryption
- Secure file storage
- Activity tracking

