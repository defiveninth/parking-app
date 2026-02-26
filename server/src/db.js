import Database from "better-sqlite3";

const sqlitePath = process.env.SQLITE_PATH || "./parking_app.sqlite";

const db = new Database(sqlitePath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

function toSqlite(text) {
  // Convert $1, $2, ... placeholders to SQLite '?' placeholders.
  // Assumes params are passed as a positional array matching $1..$N.
  return text.replace(/\$\d+/g, "?");
}

export async function query(text, params = []) {
  const sql = toSqlite(text);
  const start = Date.now();
  const stmt = db.prepare(sql);

  const isSelect = /^\s*select\b/i.test(sql);
  const hasReturning = /\breturning\b/i.test(sql);

  let rows = [];
  let rowCount = 0;

  if (isSelect || hasReturning) {
    rows = stmt.all(params);
    rowCount = rows.length;
  } else {
    const info = stmt.run(params);
    rowCount = info.changes || 0;
  }

  const duration = Date.now() - start;
  if (process.env.NODE_ENV !== "test") {
    console.log("Query", { text: sql.slice(0, 60), duration, rows: rowCount });
  }

  return { rows, rowCount };
}

export function getDb() {
  return db;
}

export default db;
