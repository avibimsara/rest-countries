import { getDb } from '../db.js';


export default class ApiKeyUsageDAO {
  constructor(db) {
    this.db = db;
  }

  static async getInstance() {
    const db = await getDb();
    return new ApiKeyUsageDAO(db);
  }

  async logUsage(keyId, endpoint) {
    const result = await this.db.run(
      `INSERT INTO api_key_usage (api_key_id, endpoint)
       VALUES (?, ?)`,
      [keyId, endpoint]
    );
    return result.lastID;
  }

  async getUsageByKey(keyId) {
    return this.db.all(
      `SELECT id, endpoint, timestamp FROM api_key_usage
       WHERE api_key_id = ? ORDER BY timestamp DESC`,
      [keyId]
    );
  }
}
