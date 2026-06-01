type FeedbackPayload = {
  message?: unknown;
  contact?: unknown;
  pageUrl?: unknown;
  userAgent?: unknown;
};

export async function onRequest(context: {
  request: Request;
  env: { FEEDBACK_WEBHOOK_URL?: string };
}): Promise<Response> {
  if (context.request.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: { Allow: "POST" },
    });
  }

  let body: FeedbackPayload;
  try {
    body = (await context.request.json()) as FeedbackPayload;
  } catch {
    return Response.json({ error: "Invalid feedback payload" }, { status: 400 });
  }

  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message) {
    return Response.json({ error: "Message is required" }, { status: 400 });
  }

  const payload = {
    message,
    contact: typeof body.contact === "string" ? body.contact.trim() : "",
    pageUrl: typeof body.pageUrl === "string" ? body.pageUrl : "",
    userAgent: typeof body.userAgent === "string" ? body.userAgent : "",
    receivedAt: new Date().toISOString(),
  };

  if (context.env.FEEDBACK_WEBHOOK_URL) {
    const response = await fetch(context.env.FEEDBACK_WEBHOOK_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return Response.json({ error: "Unable to forward feedback" }, { status: 502 });
    }
  } else {
    console.log("feedback", payload);
  }

  return Response.json({ ok: true });
}