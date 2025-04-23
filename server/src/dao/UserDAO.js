import { getDb } from '../db.js';


export default class UserDAO {
  constructor(db) {
    this.db = db;
  }

  static async getInstance() {
    const db = await getDb();
    return new UserDAO(db);
  }

  async createUser(username, passwordHash) {
    const result = await this.db.run(
      `INSERT INTO users (username, password_hash) VALUES (?, ?)`,
      [username, passwordHash]
    );
    return result.lastID;
  }

  async findByUsername(username) {
    return this.db.get(
      `SELECT id, username, password_hash, created_at FROM users WHERE username = ?`,
      [username]
    );
  }

  async findById(userId) {
    return this.db.get(
      `SELECT id, username, created_at FROM users WHERE id = ?`,
      [userId]
    );
  }
}