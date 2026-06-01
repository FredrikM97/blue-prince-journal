export const FEEDBACK_ENDPOINT = "/api/feedback";

export interface FeedbackSubmission {
  message: string;
  contact: string;
  pageUrl: string;
  userAgent: string;
}

export async function submitFeedback(payload: FeedbackSubmission): Promise<void> {
  const response = await fetch(FEEDBACK_ENDPOINT, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let errorMessage = "Failed to send feedback";
    try {
      const data = (await response.json()) as { error?: string };
      if (data.error) errorMessage = data.error;
    } catch {
      // Ignore parse failures and fall back to the generic error.
    }
    throw new Error(errorMessage);
  }
}