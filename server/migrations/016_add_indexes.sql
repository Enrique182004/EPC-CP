-- Performance indexes for high-cardinality FK and filter columns
CREATE INDEX IF NOT EXISTS idx_documents_doctor_id ON documents(doctor_id);
CREATE INDEX IF NOT EXISTS idx_professional_ids_doctor_id ON professional_ids(doctor_id);
CREATE INDEX IF NOT EXISTS idx_professional_ids_expiration ON professional_ids(expiration_date);
CREATE INDEX IF NOT EXISTS idx_liability_insurance_doctor_id ON liability_insurance(doctor_id);
CREATE INDEX IF NOT EXISTS idx_liability_insurance_is_current ON liability_insurance(is_current);
CREATE INDEX IF NOT EXISTS idx_workflow_instances_doctor_id ON workflow_instances(doctor_id);
CREATE INDEX IF NOT EXISTS idx_workflow_step_instances_workflow_id ON workflow_step_instances(workflow_id);
CREATE INDEX IF NOT EXISTS idx_alert_log_doctor_id ON alert_log(doctor_id);
CREATE INDEX IF NOT EXISTS idx_alert_log_sent_at ON alert_log(sent_at);
CREATE INDEX IF NOT EXISTS idx_disclosures_doctor_id ON disclosures(doctor_id);
CREATE INDEX IF NOT EXISTS idx_tdi_applications_doctor_id ON tdi_applications(doctor_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_doctor_id ON calendar_events(doctor_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_owner ON calendar_events(calendar_owner);
CREATE INDEX IF NOT EXISTS idx_doctors_assigned_worker ON doctors(assigned_worker_id);
CREATE INDEX IF NOT EXISTS idx_doctors_status ON doctors(credentialing_status);
CREATE INDEX IF NOT EXISTS idx_document_versions_document_id ON document_versions(document_id);
