import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import SQLiteStoreFactory from 'connect-sqlite3';
import { getDb } from './db.js';
import authRoutes from './routes/auth.js';
import keyRoutes from './routes/keys.js';
import countryRoutes from './routes/countries.js';

dotenv.config();

const app = express();
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

// Session setup
const SQLiteStore = SQLiteStoreFactory(session);
app.use(session({
  store: new SQLiteStore({ db: 'sessions.db', dir: './data' }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: { maxAge: 30 * 60 * 1000, secure: false, sameSite: 'lax' } 
}));

// Initialize DB
await getDb();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/keys', keyRoutes);
app.use('/api/countries', countryRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));