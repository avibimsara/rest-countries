import { getDb } from '../db.js';


export default class ApiKeyDAO {
  constructor(db) {
    this.db = db;
  }

  static async getInstance() {
    const db = await getDb();
    return new ApiKeyDAO(db);
  }

  async createKey(userId, key) {
    const result = await this.db.run(
      `INSERT INTO api_keys (user_id, key) VALUES (?, ?)`,
      [userId, key]
    );
    return result.lastID;
  }

  async listKeysByUser(userId) {
    return this.db.all(
      `SELECT id, key, revoked, created_at, last_used, usage_count
       FROM api_keys WHERE user_id = ?`,
      [userId]
    );
  }

  async revokeKey(keyId, userId) {
    await this.db.run(
      `UPDATE api_keys SET revoked = 1 WHERE id = ? AND user_id = ?`,
      [keyId, userId]
    );
  }

  async findValidKey(key) {
    return this.db.get(
      `SELECT id, user_id FROM api_keys
       WHERE key = ? AND revoked = 0`,
      [key]
    );
  }

  async incrementUsage(keyId) {
    await this.db.run(
      `UPDATE api_keys SET
         last_used = CURRENT_TIMESTAMP,
         usage_count = usage_count + 1
       WHERE id = ?`,
      [keyId]
    );
  }
}
