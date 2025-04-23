import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

const dbPromise = open({
  filename: path.resolve(process.cwd(), 'data', 'app.db'),
  driver: sqlite3.Database
}).then(async db => {
  await db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.run(`
    CREATE TABLE IF NOT EXISTS api_keys (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      key TEXT UNIQUE NOT NULL,
      revoked INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_used DATETIME,
      usage_count INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
  `);

  await db.run(`
    CREATE TABLE IF NOT EXISTS api_key_usage (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      api_key_id INTEGER NOT NULL,
      endpoint TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(api_key_id) REFERENCES api_keys(id)
    );
  `);

  return db;
});

export function getDb() {
  return dbPromise;
}