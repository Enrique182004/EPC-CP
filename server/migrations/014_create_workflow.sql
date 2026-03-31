CREATE TABLE IF NOT EXISTS workflow_steps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  step_number INTEGER NOT NULL UNIQUE,
  step_name TEXT NOT NULL,
  description TEXT,
  required_doc_types TEXT
);

INSERT OR IGNORE INTO workflow_steps (step_number, step_name, description, required_doc_types) VALUES
(1, 'Initial Intake', 'Collect and enter all personal and professional information', '[]'),
(2, 'Document Collection', 'Upload all required credentialing documents', '["liability_insurance","standard_auth_release","dea","state_authorization","state_license","state_release"]'),
(3, 'Verification', 'Verify NPI, DEA, licenses and all credentials with primary sources', '[]'),
(4, 'Application Submission', 'Submit credentialing applications to payers and facilities', '[]'),
(5, 'Payer Review', 'Awaiting payer credentialing committee review', '[]'),
(6, 'Credentialing Committee', 'Under credentialing committee review and approval', '[]'),
(7, 'Credentialing Complete', 'Finalize credentialing and schedule re-credentialing', '[]');

CREATE TABLE IF NOT EXISTS workflow_instances (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  doctor_id INTEGER NOT NULL UNIQUE REFERENCES doctors(id) ON DELETE CASCADE,
  current_step INTEGER DEFAULT 1,
  status TEXT DEFAULT 'active' CHECK(status IN ('active','on_hold','complete')),
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workflow_step_instances (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  workflow_id INTEGER NOT NULL REFERENCES workflow_instances(id) ON DELETE CASCADE,
  step_id INTEGER NOT NULL REFERENCES workflow_steps(id),
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending','in_progress','complete','blocked')),
  completed_by INTEGER REFERENCES users(id),
  completed_at DATETIME,
  notes TEXT,
  UNIQUE(workflow_id, step_id)
);
