import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { doctors, auth as authApi } from "../api/index.js";
import { CREDENTIALING_STATUSES, STATUS_LABELS } from "../utils/constants.js";
import PersonalInfoTab from "../components/doctor/tabs/PersonalInfoTab.jsx";
import ProfessionalIdsTab from "../components/doctor/tabs/ProfessionalIdsTab.jsx";
import EducationTab from "../components/doctor/tabs/EducationTab.jsx";
import SpecialtiesTab from "../components/doctor/tabs/SpecialtiesTab.jsx";
import PracticeLocationsTab from "../components/doctor/tabs/PracticeLocationsTab.jsx";
import HospitalAffiliationsTab from "../components/doctor/tabs/HospitalAffiliationsTab.jsx";
import CredentialingContactsTab from "../components/doctor/tabs/CredentialingContactsTab.jsx";
import LiabilityInsuranceTab from "../components/doctor/tabs/LiabilityInsuranceTab.jsx";
import EmploymentHistoryTab from "../components/doctor/tabs/EmploymentHistoryTab.jsx";
import ReferencesTab from "../components/doctor/tabs/ReferencesTab.jsx";
import DisclosureTab from "../components/doctor/tabs/DisclosureTab.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const TABS = [
  { id: "personal", label: "Personal Info" },
  { id: "ids", label: "Professional IDs" },
  { id: "education", label: "Education" },
  { id: "specialties", label: "Specialties" },
  { id: "locations", label: "Practice Locations" },
  { id: "hospitals", label: "Hospital Affiliations" },
  { id: "contacts", label: "Contacts" },
  { id: "insurance", label: "Liability Insurance" },
  { id: "employment", label: "Employment" },
  { id: "references", label: "References" },
  { id: "disclosures", label: "Disclosures" },
];

