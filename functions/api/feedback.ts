import { createIdentifier } from "../lib/identifier";
import type { FeedbackJob, FeedbackType, Env } from "../lib/types";

type FeedbackPayload = {
  message?: unknown;
  contact?: unknown;
  appVersion?: unknown;
  type?: unknown;
  turnstileToken?: unknown;
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

  const token = typeof body.turnstileToken === "string" ? body.turnstileToken : "";
  if (!token) {
    return Response.json({ error: "Missing verification token" }, { status: 400 });
  }

  const verifyForm = new URLSearchParams({ secret: context.env.TURNSTILE_SECRET, response: token });
  const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: verifyForm,
  });
  const verifyData = (await verifyRes.json()) as { success: boolean };
  if (!verifyData.success) {
    return Response.json({ error: "Verification failed" }, { status: 403 });
  }

  const identifier = await createIdentifier(ip, ua, context.env.SECRET_SALT);

  const blocked = await context.env.DB.prepare(
    `SELECT 1 FROM blocked_users WHERE identifier = ?`,
  )
    .bind(identifier)
    .first();
  if (blocked) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const [countHour, countDay] = await Promise.all([
    context.env.DB.prepare(
      `SELECT COUNT(*) as n FROM feedback WHERE identifier = ? AND created_at > ?`,
    )
      .bind(identifier, hourAgo)
      .first<{ n: number }>(),
    context.env.DB.prepare(
      `SELECT COUNT(*) as n FROM feedback WHERE identifier = ? AND created_at > ?`,
    )
      .bind(identifier, dayAgo)
      .first<{ n: number }>(),
  ]);

  if ((countHour?.n ?? 0) >= 5 || (countDay?.n ?? 0) >= 20) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }

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
