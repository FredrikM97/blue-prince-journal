import type { D1Database } from "@cloudflare/workers-types";

type FeedbackPayload = {
  message?: unknown;
  contact?: unknown;
  appVersion?: unknown;
};

export async function onRequestPost(context: {
  request: Request;
  env: { DB: D1Database };
}): Promise<Response> {
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

  const contact = typeof body.contact === "string" ? body.contact.trim() : "";
  const appVersion = typeof body.appVersion === "string" ? body.appVersion : "";

  const tableInfo = await context.env.DB.prepare("PRAGMA table_info(feedback)").all<{
    name: string;
  }>();
  if (!tableInfo.results.some((column) => column.name === "version")) {
    await context.env.DB.exec("ALTER TABLE feedback ADD COLUMN version TEXT");
  }

  await context.env.DB.prepare(
    `
    INSERT INTO feedback (
      message,
      contact,
      version,
      created_at
    )
    VALUES (?, ?, ?, ?)
    `,
  )
    .bind(message, contact, appVersion, new Date().toISOString())
    .run();

  console.log("feedback context", { appVersion });

  return Response.json({ ok: true });
}