export default function DoctorDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useAuth();
  const isNew = !id;
  const [activeTab, setActiveTab] = useState("personal");
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const { data: doctor, isLoading } = useQuery({
    queryKey: ["doctor", id],
    queryFn: () => doctors.get(id),
    enabled: !isNew,
  });

  useEffect(() => {
    if (doctor) setForm(doctor);
  }, [doctor]);

  const { data: workers = [] } = useQuery({
    queryKey: ["users"],
    queryFn: authApi.users,
    enabled: user?.role === "admin",
  });

  const handleSave = async () => {
    setSaving(true);
    setMsg("");
    try {
      if (isNew) {
        const newDoc = await doctors.create(form);
        navigate(`/doctors/${newDoc.id}`);
      } else {
        await doctors.update(id, form);
        qc.invalidateQueries({ queryKey: ["doctor", id] });
        qc.invalidateQueries({ queryKey: ["doctors"] });
        setMsg("Saved successfully.");
        setTimeout(() => setMsg(""), 3000);
      }
    } catch (err) {
      setMsg(err.response?.data?.error || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (!isNew && isLoading)
    return <div className="text-center py-20 text-gray-400">Loading...</div>;

  const currentDoctor = isNew ? form : doctor || form;

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link to="/doctors" className="hover:text-blue-600">
          Doctors
        </Link>
        <span>/</span>
        <span className="text-gray-700">
          {isNew
            ? "New Doctor"
            : `Dr. ${currentDoctor.first_name || ""} ${currentDoctor.last_name || ""}`}
        </span>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">
          {isNew
            ? "Add New Doctor"
            : `Dr. ${currentDoctor.first_name || ""} ${currentDoctor.last_name || ""}`}
        </h1>
        {!isNew && (
          <div className="flex gap-2">
            <Link to={`/doctors/${id}/documents`} className="btn-secondary">
              Documents
            </Link>
            <Link to={`/doctors/${id}/workflow`} className="btn-secondary">
              Workflow
            </Link>
            <Link to={`/doctors/${id}/tdi`} className="btn-secondary">
              TDI
            </Link>
          </div>
        )}
      </div>

      {/* TDI banner */}
      {!isNew && doctor && !doctor.tdi_completed && (
        <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-md flex items-center justify-between">
          <div className="text-sm text-orange-800">
            <strong>⚠️ TDI Application Pending:</strong> Texas Standardized
            Credentialing Application has not been signed yet. Only the doctor
            can sign this form.
          </div>
          <Link
            to={`/doctors/${id}/tdi`}
            className="btn-sm btn-secondary ml-4 shrink-0"
          >
            Manage TDI →
          </Link>
        </div>
      )}

      {/* Top-level fields */}
      <div className="card mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="label">First Name *</label>
            <input
              className="input"
              value={form.first_name || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, first_name: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="label">Middle Name</label>
            <input
              className="input"
              value={form.middle_name || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, middle_name: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="label">Last Name *</label>
            <input
              className="input"
              value={form.last_name || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, last_name: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="label">NPI</label>
            <input
              className="input"
              value={form.npi || ""}
              onChange={(e) => setForm((f) => ({ ...f, npi: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">CAQH ID</label>
            <input
              className="input"
              value={form.caqh_id || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, caqh_id: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="label">Primary Specialty</label>
            <input
              className="input"
              value={form.primary_specialty || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, primary_specialty: e.target.value }))
              }
            />
          </div>
          {user?.role === "admin" && (
            <div>
              <label className="label">Credentialing Status</label>
              <select
                className="input"
                value={form.credentialing_status || "pending"}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    credentialing_status: e.target.value,
                  }))
                }
              >
                {CREDENTIALING_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
          )}
          {user?.role === "admin" && (
            <div>
              <label className="label">Assigned Worker</label>
              <select
                className="input"
                value={form.assigned_worker_id || ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    assigned_worker_id: e.target.value || null,
                  }))
                }
              >
                <option value="">Unassigned</option>
                {workers.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="label">Re-credentialing Due Date</label>
            <input
              type="date"
              className="input"
              value={form.recredentialing_due_date || ""}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  recredentialing_due_date: e.target.value,
                }))
              }
            />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button
            className="btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : isNew ? "Create Doctor" : "Save Changes"}
          </button>
          {msg && (
            <span
              className={`text-sm ${msg.includes("fail") || msg.includes("Error") ? "text-red-600" : "text-green-600"}`}
            >
              {msg}
            </span>
          )}
        </div>
      </div>

      {/* Profile tabs (only after doctor is created) */}
      {!isNew && (
        <>
          <div className="flex border-b border-gray-200 mb-4 overflow-x-auto">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === t.id
                    ? "border-blue-700 text-blue-700"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div>
            {activeTab === "personal" && (
              <PersonalInfoTab
                doctorId={id}
                doctor={doctor}
                onUpdate={(f) => {
                  setForm((p) => ({ ...p, ...f }));
                  doctors
                    .update(id, f)
                    .then(() =>
                      qc.invalidateQueries({ queryKey: ["doctor", id] }),
                    )
                    .catch((err) =>
                      setMsg(err.response?.data?.error || "Save failed"),
                    );
                }}
              />
            )}
            {activeTab === "ids" && <ProfessionalIdsTab doctorId={id} />}
            {activeTab === "education" && <EducationTab doctorId={id} />}
            {activeTab === "specialties" && <SpecialtiesTab doctorId={id} />}
            {activeTab === "locations" && (
              <PracticeLocationsTab doctorId={id} />
            )}
            {activeTab === "hospitals" && (
              <HospitalAffiliationsTab doctorId={id} />
            )}
            {activeTab === "contacts" && (
              <CredentialingContactsTab doctorId={id} />
            )}
            {activeTab === "insurance" && (
              <LiabilityInsuranceTab doctorId={id} />
            )}
            {activeTab === "employment" && (
              <EmploymentHistoryTab doctorId={id} />
            )}
            {activeTab === "references" && <ReferencesTab doctorId={id} />}
            {activeTab === "disclosures" && <DisclosureTab doctorId={id} />}
          </div>
        </>
      )}
    </div>
  );
}
