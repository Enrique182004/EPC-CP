CREATE TABLE IF NOT EXISTS liability_insurance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  doctor_id INTEGER NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  carrier_name TEXT NOT NULL,
  policy_number TEXT NOT NULL,
  coverage_type TEXT,
  per_occurrence_limit REAL,
  aggregate_limit REAL,
  effective_date DATE NOT NULL,
  expiration_date DATE NOT NULL,
  tail_coverage INTEGER DEFAULT 0,
  tail_effective_date DATE,
  tail_expiration_date DATE,
  is_current INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
