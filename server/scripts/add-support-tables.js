import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, "..", "data", "parking_app.sqlite");
const db = new Database(dbPath);

console.log("Adding support tables to database...");

try {
  // Create support_tickets table
  db.exec(`
    CREATE TABLE IF NOT EXISTS support_tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      subject TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'open',
      priority TEXT NOT NULL DEFAULT 'medium',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      CHECK (status IN ('open', 'in_progress', 'closed')),
      CHECK (priority IN ('low', 'medium', 'high', 'urgent'))
    );
  `);

  console.log("✓ Created support_tickets table");

  // Create support_messages table
  db.exec(`
    CREATE TABLE IF NOT EXISTS support_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_id INTEGER NOT NULL,
      user_id INTEGER,
      is_admin INTEGER NOT NULL DEFAULT 0,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );
  `);

  console.log("✓ Created support_messages table");

  // Create indexes for better performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
    CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
    CREATE INDEX IF NOT EXISTS idx_support_messages_ticket_id ON support_messages(ticket_id);
  `);

  console.log("✓ Created indexes");

  console.log("\n✅ Support tables migration completed successfully!");
} catch (error) {
  console.error("❌ Error creating support tables:", error);
  process.exit(1);
} finally {
  db.close();
}
