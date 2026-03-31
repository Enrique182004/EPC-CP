export const DOC_TYPE_LABELS = {
  liability_insurance: 'Liability Insurance',
  standard_auth_release: 'Standard Authorization, Attestation & Release',
  dea: 'DEA Certificate',
  state_authorization: 'State Authorization',
  state_license: 'State License',
  state_release: 'State Release',
}

export const STATUS_LABELS = {
  pending: 'Pending',
  in_progress: 'In Progress',
  complete: 'Complete',
  expired: 'Expired',
}

export const CREDENTIALING_STATUSES = ['pending','in_progress','complete','expired']

export const EDUCATION_TYPES = ['medical_school','residency','fellowship','internship','other']

export const AFFILIATION_TYPES = ['active','courtesy','consulting','provisional']

export const CONTACT_TYPES = ['primary','billing','office_manager','other']

export const COVERAGE_TYPES = ['claims_made','occurrence']

export const ID_TYPES = ['NPI','DEA','state_license','medicaid','medicare','UPIN','CAQH','other']

export const DISCLOSURE_QUESTIONS = [
  { key: 'malpractice_claims', label: 'Have you ever had any malpractice claims filed against you?' },
  { key: 'license_revoked', label: 'Has your license ever been revoked or suspended?' },
  { key: 'license_suspended', label: 'Have you ever had your license placed on probation?' },
  { key: 'dea_revoked', label: 'Has your DEA registration ever been revoked or suspended?' },
  { key: 'felony_conviction', label: 'Have you ever been convicted of a felony?' },
  { key: 'hospital_privileges_revoked', label: 'Have your hospital privileges ever been denied, revoked, or suspended?' },
  { key: 'board_action', label: 'Have you ever been the subject of disciplinary action by a medical board?' },
  { key: 'bankruptcy', label: 'Have you ever filed for bankruptcy?' },
  { key: 'substance_abuse', label: 'Have you ever been treated for substance abuse?' },
  { key: 'mental_health_condition', label: 'Do you have any mental health condition that may affect your ability to practice?' },
  { key: 'physical_condition', label: 'Do you have any physical condition that may affect your ability to practice?' },
  { key: 'medicare_sanction', label: 'Have you ever been excluded from Medicare or Medicaid?' },
]
