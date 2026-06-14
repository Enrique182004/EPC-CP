# EPC Medical Credentialing System

## Quick Start

### 1. Install dependencies (first time only)

```bash
npm run install:all
```

### 2. Set up environment

Edit `server/.env` — configure SMTP and Google Calendar if needed (optional for local dev).

### 3. Seed the database (first time only)

```bash
cd server && node seed.js
```

### 4. Start development servers

```bash
npm run dev
```

- Backend: http://localhost:5000
- Frontend: http://localhost:5173

### Default Login

- Email: `admin@epc.local`
- Password: `Admin1234!`
- **Change this password after first login via Users page.**

---

## Production Deployment

### Build frontend

```bash
npm run build
```

### Start production server (serves React build + API)

```bash
NODE_ENV=production npm start
```

The app will be available on port 5000 (configurable via `PORT` env var).

---

## Features

- **Dashboard** — Color-coded doctor status grid, upcoming expirations, missing docs, pending TDI
- **Doctor Profiles** — Full CAQH data (11 tabs): Personal, IDs, Education, Specialties, Locations, Hospitals, Contacts, Insurance, Employment, References, Disclosures
- **Documents** — Checklist of 6 required docs with version history (keeps last 3 versions)
- **Workflow** — 7-step credentialing tracker with progress bar and notes
- **TDI Application** — Texas Standardized form flagged as doctor-sign-only
- **Alerts** — Automatic email alerts at 6 months, 3 months, 1 month before expiration (malpractice, licenses, re-credentialing)
- **Google Calendar** — Connect OAuth to auto-create calendar events
- **Users** — Admin can create worker and admin accounts
- **Role-based auth** — Workers and Admins with JWT + refresh tokens

## Email Setup (Gmail)

1. Enable 2FA on Gmail
2. Create an App Password: Google Account → Security → App Passwords
3. Set `SMTP_USER`, `SMTP_PASS`, and `EMAIL_FROM` in `server/.env`

## Google Calendar Setup

1. Create a project at console.cloud.google.com
2. Enable the Google Calendar API
3. Create OAuth 2.0 credentials
4. Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` in `server/.env`
5. In the app: Settings → Connect Google Calendar
