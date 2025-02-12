# Secure Send 🔒
A secure file-sharing application that enables users to upload and share files with end-to-end encryption. Files are encrypted client-side before storage and can be securely shared with other users through time-limited or single-use links.
## Tech Stack 🛠️
- Frontend: Next.js, TypeScript, Tailwind CSS
- Backend & Authentication: Supabase (PostgreSQL, Row Level Security)
- Storage: Supabase Storage with encrypted file handling
- Security:
  - Web Crypto API for secure filename generation
  - AES-GCM encryption for file content
  - Client-side encryption before upload

## Key Features ✨
- Google OAuth Authentication
- Client-side file encryption
- Secure and anonymous file storage
- Activity tracking

## Built With 💻
- [Next.js](https://nextjs.org/) v15.1.3
- [TypeScript](https://www.typescriptlang.org/)
- [Supabase](https://www.supabase.com)
- [Tailwind CSS](https://tailwindcss.com/)
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- AES-GCM Encryption

## Authentication and File Upload Flow
![{44F5A229-3581-41E1-B3B6-266D7F957E00}](https://github.com/user-attachments/assets/7bb418d7-ab6f-4709-96e2-88e9e4131103)

