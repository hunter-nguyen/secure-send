export async function generateIV(): Promise<Uint8Array> {
  return crypto.getRandomValues(new Uint8Array(12));  // Creates random numbers
}

export async function encryptFile(file: File, aesKey: CryptoKey): Promise<{encryptedData: ArrayBuffer, iv: Uint8Array}> {
  const fileBuffer = await file.arrayBuffer();
  const iv = await generateIV();

  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    aesKey,
    fileBuffer
  );

  return {
    encryptedData: encryptedBuffer,
    iv: iv
  };
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
