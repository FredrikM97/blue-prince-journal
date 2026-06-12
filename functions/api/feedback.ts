import { createIdentifier } from "../lib/identifier";
import type { FeedbackType, Env } from "../lib/types";

type FeedbackPayload = {
  message?: unknown;
  contact?: unknown;
  appVersion?: unknown;
  type?: unknown;
  turnstileToken?: unknown;
};

export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const request = context.request;

  let body: FeedbackPayload;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!message) {
    return Response.json({ error: "Message is required" }, { status: 400 });
  }

  const version = typeof body.appVersion === "string" ? body.appVersion : null;

  const allowedTypes: FeedbackType[] = ["bug", "feature", "general", "question"];

  const type: FeedbackType =
    typeof body.type === "string" && allowedTypes.includes(body.type as FeedbackType)
      ? (body.type as FeedbackType)
      : "general";

  const ip = request.headers.get("CF-Connecting-IP") ?? "";
  const ua = request.headers.get("User-Agent") ?? "";
  const requestMetadata = {
    ipAddress: ip || null,
    userAgent: ua || null,
    referrer: request.headers.get("Referer"),
    origin: request.headers.get("Origin"),
    country: request.headers.get("CF-IPCountry"),
  };

  const identifier = await createIdentifier(ip, ua, context.env.SECRET_SALT);

  const createdAt = new Date().toISOString();
  const metadataLines = [
    `IP: ${requestMetadata.ipAddress ?? "unknown"}`,
    `User-Agent: ${requestMetadata.userAgent ?? "unknown"}`,
    `Referrer: ${requestMetadata.referrer ?? "unknown"}`,
    `Origin: ${requestMetadata.origin ?? "unknown"}`,
    `Country: ${requestMetadata.country ?? "unknown"}`,
  ];
  const messageWithMetadata = `${message}\n\n---\nSender info\n${metadataLines.join("\n")}`;

  const inserted = await context.env.DB.prepare(
    `INSERT INTO feedback (
      message,
      contact,
      version,
      type,
      identifier,
      status,
      created_at
    )
    VALUES (?, ?, ?, ?, ?, 'pending', ?)
    RETURNING id`,
  )
    .bind(
      messageWithMetadata,
      typeof body.contact === "string" ? body.contact.trim() : null,
      version,
      type,
      identifier,
      createdAt,
    )
    .first<{ id: number }>();

  if (!inserted) {
    return Response.json({ error: "DB insert failed" }, { status: 500 });
  }

  return Response.json({ ok: true, id: inserted.id });
}
