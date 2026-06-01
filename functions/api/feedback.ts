type FeedbackPayload = {
  message?: unknown;
  contact?: unknown;
  pageUrl?: unknown;
  userAgent?: unknown;
};

export async function onRequest({ request }: { request: Request }): Promise<Response> {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: { Allow: "POST" },
    });
  }

  let body: FeedbackPayload;
  try {
    body = (await request.json()) as FeedbackPayload;
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

  console.log("feedback", {
    message,
    contact,
    pageUrl,
    userAgent,
    receivedAt: new Date().toISOString(),
  });

  return Response.json({ ok: true });
}
