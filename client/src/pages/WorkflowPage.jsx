import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { workflow, doctors } from "../api/index.js";
import clsx from "clsx";
import { useState } from "react";

const stepStatusColor = {
  complete: "bg-green-500",
  in_progress: "bg-blue-500",
  blocked: "bg-red-400",
  pending: "bg-gray-200",
};
const stepStatusText = {
  complete: "text-green-700",
  in_progress: "text-blue-700",
  blocked: "text-red-700",
  pending: "text-gray-400",
};

export default function WorkflowPage() {
  const { id } = useParams();
  const qc = useQueryClient();
  const [notes, setNotes] = useState({});
  const [advancing, setAdvancing] = useState(false);
  const [updatingStep, setUpdatingStep] = useState(null);
  const [msg, setMsg] = useState("");

  const { data: doctor } = useQuery({
    queryKey: ["doctor", id],
    queryFn: () => doctors.get(id),
  });
  const { data, isLoading } = useQuery({
    queryKey: ["workflow", id],
    queryFn: () => workflow.get(id),
  });
  const { data: missing = [] } = useQuery({
    queryKey: ["missingForms", id],
    queryFn: () => workflow.missingForms(id),
  });

  const handleStepUpdate = async (step, status) => {
    setUpdatingStep(step.step_id);
    try {
      await workflow.updateStep(id, step.step_id, {
        status,
        notes: notes[step.step_id],
      });
      setNotes((n) => {
        const copy = { ...n };
        delete copy[step.step_id];
        return copy;
      });
      qc.invalidateQueries({ queryKey: ["workflow", id] });
    } catch (err) {
      setMsg(err.response?.data?.error || "Failed to update step");
      setTimeout(() => setMsg(""), 4000);
    } finally {
      setUpdatingStep(null);
    }
  };

  const handleAdvance = async () => {
    setAdvancing(true);
    try {
      const result = await workflow.advance(id);
      setMsg(result.message);
      qc.invalidateQueries({ queryKey: ["workflow", id] });
      qc.invalidateQueries({ queryKey: ["doctor", id] });
    } catch (err) {
      setMsg(err.response?.data?.error || "Failed");
    } finally {
      setAdvancing(false);
      setTimeout(() => setMsg(""), 4000);
    }
  };

  if (isLoading)
    return <div className="text-center py-20 text-gray-400">Loading...</div>;

  const { instance, steps = [] } = data || {};

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
        <span>Workflow</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Credentialing Workflow</h1>
        {instance && instance.status !== "complete" && (
          <button
            className="btn-primary"
            onClick={handleAdvance}
            disabled={advancing}
          >
            {advancing ? "Advancing..." : "Advance to Next Step →"}
          </button>
        )}
      </div>

      {msg && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-blue-700 text-sm">
          {msg}
        </div>
      )}

      {/* Missing Forms Warning */}
      {missing.length > 0 && (
        <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="font-semibold text-red-800 mb-2">
            ⚠️ Missing Required Documents
          </h3>
          <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
            {missing.map((f) => (
              <li key={f.doc_type}>{f.doc_type.replace(/_/g, " ")}</li>
            ))}
          </ul>
          <Link
            to={`/doctors/${id}/documents`}
            className="btn-danger btn-sm mt-3 inline-block"
          >
            Go to Documents →
          </Link>
        </div>
      )}

      {/* Progress Bar */}
      {instance && (
        <div className="card mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {instance.current_step} of {steps.length}
            </span>
            <span
              className={clsx(
                "badge",
                instance.status === "complete"
                  ? "badge-green"
                  : instance.status === "on_hold"
                    ? "badge-yellow"
                    : "badge-blue",
              )}
            >
              {instance.status === "complete"
                ? "✓ Complete"
                : instance.status === "on_hold"
                  ? "On Hold"
                  : "Active"}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all"
              style={{
                width: `${Math.round((instance.current_step / steps.length) * 100)}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step, idx) => {
          const isCurrentStep =
            instance && step.step_number === instance.current_step;
          const isCompleted = step.status === "complete";
          const isPast = instance && step.step_number < instance.current_step;

          return (
            <div
              key={step.id}
              className={clsx(
                "card border-l-4",
                isCurrentStep
                  ? "border-l-blue-500"
                  : isCompleted || isPast
                    ? "border-l-green-400"
                    : "border-l-gray-200",
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div
                    className={clsx(
                      "w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0",
                      isCompleted || isPast
                        ? "bg-green-500"
                        : isCurrentStep
                          ? "bg-blue-600"
                          : "bg-gray-300",
                    )}
                  >
                    {isCompleted || isPast ? "✓" : step.step_number}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {step.step_name}
                    </h3>
                    {step.description && (
                      <p className="text-sm text-gray-500 mt-0.5">
                        {step.description}
                      </p>
                    )}
                    {step.notes && (
                      <p className="text-xs text-blue-600 mt-1 italic">
                        Note: {step.notes}
                      </p>
                    )}
                    {step.completed_by_name && (
                      <p className="text-xs text-gray-400 mt-1">
                        Completed by {step.completed_by_name}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-4">
                  <span
                    className={clsx(
                      "badge",
                      step.status === "complete"
                        ? "badge-green"
                        : step.status === "in_progress"
                          ? "badge-blue"
                          : step.status === "blocked"
                            ? "badge-red"
                            : "badge-gray",
                    )}
                  >
                    {step.status}
                  </span>
                  {isCurrentStep && (
                    <select
                      className="input w-36 py-1 text-xs"
                      value={step.status}
                      disabled={updatingStep === step.step_id}
                      onChange={(e) => handleStepUpdate(step, e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="complete">Complete</option>
                      <option value="blocked">Blocked</option>
                    </select>
                  )}
                </div>
              </div>
              {isCurrentStep && (
                <div className="mt-3 ml-11">
                  <textarea
                    className="input text-sm"
                    rows={2}
                    placeholder="Add notes for this step..."
                    value={notes[step.step_id] || step.notes || ""}
                    onChange={(e) =>
                      setNotes((n) => ({
                        ...n,
                        [step.step_id]: e.target.value,
                      }))
                    }
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
