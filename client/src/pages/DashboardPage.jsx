import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { dashboard } from "../api/index.js";
import { useAuth } from "../context/AuthContext.jsx";
import {
  formatDate,
  urgencyLabel,
  doctorStatusColor,
} from "../utils/dateHelpers.js";
import { STATUS_LABELS } from "../utils/constants.js";
import clsx from "clsx";

const colorBand = {
  green: "bg-green-500",
  yellow: "bg-yellow-400",
  red: "bg-red-500",
  blue: "bg-blue-500",
  gray: "bg-gray-300",
};
const colorText = {
  green: "text-green-700",
  yellow: "text-yellow-700",
  red: "text-red-700",
  blue: "text-blue-700",
  gray: "text-gray-500",
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: dashboard.get,
    refetchInterval: 60_000,
  });

  if (isLoading)
    return (
      <div className="text-center py-20 text-gray-500">
        Loading dashboard...
      </div>
    );
  if (error)
    return (
      <div className="text-center py-20 text-red-500">
        Failed to load dashboard.
      </div>
    );

  const {
    expiringLicenses = [],
    expiringInsurance = [],
    expiringRecredentialing = [],
    doctorGrid = [],
    missingForms = [],
    pendingTdi = [],
    stalledWorkflows = [],
    totals = {},
  } = data;

  const allExpiring = [
    ...expiringLicenses.map((r) => ({
      ...r,
      type: r.id_type,
      date: r.expiration_date,
    })),
    ...expiringInsurance.map((r) => ({
      ...r,
      type: "Insurance",
      date: r.expiration_date,
    })),
    ...expiringRecredentialing.map((r) => ({
      ...r,
      type: "Re-credentialing",
      date: r.recredentialing_due_date,
    })),
  ].sort((a, b) => a.days_until - b.days_until);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <span className="text-sm text-gray-500">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </span>
      </div>

      {/* Status Totals */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {[
          {
            label: "Total Doctors",
            value: totals.doctors,
            color: "text-gray-900",
          },
          { label: "Pending", value: totals.pending, color: "text-blue-700" },
          {
            label: "In Progress",
            value: totals.inProgress,
            color: "text-yellow-700",
          },
          {
            label: "Complete",
            value: totals.complete,
            color: "text-green-700",
          },
          { label: "Expired", value: totals.expired, color: "text-red-700" },
        ].map(({ label, value, color }) => (
          <div key={label} className="card text-center">
            <div className={clsx("text-3xl font-bold", color)}>
              {value ?? 0}
            </div>
            <div className="text-xs text-gray-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* Upcoming Expirations */}
        <div className="card">
          <h2 className="text-base font-semibold mb-3 text-gray-800">
            ⚠️ Upcoming Expirations
          </h2>
          {allExpiring.length === 0 ? (
            <p className="text-sm text-gray-400">
              No expirations in the next 90 days.
            </p>
          ) : (
            <div className="space-y-2">
              {allExpiring.slice(0, 10).map((r) => {
                const urgency =
                  r.days_until <= 30
                    ? "red"
                    : r.days_until <= 90
                      ? "yellow"
                      : "green";
                return (
                  <div
                    key={`${r.type}-${r.id}-${r.date}`}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                  >
                    <div>
                      <Link
                        to={`/doctors/${r.id}`}
                        className="text-sm font-medium text-blue-700 hover:underline"
                      >
                        Dr. {r.first_name} {r.last_name}
                      </Link>
                      <div className="text-xs text-gray-500">{r.type}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-700">
                        {formatDate(r.date)}
                      </div>
                      <span
                        className={clsx(
                          "badge text-xs",
                          urgency === "red"
                            ? "badge-red"
                            : urgency === "yellow"
                              ? "badge-yellow"
                              : "badge-green",
                        )}
                      >
                        {urgencyLabel(r.days_until)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Missing Forms */}
        <div className="card">
          <h2 className="text-base font-semibold mb-3 text-gray-800">
            📄 Missing Documents
          </h2>
          {missingForms.length === 0 ? (
            <p className="text-sm text-gray-400">
              All required documents are on file.
            </p>
          ) : (
            <div className="space-y-2">
              {missingForms.slice(0, 10).map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <Link
                    to={`/doctors/${r.id}/documents`}
                    className="text-sm font-medium text-blue-700 hover:underline"
                  >
                    Dr. {r.first_name} {r.last_name}
                  </Link>
                  <span className="badge-red">{r.missing_count} missing</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* Pending TDI */}
        <div className="card">
          <h2 className="text-base font-semibold mb-3 text-gray-800">
            📋 Pending TDI Applications
          </h2>
          {pendingTdi.length === 0 ? (
            <p className="text-sm text-gray-400">
              No pending TDI applications.
            </p>
          ) : (
            <div className="space-y-2">
              {pendingTdi.map((r) => (
                <div
                  key={r.doctor_id}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <Link
                    to={`/doctors/${r.doctor_id}/tdi`}
                    className="text-sm font-medium text-blue-700 hover:underline"
                  >
                    Dr. {r.first_name} {r.last_name}
                  </Link>
                  <span className="badge-yellow capitalize">
                    {r.status.replace("_", " ")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stalled Workflows */}
        <div className="card">
          <h2 className="text-base font-semibold mb-3 text-gray-800">
            ⏳ Stalled Workflows (in progress, 30+ days idle)
          </h2>
          {stalledWorkflows.length === 0 ? (
            <p className="text-sm text-gray-400">No stalled workflows.</p>
          ) : (
            <div className="space-y-2">
              {stalledWorkflows.map((r) => {
                const daysIdle = Math.floor(
                  (Date.now() - new Date(r.updated_at).getTime()) /
                    (1000 * 60 * 60 * 24),
                );
                return (
                  <div
                    key={r.id}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                  >
                    <Link
                      to={`/doctors/${r.id}/workflow`}
                      className="text-sm font-medium text-blue-700 hover:underline"
                    >
                      Dr. {r.first_name} {r.last_name}
                    </Link>
                    <span className="badge-yellow">
                      Step {r.current_step} — {daysIdle} days idle
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Doctor Status Grid */}
      <div className="card">
        <h2 className="text-base font-semibold mb-4 text-gray-800">
          👥 Doctor Status Overview
        </h2>
        {doctorGrid.length === 0 ? (
          <p className="text-sm text-gray-400">
            No doctors in the system yet.{" "}
            {user?.role === "admin" && (
              <Link to="/doctors/new" className="text-blue-600 hover:underline">
                Add the first doctor →
              </Link>
            )}
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
            {doctorGrid.map((doc) => {
              const color = doctorStatusColor(doc);
              return (
                <Link
                  key={doc.id}
                  to={`/doctors/${doc.id}`}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div
                    className={clsx("h-2", colorBand[color] || "bg-gray-300")}
                  />
                  <div className="p-3">
                    <div className="text-sm font-semibold text-gray-800 truncate">
                      Dr. {doc.first_name} {doc.last_name}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5 truncate">
                      {doc.worker_name || "Unassigned"}
                    </div>
                    <div
                      className={clsx(
                        "text-xs font-medium mt-2",
                        colorText[color],
                      )}
                    >
                      {STATUS_LABELS[doc.credentialing_status] ||
                        doc.credentialing_status}
                    </div>
                    {doc.missing_docs_count > 0 && (
                      <div className="text-xs text-red-600 mt-1">
                        {doc.missing_docs_count} docs missing
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
