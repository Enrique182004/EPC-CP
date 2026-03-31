import api from './axiosClient'

// Auth
export const auth = {
  login: (data) => api.post('/auth/login', data).then(r => r.data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me').then(r => r.data),
  register: (data) => api.post('/auth/register', data).then(r => r.data),
  users: () => api.get('/auth/users').then(r => r.data),
}

// Dashboard
export const dashboard = {
  get: () => api.get('/dashboard').then(r => r.data),
}

// Doctors
export const doctors = {
  list: (params) => api.get('/doctors', { params }).then(r => r.data),
  get: (id) => api.get(`/doctors/${id}`).then(r => r.data),
  create: (data) => api.post('/doctors', data).then(r => r.data),
  update: (id, data) => api.patch(`/doctors/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/doctors/${id}`).then(r => r.data),
}

// Profile sub-resources
const profileResource = (path) => ({
  list: (doctorId) => api.get(`/doctors/${doctorId}/${path}`).then(r => r.data),
  create: (doctorId, data) => api.post(`/doctors/${doctorId}/${path}`, data).then(r => r.data),
  update: (doctorId, subId, data) => api.patch(`/doctors/${doctorId}/${path}/${subId}`, data).then(r => r.data),
  delete: (doctorId, subId) => api.delete(`/doctors/${doctorId}/${path}/${subId}`).then(r => r.data),
})

export const professionalIds = profileResource('professional-ids')
export const education = profileResource('education')
export const specialties = profileResource('specialties')
export const practiceLocations = profileResource('practice-locations')
export const hospitalAffiliations = profileResource('hospital-affiliations')
export const credentialingContacts = profileResource('credentialing-contacts')
export const liabilityInsurance = profileResource('liability-insurance')
export const employmentHistory = profileResource('employment-history')
export const professionalReferences = profileResource('professional-references')

export const disclosures = {
  get: (doctorId) => api.get(`/doctors/${doctorId}/disclosures`).then(r => r.data),
  save: (doctorId, data) => api.put(`/doctors/${doctorId}/disclosures`, data).then(r => r.data),
}

// Documents
export const documents = {
  list: (doctorId) => api.get(`/doctors/${doctorId}/documents`).then(r => r.data),
  upload: (doctorId, type, file, onProgress) => {
    const form = new FormData()
    form.append('file', file)
    return api.post(`/doctors/${doctorId}/documents/${type}/upload`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress,
    }).then(r => r.data)
  },
  versions: (doctorId, type) => api.get(`/doctors/${doctorId}/documents/${type}/versions`).then(r => r.data),
  updateStatus: (doctorId, type, data) => api.patch(`/doctors/${doctorId}/documents/${type}`, data).then(r => r.data),
  downloadUrl: (doctorId, type, versionId) => `/api/doctors/${doctorId}/documents/${type}/download/${versionId}`,
}

// Workflow
export const workflow = {
  get: (doctorId) => api.get(`/doctors/${doctorId}/workflow`).then(r => r.data),
  advance: (doctorId) => api.post(`/doctors/${doctorId}/workflow/advance`).then(r => r.data),
  updateStep: (doctorId, stepId, data) => api.patch(`/doctors/${doctorId}/workflow/step/${stepId}`, data).then(r => r.data),
  missingForms: (doctorId) => api.get(`/doctors/${doctorId}/workflow/missing-forms`).then(r => r.data),
  sendReminder: (doctorId) => api.post(`/doctors/${doctorId}/workflow/send-reminder`).then(r => r.data),
}

// Alerts
export const alerts = {
  list: (params) => api.get('/alerts', { params }).then(r => r.data),
  forDoctor: (doctorId) => api.get(`/alerts/doctor/${doctorId}`).then(r => r.data),
  trigger: () => api.post('/alerts/trigger').then(r => r.data),
}

// TDI
export const tdi = {
  get: (doctorId) => api.get(`/doctors/${doctorId}/tdi`).then(r => r.data),
  update: (doctorId, data) => api.patch(`/doctors/${doctorId}/tdi`, data).then(r => r.data),
}

// Calendar
export const calendar = {
  events: () => api.get('/calendar/events').then(r => r.data),
  create: (data) => api.post('/calendar/events', data).then(r => r.data),
  delete: (id) => api.delete(`/calendar/events/${id}`).then(r => r.data),
  getAuthUrl: () => api.get('/calendar/oauth/url').then(r => r.data),
}
