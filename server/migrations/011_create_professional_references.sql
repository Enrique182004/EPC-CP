CREATE TABLE IF NOT EXISTS professional_references (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  doctor_id INTEGER NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  ref_name TEXT NOT NULL,
  specialty TEXT,
  relationship TEXT,
  phone TEXT,
  email TEXT,
  years_known INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
