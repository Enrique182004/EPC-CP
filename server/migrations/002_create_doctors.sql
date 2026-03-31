CREATE TABLE IF NOT EXISTS doctors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  -- Personal Info
  first_name TEXT NOT NULL,
  middle_name TEXT,
  last_name TEXT NOT NULL,
  suffix TEXT,
  date_of_birth DATE,
  ssn_last4 TEXT,
  gender TEXT,
  home_address TEXT,
  home_city TEXT,
  home_state TEXT,
  home_zip TEXT,
  home_phone TEXT,
  cell_phone TEXT,
  personal_email TEXT,
  -- Professional
  npi TEXT UNIQUE,
  caqh_id TEXT UNIQUE,
  work_email TEXT,
  primary_specialty TEXT,
  -- Status
  credentialing_status TEXT DEFAULT 'pending' CHECK(credentialing_status IN ('pending','in_progress','complete','expired')),
  assigned_worker_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  -- TDI
  tdi_completed INTEGER DEFAULT 0,
  -- Re-credentialing
  recredentialing_due_date DATE,
  -- Notes
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
