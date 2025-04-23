import { getDb } from '../db.js';

export async function requireApiKey(req, res, next) {
  const key = req.header('x-api-key');
  if (!key) return res.status(401).json({ message: 'API key missing.' });

  const db = await getDb();
  const row = await db.get(
    `SELECT id, user_id FROM api_keys WHERE key = ? AND revoked = 0`,
    [key]
  );
  if (!row) return res.status(403).json({ message: 'Invalid or revoked API key.' });

  // Update usage stats
  await db.run(`
    UPDATE api_keys SET 
      last_used = CURRENT_TIMESTAMP,
      usage_count = usage_count + 1
    WHERE id = ?`,
    [row.id]
  );
  // Log each call
  await db.run(
    `INSERT INTO api_key_usage (api_key_id, endpoint) VALUES (?, ?)` ,
    [row.id, req.originalUrl]
  );

  req.userId = row.user_id;
  req.apiKeyId = row.id;
  next();
}