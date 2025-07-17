import express from 'express';
import fetch from 'node-fetch';            
import { requireApiKey } from '../middleware/apiKeyAuth.js';

const router = express.Router();

const ENDPOINTS = {
  all:        ()    => `all`,
  name:       q     => `name/${q}`,
  fullName:   q     => `name/${q}?fullText=true`,
  code:       q     => `alpha/${q}`,
  codes:      q     => `alpha?codes=${q}`,
  currency:   q     => `currency/${q}`,
  lang:       q     => `lang/${q}`,
  capital:    q     => `capital/${q}`,
};

const FIELDS = 'name,capital,currencies,languages,flags';

router.get('/', requireApiKey, async (req, res) => {
  console.log('countries called with:', req.query);

  const { type = 'name', q = '' } = req.query;
  if (!ENDPOINTS[type]) {
    console.warn('Invalid search:', type);
    return res.status(400).json({ message: `Invalid type: ${type}` });
  }

  const path = ENDPOINTS[type](encodeURIComponent(q));
  const url  = `https://restcountries.com/v3.1/${path}?fields=${FIELDS}`;
  console.log('Fetching from RestCountries:', url);

  try {
    const resp = await fetch(url);
    if (!resp.ok) {
      console.error('RestCountries error :', resp.status, resp.statusText);
      return res
        .status(resp.status)
        .json({ message: `RestCountries error ${resp.status}` });
    }

    const data = await resp.json();
    console.log(`Received ${Array.isArray(data)? data.length : 'unknown'} items`);

    const countries = (data || []).map(c => ({
      name:       c.name?.common,
      flag:       c.flags?.svg,
      capital:    c.capital?.[0] || null,
      currencies: Object.values(c.currencies || {}).map(x => x.name).join(', '),
      languages:  Object.values(c.languages  || {}).join(', '),
    }));

    return res.json({ countries });
  } catch (err) {
    console.error('error in /api/countries:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;
