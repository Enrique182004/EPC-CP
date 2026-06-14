import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { alerts } from "../api/index.js";
import { useAuth } from "../context/AuthContext.jsx";
import { Link } from "react-router-dom";
import { useState } from "react";

export default function AlertsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [triggering, setTriggering] = useState(false);
  const [msg, setMsg] = useState("");

  const { data = [], isLoading } = useQuery({
    queryKey: ["alerts"],
    queryFn: alerts.list,
  });

  const handleTrigger = async () => {
    setTriggering(true);
    try {
      await alerts.trigger();
      qc.invalidateQueries(["alerts"]);
      setMsg("Alert check complete. Check logs for details.");
    } catch (err) {
      setMsg(err.response?.data?.error || "Alert check failed.");
    }
    setTriggering(false);
    setTimeout(() => setMsg(""), 5000);
  };

  const alertColor = (type) => {
    if (type.includes("1_month") || type.includes("1mo"))
      return "border-l-red-500";
    if (type.includes("3_month") || type.includes("3mo"))
      return "border-l-yellow-400";
    return "border-l-blue-400";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Alert Log</h1>
        {user?.role === "admin" && (
          <button
            className="btn-primary"
            onClick={handleTrigger}
            disabled={triggering}
          >
            {triggering ? "Running..." : "▶ Run Alert Check Now"}
          </button>
        )}
      </div>

      {msg && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-blue-700 text-sm">
          {msg}
        </div>
      )}

      <div className="card p-0">
        <div className="px-5 py-3 border-b border-gray-200">
          <p className="text-sm text-gray-500">
            Alerts are automatically sent at 6 months, 3 months, and 1 month
            before expiration dates.
          </p>
        </div>
        {isLoading ? (
          <div className="text-center py-10 text-gray-400">Loading...</div>
        ) : data.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            No alerts logged yet.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {data.map((alert) => (
              <div
                key={alert.id}
                className={`px-5 py-3 flex items-center justify-between border-l-4 ${alertColor(alert.alert_type)}`}
              >
                <div>
                  <div className="text-sm font-medium text-gray-800">
                    <Link
                      to={`/doctors/${alert.doctor_id}`}
                      className="text-blue-700 hover:underline"
                    >
                      Dr. {alert.first_name} {alert.last_name}
                    </Link>
                    <span className="ml-2 text-gray-500">
                      — {alert.alert_type.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    Sent to: {alert.recipient_email} ·{" "}
                    {new Date(alert.sent_at).toLocaleString()}
                  </div>
                </div>
                <span className={alert.success ? "badge-green" : "badge-red"}>
                  {alert.success ? "Sent" : "Failed"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
