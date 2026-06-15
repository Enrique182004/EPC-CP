const jwt = require("jsonwebtoken");
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "dev_refresh_secret_change_me";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

if (
  process.env.NODE_ENV === "production" &&
  (JWT_SECRET === "dev_secret_change_me" ||
    JWT_REFRESH_SECRET === "dev_refresh_secret_change_me")
) {
  console.error(
    "[SECURITY] Refusing to start: JWT secrets are using default development values in production. " +
      "Set JWT_SECRET and JWT_REFRESH_SECRET environment variables.",
  );
  process.exit(1);
}

function signAccessToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function signRefreshToken(payload) {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
  });
}

function verifyAccessToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, JWT_REFRESH_SECRET);
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
