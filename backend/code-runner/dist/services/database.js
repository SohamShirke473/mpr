import fs from "fs";
import path from "path";
import Database from "better-sqlite3";
const dbDir = path.join(process.cwd(), "data");
const dbPath = path.join(dbDir, "logs.db");
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}
const db = new Database(dbPath);
db.exec(`
  CREATE TABLE IF NOT EXISTS execution_logs (
    id         TEXT PRIMARY KEY,
    code       TEXT,
    stdin      TEXT,
    status     TEXT,
    stdout     TEXT,
    stderr     TEXT,
    exec_time  INTEGER,
    created_at TEXT
  )
`);
export function insertLog(log) {
    const stmt = db.prepare(`
    INSERT INTO execution_logs (id, code, stdin, status, stdout, stderr, exec_time, created_at)
    VALUES (@id, @code, @stdin, @status, @stdout, @stderr, @exec_time, @created_at)
  `);
    stmt.run({
        ...log,
        created_at: new Date().toISOString(),
    });
}
export function getLogs(limit = 100) {
    const stmt = db.prepare("SELECT * FROM execution_logs ORDER BY created_at DESC LIMIT ?");
    return stmt.all(limit);
}
export default db;
