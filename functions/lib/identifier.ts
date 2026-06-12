const encoder = new TextEncoder();

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function createIdentifier(ip: string, userAgent: string, salt: string): Promise<string> {
  const payload = `${ip}\n${userAgent}\n${salt}`;
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(payload));
  return toHex(new Uint8Array(digest));
}