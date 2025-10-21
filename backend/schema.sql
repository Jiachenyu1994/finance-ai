CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  date TEXT NOT NULL,
  merchant TEXT,
  amount_cents INTEGER NOT NULL,
  note TEXT,
  category TEXT DEFAULT 'uncategorized',
  predicted_category TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS budgets (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  month TEXT NOT NULL,     -- 格式 YYYY-MM
  category TEXT NOT NULL,
  limit_cents INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS rules (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  pattern TEXT NOT NULL,   -- 例如 "*Starbucks*"
  category TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  user_name TEXT PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);
