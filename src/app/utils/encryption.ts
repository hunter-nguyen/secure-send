export async function encryptFile(file: File, aesKey: CryptoKey): Promise<ArrayBuffer> {
    const fileBuffer = await file.arrayBuffer();
    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: new Uint8Array(12) },
      aesKey,
      fileBuffer
    );
    return encryptedBuffer;
  }

  export async function generateAESKey(): Promise<CryptoKey> {
    return crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
  }

  
  export async function decryptFile(encryptedBuffer: ArrayBuffer, aesKey: CryptoKey): Promise<ArrayBuffer> {
    return crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: new Uint8Array(12) },
      aesKey,
      encryptedBuffer
    );
  }
