CREATE TABLE IF NOT EXISTS specialties (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  doctor_id INTEGER NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  specialty_name TEXT NOT NULL,
  board_certified INTEGER DEFAULT 0,
  certifying_board TEXT,
  initial_cert_date DATE,
  recert_date DATE,
  expiration_date DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
