/**
 * Standalone script to initialize the database.
 * You can run this manually, but it's NOT required --
 * the server auto-creates tables and seeds on first start.
 *
 * Usage:  node scripts/init-db.js
 */
import "../src/db.js";
console.log("Database initialized successfully.");
