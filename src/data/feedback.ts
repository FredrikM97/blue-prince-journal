export const FEEDBACK_ENDPOINT = "/api/feedback";

export type FeedbackType = "bug" | "feature" | "general" | "question";

export interface FeedbackSubmission {
  message: string;
  contact?: string;
  appVersion?: string;
  type?: FeedbackType;
}

type SuccessResponse = {
  id: number;
  ok?: true;
};

type ErrorResponse = {
  error?: string;
};

type ApiResponse = SuccessResponse | ErrorResponse | null;

async function safeJson<T>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function submitFeedback(payload: FeedbackSubmission): Promise<SuccessResponse> {
  const response = await fetch(FEEDBACK_ENDPOINT, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      message: payload.message,
      contact: payload.contact?.trim() || undefined,
      appVersion: payload.appVersion?.trim() || undefined,
      type: payload.type,
    }),
  });

  const data = await safeJson<ApiResponse>(response);

  if (!response.ok) {
    const errorMessage =
      data && typeof data === "object" && "error" in data
        ? (data as ErrorResponse).error
        : "Failed to send feedback";

    throw new Error(errorMessage || "Failed to send feedback");
  }

  if (!data || typeof data !== "object" || !("id" in data)) {
    throw new Error("Invalid server response");
  }

  return data as SuccessResponse;
}
