import "dotenv/config";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import Database from "better-sqlite3";

const __dirname = dirname(fileURLToPath(import.meta.url));
const sqlitePath = process.env.SQLITE_PATH || "./parking_app.sqlite";
const db = new Database(sqlitePath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

const SEED_SPOTS = [
  ["Dostyk Plaza Parking", "Dostyk Ave 111, Almaty", "200m", 24, 80, 500, 43.238, 76.9458, true, true, true],
  ["Mega Park Parking", "Rozybakiyev St 263, Almaty", "450m", 12, 120, 600, 43.232, 76.927, true, false, true],
  ["Arbat Parking Lot", "Zhybek Zholy Ave 50, Almaty", "800m", 45, 60, 300, 43.2565, 76.9435, false, true, false],
  ["Esentai Mall Garage", "Al-Farabi Ave 77/8, Almaty", "1.2km", 8, 50, 800, 43.2185, 76.96, true, true, true],
  ["Kok-Tobe Parking", "Kok-Tobe, Almaty", "1.5km", 32, 100, 200, 43.227, 76.978, false, false, true],
];

async function main() {
  const schemaPath = join(__dirname, "..", "sql", "schema.sql");
  const schema = readFileSync(schemaPath, "utf8");
  db.exec(schema);
  console.log("Schema applied.");

  const countRow = db.prepare("SELECT COUNT(*) AS count FROM parking_spots").get();
  if (parseInt(String(countRow.count), 10) === 0) {
    const insert = db.prepare(
      `INSERT INTO parking_spots (name, address, distance, available_spots, total_spots, price_per_hour, lat, lng, has_covered, has_charging, has_disabled)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    const countRow = db.prepare("SELECT COUNT(*) AS count FROM parking_spots").get();
    if (Number(countRow.count) === 0) {
      const insert = db.prepare(
        `INSERT INTO parking_spots (name, address, distance, available_spots, total_spots, price_per_hour, lat, lng, has_covered, has_charging, has_disabled)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      );
  
      for (const row of SEED_SPOTS) {
        const fixedRow = row.map((v) => (typeof v === "boolean" ? (v ? 1 : 0) : v));
        insert.run(...fixedRow);
      }
  
      console.log("Seeded parking_spots.");
    }
    console.log("Seeded parking_spots.");
  }

  db.close();
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
