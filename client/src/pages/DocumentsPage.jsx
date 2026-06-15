import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { documents, doctors, workflow as workflowApi } from "../api/index.js";
import { DOC_TYPE_LABELS } from "../utils/constants.js";
import clsx from "clsx";

const statusBadge = {
  missing: "badge-red",
  uploaded: "badge-yellow",
  approved: "badge-green",
  expired: "badge-red",
};
const statusIcon = { missing: "✗", uploaded: "↑", approved: "✓", expired: "!" };

function VersionHistory({ doctorId, docType, expandedType }) {
  const { data: versions = [] } = useQuery({
    queryKey: ["docVersions", doctorId, docType],
    queryFn: () => documents.versions(doctorId, docType),
    enabled: expandedType === docType,
  });

  const handleDownload = async (v) => {
    try {
      const blob = await documents.download(doctorId, docType, v.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = v.file_name;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Download failed");
    }
  };

  return (
    <div className="mt-3 border-t pt-3">
      <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
        Version History
      </h4>
      {versions.length === 0 ? (
        <p className="text-xs text-gray-400">No versions uploaded yet.</p>
      ) : (
        <div className="space-y-1">
          {versions.map((v) => (
            <div
              key={v.id}
              className="flex items-center justify-between text-xs text-gray-600"
            >
              <span>{v.file_name}</span>
              <div className="flex items-center gap-3">
                <span className="text-gray-400">
                  {new Date(v.uploaded_at).toLocaleDateString()}
                </span>
                {v.is_current ? (
                  <span className="badge-green">Current</span>
                ) : null}
                <button
                  className="text-blue-600 hover:underline"
                  onClick={() => handleDownload(v)}
                >
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DocumentsPage() {
  const { id } = useParams();
  const qc = useQueryClient();
  const [uploading, setUploading] = useState({});
  const [expandedType, setExpandedType] = useState(null);
  const [sendingReminder, setSendingReminder] = useState(false);
  const [msg, setMsg] = useState("");

  const { data: doctor } = useQuery({
    queryKey: ["doctor", id],
    queryFn: () => doctors.get(id),
  });
  const { data: docs = [], isLoading } = useQuery({
    queryKey: ["documents", id],
    queryFn: () => documents.list(id),
  });
  const { data: missingForms = [] } = useQuery({
    queryKey: ["missingForms", id],
    queryFn: () => workflowApi.missingForms(id),
  });

  const handleUpload = async (docType, file) => {
    setUploading((u) => ({ ...u, [docType]: true }));
    try {
      await documents.upload(id, docType, file);
      qc.invalidateQueries({ queryKey: ["documents", id] });
      qc.invalidateQueries({ queryKey: ["missingForms", id] });
    } catch (err) {
      alert(err.response?.data?.error || "Upload failed");
    } finally {
      setUploading((u) => ({ ...u, [docType]: false }));
    }
  };

  const handleStatusChange = async (docType, status) => {
    try {
      await documents.updateStatus(id, docType, { status });
      qc.invalidateQueries({ queryKey: ["documents", id] });
    } catch (err) {
      setMsg(err.response?.data?.error || "Failed to update status.");
      setTimeout(() => setMsg(""), 4000);
    }
  };

  const handleReminder = async () => {
    setSendingReminder(true);
    try {
      const result = await workflowApi.sendReminder(id);
      setMsg(
        result.missing?.length
          ? `Reminder sent for ${result.missing.length} missing docs.`
          : "No missing forms.",
      );
    } catch {
      setMsg("Failed to send reminder.");
    }
    setSendingReminder(false);
    setTimeout(() => setMsg(""), 5000);
  };

  if (isLoading)
    return <div className="text-center py-20 text-gray-400">Loading...</div>;

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link to="/doctors" className="hover:text-blue-600">
          Doctors
        </Link>
        <span>/</span>
        <Link to={`/doctors/${id}`} className="hover:text-blue-600">
          {doctor ? `Dr. ${doctor.first_name} ${doctor.last_name}` : "Doctor"}
        </Link>
        <span>/</span>
        <span>Documents</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Document Checklist</h1>
        <div className="flex gap-2">
          {missingForms.length > 0 && (
            <button
              className="btn-secondary"
              onClick={handleReminder}
              disabled={sendingReminder}
            >
              {sendingReminder
                ? "Sending..."
                : `Send Reminder (${missingForms.length} missing)`}
            </button>
          )}
        </div>
      </div>

      {msg && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-blue-700 text-sm">
          {msg}
        </div>
      )}

      <div className="grid gap-3">
        {docs.map((doc) => (
          <div key={doc.doc_type} className="card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span
                  className={clsx(
                    "text-lg font-bold",
                    doc.status === "missing"
                      ? "text-red-500"
                      : doc.status === "approved"
                        ? "text-green-600"
                        : "text-yellow-500",
                  )}
                >
                  {statusIcon[doc.status]}
                </span>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {DOC_TYPE_LABELS[doc.doc_type] || doc.doc_type}
                  </h3>
                  {doc.file_name && (
                    <p className="text-xs text-gray-500">
                      {doc.file_name} —{" "}
                      {doc.uploaded_at
                        ? new Date(doc.uploaded_at).toLocaleDateString()
                        : ""}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={statusBadge[doc.status]}>{doc.status}</span>
                <select
                  className="input w-32 py-1 text-xs"
                  value={doc.status}
                  onChange={(e) =>
                    handleStatusChange(doc.doc_type, e.target.value)
                  }
                >
                  <option value="missing">Missing</option>
                  <option value="uploaded">Uploaded</option>
                  <option value="approved">Approved</option>
                  <option value="expired">Expired</option>
                </select>
                <label className="btn-primary btn-sm cursor-pointer">
                  {uploading[doc.doc_type] ? "Uploading..." : "Upload"}
                  <input
                    type="file"
                    className="hidden"
                    disabled={uploading[doc.doc_type]}
                    onChange={(e) => {
                      if (e.target.files[0])
                        handleUpload(doc.doc_type, e.target.files[0]);
                      e.target.value = "";
                    }}
                  />
                </label>
                <button
                  className="btn-secondary btn-sm"
                  onClick={() =>
                    setExpandedType(
                      expandedType === doc.doc_type ? null : doc.doc_type,
                    )
                  }
                >
                  {expandedType === doc.doc_type ? "Hide" : "History"}
                </button>
              </div>
            </div>
            {expandedType === doc.doc_type && (
              <VersionHistory
                doctorId={id}
                docType={doc.doc_type}
                expandedType={expandedType}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
