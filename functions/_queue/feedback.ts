import type { FeedbackJob, FeedbackRow, Env, QueueBatch } from "../lib/types";

export const queue = async (batch: QueueBatch<FeedbackJob>, env: Env): Promise<void> => {
  for (const msg of batch.messages) {
    await handle(msg.body, env);
  }
};

async function handle(job: FeedbackJob, env: Env): Promise<void> {
  const row = await env.DB.prepare(
    `SELECT id, message, contact, version, created_at, type
     FROM feedback
     WHERE id = ?`,
  )
    .bind(job.id)
    .first<FeedbackRow>();

  if (!row) return;

  const existing = await env.DB.prepare(`SELECT github_issue_number FROM feedback WHERE id = ?`)
    .bind(job.id)
    .first<{ github_issue_number: number | null }>();

  if (existing?.github_issue_number) return;

  const issue = await createIssue(row, env);

  await env.DB.prepare(
    `UPDATE feedback
     SET status = 'synced',
         github_issue_number = ?,
         synced_at = datetime('now')
     WHERE id = ?`,
  )
    .bind(issue.number, job.id)
    .run();
}

async function createIssue(row: FeedbackRow, env: Env): Promise<{ number: number }> {
  const res = await fetch(`https://api.github.com/repos/${env.GH_OWNER}/${env.GH_REPO}/issues`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.GH_TOKEN}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: `[${row.type}] Feedback #${row.id}`,
      body: formatBody(row),
      labels: [row.type],
    }),
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return (await res.json()) as { number: number };
}

function formatBody(row: FeedbackRow): string {
  return `
## Feedback

**ID:** ${row.id}
**Type:** ${row.type}
**Version:** ${row.version ?? "unknown"}
**Contact:** ${row.contact ?? "none"}
**Created:** ${row.created_at}

---

### Message
${row.message}
`;
}
