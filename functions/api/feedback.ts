import { createIdentifier } from "../lib/identifier";
import type { FeedbackJob, FeedbackType, Env } from "../lib/types";

type FeedbackPayload = {
  message?: unknown;
  contact?: unknown;
  appVersion?: unknown;
  type?: unknown;
};

export async function onRequestPost(context: { request: Request; env: Env }) {
  const request = context.request;

  let body: FeedbackPayload;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!message) {
    return Response.json({ error: "Message required" }, { status: 400 });
  }

  const contact = typeof body.contact === "string" ? body.contact.trim() : null;

  const version = typeof body.appVersion === "string" ? body.appVersion : null;

  const allowedTypes: FeedbackType[] = ["bug", "feature", "general"];

  const type: FeedbackType =
    typeof body.type === "string" && allowedTypes.includes(body.type as FeedbackType)
      ? (body.type as FeedbackType)
      : "general";

  const ip = request.headers.get("CF-Connecting-IP") ?? "";
  const ua = request.headers.get("User-Agent") ?? "";

  const identifier = await createIdentifier(ip, ua, context.env.SECRET_SALT);

  const createdAt = new Date().toISOString();

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
    .bind(message, contact, version, type, identifier, createdAt)
    .first<{ id: number }>();

  if (!inserted) {
    return Response.json({ error: "DB insert failed" }, { status: 500 });
  }

  const job: FeedbackJob = {
    id: inserted.id,
  };

  await context.env.FEEDBACK_QUEUE.send(job);

  return Response.json({ ok: true, id: inserted.id });
}
