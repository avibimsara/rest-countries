// server/src/routes/auth.js
import express from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import UserDAO from "../dao/UserDAO.js";
import ApiKeyDAO from "../dao/APIKeyDAO.js";

const SALT_ROUNDS = 12;
const router = express.Router();
const USER_REGEX = /^[A-Za-z0-9_]+$/;

// Helper to validate lengths
function validCredentials(username, password) {
  const u = username.trim();
  return (
    u.length >= 3 &&
    u.length <= 10 &&
    password.length >= 3 &&
    password.length <= 8
  );
}

// Register
router.post("/register", async (req, res) => {
  const { username = "", password = "" } = req.body;
  const u = username.trim();

  if (!u || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required." });
  }
  if (
    u.length < 3 ||
    u.length > 10 ||
    password.length < 3 ||
    password.length > 8
  ) {
    return res.status(400).json({
      message: "Username must be 3-10 chars; password must be 3-8 chars.",
    });
  }
  if (!USER_REGEX.test(u)) {
    return res.status(400).json({
      message: "Username can only contain letters, numbers, or underscores.",
    });
  }

  try {
    const userDao = await UserDAO.getInstance();
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const userId = await userDao.createUser(u, passwordHash);

    return res.status(201).json({ message: "User registered.", userId });
  } catch (err) {
    console.error("Register error:", err);
    if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(409).json({ message: "Username already taken." });
    }
    return res.status(500).json({ message: "Server error." });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { username = "", password = "" } = req.body;
  const u = username.trim();


  if (!u || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required." });
  }

  if (!validCredentials(u, password)) {
    return res.status(400).json({
      message: "Username must be 3-10 chars; password must be 3-8 chars.",
    });
  }

  try {
    const userDao = await UserDAO.getInstance();
    const user = await userDao.findByUsername(u);

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // Create session
    req.session.userId = user.id;

    // Generate and store API key
    const apiKeyDao = await ApiKeyDAO.getInstance();
    const newKey = crypto.randomBytes(32).toString("hex");
    await apiKeyDao.createKey(user.id, newKey);

    return res.json({ apiKey: newKey });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error." });
  }
});

// Logout
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Session destroy error:", err);
      return res.status(500).json({ message: "Logout failed." });
    }
    res.clearCookie("connect.sid");
    return res.status(204).end();
  });
});

export default router;
