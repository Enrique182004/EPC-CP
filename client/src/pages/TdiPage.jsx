import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { tdi, doctors } from "../api/index.js";
import { useState, useEffect } from "react";
import { formatDate } from "../utils/dateHelpers.js";

const STATUSES = [
  { value: "not_started", label: "Not Started", color: "badge-gray" },
  { value: "sent_to_doctor", label: "Sent to Doctor", color: "badge-yellow" },
  { value: "signed", label: "Signed by Doctor", color: "badge-green" },
  { value: "filed", label: "Filed", color: "badge-blue" },
];

export default function TdiPage() {
  const { id } = useParams();
  const qc = useQueryClient();
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => { setNotes(""); }, [id]);

  const { data: doctor } = useQuery({
    queryKey: ["doctor", id],
    queryFn: () => doctors.get(id),
  });
  const { data: tdiData, isLoading } = useQuery({
    queryKey: ["tdi", id],
    queryFn: () => tdi.get(id),
  });

  const handleUpdate = async (status) => {
    setSaving(true);
    try {
      await tdi.update(id, { status, notes: notes || tdiData?.notes });
      qc.invalidateQueries(["tdi", id]);
      qc.invalidateQueries(["doctor", id]);
      setMsg("TDI status updated.");
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      setMsg(err.response?.data?.error || "Update failed.");
    }
    setSaving(false);
  };

  if (isLoading)
    return <div className="text-center py-20 text-gray-400">Loading...</div>;

  const currentStatusInfo = STATUSES.find((s) => s.value === tdiData?.status);

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link to="/doctors" className="hover:text-blue-600">
          Doctors
        </Link>
        <span>/</span>
        <Link to={`/doctors/${id}`} className="hover:text-blue-600">
          {doctor ? `Dr. ${doctor.first_name} ${doctor.last_name}` : "Doctor"}
        </Link>
        <span>/</span>
        <span>TDI Application</span>
      </div>

      <h1 className="text-2xl font-bold mb-6">
        Texas Standardized Credentialing Application (TDI)
      </h1>

      <div className="card mb-4 border-l-4 border-l-orange-400 bg-orange-50">
        <h3 className="font-semibold text-orange-800 mb-2">
          ⚠️ Important Notice
        </h3>
        <ul className="text-sm text-orange-700 space-y-1 list-disc list-inside">
          <li>
            This application is completed <strong>only once</strong> at the
            start of the credentialing process.
          </li>
          <li>
            <strong>Only the doctor can sign</strong> this document — workers
            must not sign on their behalf.
          </li>
          <li>Do not re-request this form once signed.</li>
        </ul>
      </div>

      <div className="card mb-4">
        <h3 className="font-semibold mb-4">Current Status</h3>
        <div className="flex items-center gap-3 mb-4">
          <span className={currentStatusInfo?.color || "badge-gray"}>
            {currentStatusInfo?.label || tdiData?.status}
          </span>
          {tdiData?.sent_at && (
            <span className="text-xs text-gray-500">
              Sent: {formatDate(tdiData.sent_at)}
            </span>
          )}
          {tdiData?.signed_at && (
            <span className="text-xs text-gray-500">
              Signed: {formatDate(tdiData.signed_at)}
            </span>
          )}
          {tdiData?.filed_at && (
            <span className="text-xs text-gray-500">
              Filed: {formatDate(tdiData.filed_at)}
            </span>
          )}
        </div>

        <div className="mb-4">
          <label className="label">Notes</label>
          <textarea
            className="input"
            rows={3}
            value={notes || tdiData?.notes || ""}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes about this TDI application..."
          />
        </div>

        {msg && (
          <p
            className={`text-sm mb-3 ${msg.includes("fail") ? "text-red-600" : "text-green-600"}`}
          >
            {msg}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          {STATUSES.filter((s) => s.value !== tdiData?.status).map((s) => (
            <button
              key={s.value}
              className="btn-secondary"
              onClick={() => handleUpdate(s.value)}
              disabled={saving}
            >
              Mark as: {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Status Timeline */}
      <div className="card">
        <h3 className="font-semibold mb-4">Process Steps</h3>
        <ol className="relative border-l border-gray-200 ml-3 space-y-4">
          {STATUSES.map((s, i) => {
            const isDone =
              STATUSES.findIndex((x) => x.value === tdiData?.status) >= i;
            return (
              <li key={s.value} className="ml-6">
                <span
                  className={`absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full ${isDone ? "bg-green-100" : "bg-gray-100"}`}
                >
                  {isDone ? (
                    "✓"
                  ) : (
                    <span className="text-gray-400 text-xs">{i + 1}</span>
                  )}
                </span>
                <p
                  className={`text-sm font-medium ${isDone ? "text-green-700" : "text-gray-500"}`}
                >
                  {s.label}
                </p>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
