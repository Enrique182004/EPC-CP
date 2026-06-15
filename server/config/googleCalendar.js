const { google } = require("googleapis");
const crypto = require("crypto");
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI =
  process.env.GOOGLE_REDIRECT_URI ||
  "http://localhost:5000/api/calendar/oauth/callback";

function createOAuth2Client(refreshToken = null) {
  const client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
  if (refreshToken) {
    client.setCredentials({ refresh_token: refreshToken });
  }
  return client;
}

function signState(userId) {
  const sig = crypto
    .createHmac("sha256", process.env.JWT_SECRET || "dev_secret_change_me")
    .update(String(userId))
    .digest("hex");
  return `${userId}.${sig}`;
}

function verifyState(state) {
  try {
    const dot = state.lastIndexOf(".");
    if (dot === -1) return null;
    const id = state.slice(0, dot);
    const sig = state.slice(dot + 1);
    const expected = crypto
      .createHmac("sha256", process.env.JWT_SECRET || "dev_secret_change_me")
      .update(id)
      .digest("hex");
    const sigBuf = Buffer.from(sig, "hex");
    const expBuf = Buffer.from(expected, "hex");
    if (sigBuf.length !== expBuf.length) return null;
    const valid = crypto.timingSafeEqual(sigBuf, expBuf);
    return valid ? parseInt(id) : null;
  } catch {
    return null;
  }
}

function getAuthUrl(userId) {
  const client = createOAuth2Client();
  return client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/calendar.events"],
    state: signState(userId),
    prompt: "consent",
  });
}

async function exchangeCode(code) {
  const client = createOAuth2Client();
  const { tokens } = await client.getToken(code);
  return tokens;
}

function getCalendar(refreshToken) {
  const auth = createOAuth2Client(refreshToken);
  return google.calendar({ version: "v3", auth });
}

module.exports = {
  getAuthUrl,
  exchangeCode,
  getCalendar,
  createOAuth2Client,
  verifyState,
};
