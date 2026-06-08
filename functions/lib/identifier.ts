export async function createIdentifier(
  ip: string,
  userAgent: string,
  salt: string,
): Promise<string> {
  const input = `${salt}:${ip}:${userAgent}`;

  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));

  return [...new Uint8Array(hash)].map((x: number) => x.toString(16).padStart(2, "0")).join("");
}
