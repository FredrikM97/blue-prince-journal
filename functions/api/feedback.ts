type FeedbackPayload = {
  message?: unknown;
  contact?: unknown;
  pageUrl?: unknown;
  userAgent?: unknown;
};

export async function onRequest(context: {
  request: Request;
  env: {
    DB: D1Database;
    FEEDBACK_WEBHOOK_URL?: string;
  };
}): Promise<Response> {
  if (context.request.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: { Allow: "POST" },
    });
  }

  let body: FeedbackPayload;

  try {
    body = await context.request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!message) {
    return Response.json({ error: "Message is required" }, { status: 400 });
  }

  const contact = typeof body.contact === "string" ? body.contact.trim() : "";

  const pageUrl = typeof body.pageUrl === "string" ? body.pageUrl : "";

  const userAgent = typeof body.userAgent === "string" ? body.userAgent : "";

  const payload = {
    message,
    contact,
    pageUrl,
    userAgent,
    receivedAt: new Date().toISOString(),
  };

  // Save to D1
  await context.env.DB.prepare(
    `
    INSERT INTO feedback (
      message,
      contact,
      page_url,
      user_agent,
      created_at
    )
    VALUES (?, ?, ?, ?, ?)
    `,
  )
    .bind(payload.message, payload.contact, payload.pageUrl, payload.userAgent, payload.receivedAt)
    .run();
  }

  return Response.json({ ok: true });
}
