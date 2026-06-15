const express = require("express");
const bcrypt = require("bcryptjs");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require("../config/jwt");
const User = require("../models/User");
const { authenticate, requireRole } = require("../middleware/auth");

const router = express.Router();

// Pre-computed dummy hash — ensures bcrypt.compare always runs even for unknown emails,
// preventing user enumeration via response-time difference.
const DUMMY_HASH = bcrypt.hashSync("dummy-timing-protection", 12);

// POST /api/auth/login
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email and password required" });

    const user = User.findByEmail(email);
    const valid = await bcrypt.compare(password, user ? user.password_hash : DUMMY_HASH);
    if (!user || !valid) return res.status(401).json({ error: "Invalid credentials" });

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken({ id: user.id });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ token: accessToken, user: payload });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/register (admin only)
router.post(
  "/register",
  authenticate,
  requireRole("admin"),
  async (req, res, next) => {
    try {
      const { email, password, name, role, phone } = req.body;
      if (!email || !password || !name)
        return res
          .status(400)
          .json({ error: "Email, password, and name required" });
      if (password.length < 8)
        return res
          .status(400)
          .json({ error: "Password must be at least 8 characters" });

      const exists = User.findByEmail(email);
      if (exists)
        return res.status(409).json({ error: "Email already registered" });

      const password_hash = await bcrypt.hash(password, 12);
      const result = User.create({
        email,
        password_hash,
        role: role || "worker",
        name,
        phone,
      });
      const newUser = User.findById(result.lastInsertRowid);
      res
        .status(201)
        .json({
          user: {
            id: newUser.id,
            email: newUser.email,
            role: newUser.role,
            name: newUser.name,
          },
        });
    } catch (err) {
      next(err);
    }
  },
);

// POST /api/auth/refresh
router.post("/refresh", (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ error: "No refresh token" });
    const payload = verifyRefreshToken(token);
    const user = User.findById(payload.id);
    if (!user) return res.status(401).json({ error: "User not found" });
    const newPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };
    res.json({ token: signAccessToken(newPayload) });
  } catch (err) {
    res.status(401).json({ error: "Invalid refresh token" });
  }
});

// GET /api/auth/me
router.get("/me", authenticate, (req, res) => {
  const user = User.findById(req.user.id);
  if (!user) return res.status(404).json({ error: "Not found" });
  res.json({
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    phone: user.phone,
  });
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  res.clearCookie("refreshToken");
  res.json({ message: "Logged out" });
});

// GET /api/auth/users (admin)
router.get("/users", authenticate, requireRole("admin"), (req, res) => {
  res.json(User.findAll());
});

module.exports = router;
