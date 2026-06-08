import type { D1Database, Queue } from "@cloudflare/workers-types";

export type FeedbackType = "bug" | "feature" | "general";

export type FeedbackJob = {
  id: number;
};

export type FeedbackRow = {
  id: number;
  message: string;
  contact: string | null;
  version: string | null;
  type: FeedbackType;
  created_at: string;
};

export type Env = {
  DB: D1Database;
  FEEDBACK_QUEUE: Queue<FeedbackJob>;
  GH_TOKEN: string;
  GH_OWNER: string;
  GH_REPO: string;
  SECRET_SALT: string;
};

export type QueueMessage<T> = {
  body: T;
};

export type QueueBatch<T> = {
  messages: QueueMessage<T>[];
};
