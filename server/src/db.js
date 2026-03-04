import "dotenv/config";
import Database from "better-sqlite3";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Always resolve relative to the server root (one level up from src/)
const serverRoot = resolve(__dirname, "..");
const sqlitePath = process.env.SQLITE_PATH
  ? resolve(process.env.SQLITE_PATH)
  : join(serverRoot, "data", "parking_app.sqlite");

// Ensure the data directory exists
import { mkdirSync } from "fs";
mkdirSync(dirname(sqlitePath), { recursive: true });

const db = new Database(sqlitePath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// ---------- Auto-init schema + seed on first run ----------
const schemaPath = join(serverRoot, "sql", "schema.sql");
const schema = readFileSync(schemaPath, "utf8");
db.exec(schema);

// Seed parking spots if table is empty
const { count } = db.prepare("SELECT COUNT(*) AS count FROM parking_spots").get();
if (count === 0) {
  const SPOTS = [
    ["Dostyk Plaza Parking", "Dostyk Ave 111, Almaty", "200m", 24, 80, 500, 43.238, 76.9458, 1, 1, 1],
    ["Mega Park Parking", "Rozybakiyev St 263, Almaty", "450m", 12, 120, 600, 43.232, 76.927, 1, 0, 1],
    ["Arbat Parking Lot", "Zhybek Zholy Ave 50, Almaty", "800m", 45, 60, 300, 43.2565, 76.9435, 0, 1, 0],
    ["Esentai Mall Garage", "Al-Farabi Ave 77/8, Almaty", "1.2km", 8, 50, 800, 43.2185, 76.96, 1, 1, 1],
    ["Kok-Tobe Parking", "Kok-Tobe, Almaty", "1.5km", 32, 100, 200, 43.227, 76.978, 0, 0, 1],
    ["TSUM Underground Parking", "Zhybek Zholy Ave 115, Almaty", "350m", 18, 60, 400, 43.2569, 76.9511, 1, 0, 1],
    ["Almaly Station Parking", "Kabanbay Batyr Ave 54, Almaty", "100m", 40, 90, 250, 43.2526, 76.9453, 0, 0, 1],
    ["Baikonur Station Park", "Baikonur St 1, Almaty", "300m", 22, 70, 350, 43.2543, 76.927, 0, 0, 0],
    ["Green Bazaar Parking", "Zhybek Zholy Ave 53, Almaty", "500m", 15, 45, 200, 43.2579, 76.9361, 0, 0, 1],
    ["Ramstore Center Parking", "Al-Farabi Ave 43, Almaty", "700m", 35, 100, 450, 43.222, 76.936, 1, 1, 1],
    ["Khan Shatyr Plaza", "Dostyk Ave 240, Almaty", "900m", 28, 80, 550, 43.2283, 76.9569, 1, 1, 0],
    ["ADK Business Center", "Nursultan Nazarbayev Ave 223, Almaty", "250m", 10, 40, 700, 43.2405, 76.9459, 1, 0, 0],
    ["Atakent Exhibition Parking", "Timiryazev St 42, Almaty", "1.8km", 60, 200, 150, 43.2296, 76.9086, 0, 0, 1],
    ["Samal Towers Garage", "Samal-2 111, Almaty", "600m", 16, 55, 650, 43.233, 76.954, 1, 1, 1],
    ["Panfilov Park Lot", "Panfilov Park, Almaty", "150m", 20, 35, 300, 43.2575, 76.9573, 0, 0, 0],
    ["Hotel Kazakhstan Parking", "Dostyk Ave 52, Almaty", "400m", 14, 60, 500, 43.2468, 76.9526, 1, 0, 1],
    ["CSE Parking Garage", "Furmanov St 238, Almaty", "300m", 9, 30, 600, 43.2401, 76.953, 1, 1, 0],
    ["Globus Mall Parking", "Rozybakiyev St 245, Almaty", "550m", 25, 85, 400, 43.234, 76.9295, 1, 0, 1],
    ["Mega Alma-Ata Parking", "Rozybakiyev St 247A, Almaty", "2.0km", 90, 300, 350, 43.208, 76.893, 1, 1, 1],
    ["Forum Almaty Lot", "Seifullin Ave 617, Almaty", "650m", 30, 70, 350, 43.2609, 76.93, 0, 0, 1],
    ["Nurly Tau BC Parking", "Al-Farabi Ave 19, Almaty", "800m", 20, 100, 550, 43.225, 76.925, 1, 1, 1],
    ["Aport Mall Parking", "Raiymbek Ave 514A, Almaty", "3.5km", 120, 400, 200, 43.28, 76.88, 1, 0, 1],
    ["Asia Park Parking", "Abay Ave 109, Almaty", "1.0km", 38, 90, 450, 43.242, 76.925, 1, 1, 0],
    ["Central Stadium Lot", "Abay Ave 48, Almaty", "500m", 50, 150, 250, 43.249, 76.942, 0, 0, 1],
    ["Almaty 1 Station Park", "Seyfullin Ave 34, Almaty", "400m", 18, 50, 300, 43.2676, 76.9299, 0, 0, 0],
    ["Alma-Ata Business Center", "Kurmangazy St 61B, Almaty", "200m", 6, 25, 750, 43.2518, 76.9445, 1, 0, 0],
    ["Gorky Park Lot", "Gogol St 1, Almaty", "700m", 40, 80, 200, 43.2498, 76.9596, 0, 0, 1],
    ["Keruen City Parking", "Dostyk Ave 180, Almaty", "350m", 22, 65, 500, 43.2338, 76.9535, 1, 1, 1],
    ["TechnoHub Parking", "Shevchenko St 90, Almaty", "950m", 15, 40, 400, 43.245, 76.918, 1, 1, 0],
    ["Medeu Parking Area", "Gorny Gigant, Almaty", "4.0km", 55, 150, 300, 43.158, 77.057, 0, 0, 1],
  ];

  const insert = db.prepare(
    `INSERT INTO parking_spots (name, address, distance, available_spots, total_spots, price_per_hour, lat, lng, has_covered, has_charging, has_disabled)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  const insertMany = db.transaction((rows) => {
    for (const row of rows) insert.run(row);
  });

  insertMany(SPOTS);
  console.log(`Auto-seeded ${SPOTS.length} parking spots.`);
}

// ---------- Query helper ----------

function toSqlite(text) {
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
