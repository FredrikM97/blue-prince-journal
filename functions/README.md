
CREATE TABLE feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  message TEXT NOT NULL,
  contact TEXT,
  version TEXT,
  type TEXT NOT NULL DEFAULT 'general',
  identifier TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  github_issue_number INTEGER,
  created_at TEXT NOT NULL,
  processing_at TEXT,
  synced_at TEXT
);


wrangler secret put GH_TOKEN
wrangler secret put GH_OWNER
wrangler secret put GH_REPO
wrangler secret put SECRET_SALT


User
  → API (fully typed validation)
  → D1 insert (source of truth)
  → Queue<FeedbackJob>

Queue Worker
  → fetch DB row (FeedbackRow)
  → create GitHub issue
  → update D1 synced

CREATE TABLE feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  message TEXT NOT NULL,
  contact TEXT,
  version TEXT,
  type TEXT NOT NULL DEFAULT 'general',
  identifier TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  github_issue_number INTEGER,
  created_at TEXT NOT NULL,
  processing_at TEXT,
  synced_at TEXT
);
