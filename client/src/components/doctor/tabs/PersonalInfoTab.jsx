import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { doctors } from "../../../api/index.js";

export default function PersonalInfoTab({ doctorId, doctor }) {
  const qc = useQueryClient();
  const [form, setForm] = useState(doctor || {});
  const [msg, setMsg] = useState("");

  const save = async () => {
    try {
      await doctors.update(doctorId, form);
      qc.invalidateQueries(["doctor", doctorId]);
      setMsg("Saved.");
      setTimeout(() => setMsg(""), 3000);
    } catch {
      setMsg("Save failed.");
    }
  };

  const f = (field) => ({
    className: "input",
    value: form[field] || "",
    onChange: (e) => setForm((p) => ({ ...p, [field]: e.target.value })),
  });

  return (
    <div className="card">
      <h3 className="font-semibold mb-4">Personal Information</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <label className="label">Suffix</label>
          <input {...f("suffix")} />
        </div>
        <div>
          <label className="label">Date of Birth</label>
          <input type="date" {...f("date_of_birth")} />
        </div>
        <div>
          <label className="label">Gender</label>
          <select
            className="input"
            value={form.gender || ""}
            onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value }))}
          >
            <option value="">Select...</option>
            <option>Male</option>
            <option>Female</option>
            <option>Non-binary</option>
            <option>Prefer not to say</option>
          </select>
        </div>
        <div>
          <label className="label">SSN (Last 4 digits)</label>
          <input maxLength={4} {...f("ssn_last4")} />
        </div>
        <div>
          <label className="label">Home Phone</label>
          <input {...f("home_phone")} />
        </div>
        <div>
          <label className="label">Cell Phone</label>
          <input {...f("cell_phone")} />
        </div>
        <div>
          <label className="label">Personal Email</label>
          <input type="email" {...f("personal_email")} />
        </div>
        <div>
          <label className="label">Work Email</label>
          <input type="email" {...f("work_email")} />
        </div>
        <div className="col-span-full">
          <label className="label">Home Address</label>
          <input {...f("home_address")} />
        </div>
        <div>
          <label className="label">City</label>
          <input {...f("home_city")} />
        </div>
        <div>
          <label className="label">State</label>
          <input {...f("home_state")} />
        </div>
        <div>
          <label className="label">ZIP</label>
          <input {...f("home_zip")} />
        </div>
        <div className="col-span-full">
          <label className="label">Notes</label>
          <textarea
            className="input"
            rows={3}
            value={form.notes || ""}
            onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
          />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button className="btn-primary" onClick={save}>
          Save Personal Info
        </button>
        {msg && <span className="text-sm text-green-600">{msg}</span>}
      </div>
    </div>
  );
}
