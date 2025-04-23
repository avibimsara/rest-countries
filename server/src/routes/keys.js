import express from 'express';
import crypto from 'crypto';
import ApiKeyDAO from '../dao/APIKeyDAO.js';
import ApiKeyUsageDAO from '../dao/APIKeyUsageDAO.js';
import { requireSession } from '../middleware/sessionAuth.js';

const router = express.Router();
router.use(requireSession);

// List keys
router.get('/', async (req, res) => {
  const apiKeyDao = await ApiKeyDAO.getInstance();
  const keys      = await apiKeyDao.listKeysByUser(req.session.userId);
  res.json({ keys });
});

// Generate new key
router.post('/', async (req, res) => {
  const apiKeyDao = await ApiKeyDAO.getInstance();
  const newKey    = crypto.randomBytes(32).toString('hex');
  const id        = await apiKeyDao.createKey(req.session.userId, newKey);
  res.status(201).json({ id, key: newKey });
});


//  Usage logs for a given key
router.get('/:id/logs', async (req, res) => {
  const keyId = req.params.id;
  const apiKeyDao = await ApiKeyDAO.getInstance();
  // ensures this key belongs to the user
  const keys = await apiKeyDao.listKeysByUser(req.session.userId);
  if (!keys.find(k => k.id === +keyId)) {
    return res.status(403).json({ message: 'Not your key.' });
  }

  const usageDao = await ApiKeyUsageDAO.getInstance();
  const logs     = await usageDao.getUsageByKey(keyId);
  res.json({ logs });
});

export default router;
