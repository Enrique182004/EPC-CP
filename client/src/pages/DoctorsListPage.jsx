import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { doctors } from "../api/index.js";
import { STATUS_LABELS, CREDENTIALING_STATUSES } from "../utils/constants.js";
import { useAuth } from "../context/AuthContext.jsx";
import clsx from "clsx";

const statusColor = {
  pending: "badge-blue",
  in_progress: "badge-yellow",
  complete: "badge-green",
  expired: "badge-red",
};

export default function DoctorsListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const { data = [], isLoading } = useQuery({
    queryKey: ["doctors", search, status],
    queryFn: () =>
      doctors.list({
        search: search || undefined,
        status: status || undefined,
      }),
    placeholderData: (prev) => prev,
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Doctors</h1>
        {user?.role === "admin" && (
          <Link to="/doctors/new" className="btn-primary">
            + Add Doctor
          </Link>
        )}
      </div>

      <div className="card mb-4">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search by name, NPI, or CAQH ID..."
            className="input flex-1"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="input w-44"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            {CREDENTIALING_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-gray-400">Loading...</div>
      ) : data.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-gray-400 mb-4">No doctors found.</p>
          <Link to="/doctors/new" className="btn-primary">
            Add First Doctor
          </Link>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full table-auto">
            <thead>
              <tr className="border-b border-gray-200">
                <th>Name</th>
                <th>NPI</th>
                <th>CAQH ID</th>
                <th>Specialty</th>
                <th>Assigned Worker</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((doc) => (
                <tr
                  key={doc.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="font-medium">
                    <Link
                      to={`/doctors/${doc.id}`}
                      className="text-blue-700 hover:underline"
                    >
                      Dr. {doc.first_name} {doc.last_name}
                    </Link>
                  </td>
                  <td className="text-gray-500">{doc.npi || "—"}</td>
                  <td className="text-gray-500">{doc.caqh_id || "—"}</td>
                  <td className="text-gray-600">
                    {doc.primary_specialty || "—"}
                  </td>
                  <td className="text-gray-600">
                    {doc.worker_name || (
                      <span className="text-gray-400">Unassigned</span>
                    )}
                  </td>
                  <td>
                    <span
                      className={
                        statusColor[doc.credentialing_status] || "badge-gray"
                      }
                    >
                      {STATUS_LABELS[doc.credentialing_status] ||
                        doc.credentialing_status}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <Link
                        to={`/doctors/${doc.id}/documents`}
                        className="btn-secondary btn-sm"
                      >
                        Docs
                      </Link>
                      <Link
                        to={`/doctors/${doc.id}/workflow`}
                        className="btn-secondary btn-sm"
                      >
                        Workflow
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
