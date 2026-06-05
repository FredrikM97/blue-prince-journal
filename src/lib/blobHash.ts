function bytesToHex(bytes: Uint8Array): string {
  let result = "";
  for (const byte of bytes) {
    result += byte.toString(16).padStart(2, "0");
  }
  return result;
}

function fnv1aHash(bytes: Uint8Array): string {
  let hash = 0x811c9dc5;
  for (const byte of bytes) {
    hash ^= byte;
    hash = Math.imul(hash, 0x01000193);
  }
  return `fnv1a32:${bytes.length}:${(hash >>> 0).toString(16)}`;
}

export async function hashBlob(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  const cryptoSubtle = globalThis.crypto?.subtle;
  if (cryptoSubtle) {
    const digest = await cryptoSubtle.digest("SHA-256", buffer);
    return bytesToHex(new Uint8Array(digest));
  }

  return fnv1aHash(new Uint8Array(buffer));
}