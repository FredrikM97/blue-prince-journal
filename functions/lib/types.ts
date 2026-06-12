import type { D1Database, Queue } from "@cloudflare/workers-types";

export type FeedbackType = "bug" | "feature" | "general" | "question";

export type FeedbackRequestMetadata = {
  ipAddress: string | null;
  userAgent: string | null;
  referrer: string | null;
  origin: string | null;
  country: string | null;
};

export type FeedbackJob = {
  id: number;
  requestMetadata: FeedbackRequestMetadata;
};

export type FeedbackRow = {
  id: number;
  message: string;
  contact: string | null;
  version: string | null;
  type: FeedbackType;
  status: "pending" | "synced";
  github_issue_number: number | null;
  identifier: string;
  created_at: string;
};

export type Env = {
  DB: D1Database;
  FEEDBACK_QUEUE: Queue<FeedbackJob>;
  GH_TOKEN: string;
  GH_OWNER: string;
  GH_REPO: string;
  SECRET_SALT: string;
  TURNSTILE_SECRET: string;
};

export type QueueMessage<T> = {
  body: T;
};

export type QueueBatch<T> = {
  messages: QueueMessage<T>[];
};
