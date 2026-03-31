CREATE TABLE IF NOT EXISTS alert_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  doctor_id INTEGER NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL,
  subject_id INTEGER,
  sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  recipient_email TEXT,
  success INTEGER DEFAULT 1,
  error_message TEXT
);

CREATE TABLE IF NOT EXISTS calendar_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  doctor_id INTEGER NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  google_event_id TEXT,
  calendar_owner TEXT,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tdi_applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  doctor_id INTEGER NOT NULL UNIQUE REFERENCES doctors(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'not_started' CHECK(status IN ('not_started','sent_to_doctor','signed','filed')),
  sent_at DATETIME,
  signed_at DATETIME,
  filed_at DATETIME,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
