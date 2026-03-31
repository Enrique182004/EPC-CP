CREATE TABLE IF NOT EXISTS credentialing_contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  doctor_id INTEGER NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  contact_name TEXT NOT NULL,
  title TEXT,
  organization TEXT,
  phone TEXT,
  fax TEXT,
  email TEXT,
  contact_type TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
