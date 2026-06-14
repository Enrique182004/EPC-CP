import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function SubResourceTab({
  queryKey,
  fetchFn,
  createFn,
  updateFn,
  deleteFn,
  fields,
  title,
  renderRow,
}) {
  const qc = useQueryClient();
  const [editId, setEditId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const { data = [], isLoading } = useQuery({ queryKey, queryFn: fetchFn });

  const resetForm = () => {
    setFormData({});
    setError("");
    setShowAdd(false);
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (editId) {
        await updateFn(editId, formData);
      } else {
        await createFn(formData);
      }
      qc.invalidateQueries(queryKey);
      resetForm();
    } catch (err) {
      setError(err.response?.data?.error || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (row) => {
    setEditId(row.id);
    setFormData(row);
    setShowAdd(false);
  };

  const handleDelete = async (rowId) => {
    if (!window.confirm("Delete this record?")) return;
    try {
      await deleteFn(rowId);
      qc.invalidateQueries(queryKey);
    } catch {}
  };

  const handleStartAdd = () => {
    setFormData({});
    setEditId(null);
    setShowAdd(true);
  };

  if (isLoading)
    return <div className="text-gray-400 text-sm py-4">Loading...</div>;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">{title}</h3>
        {!showAdd && !editId && (
          <button className="btn-primary btn-sm" onClick={handleStartAdd}>
            + Add
          </button>
        )}
      </div>

      {/* Form */}
      {(showAdd || editId) && (
        <form
          onSubmit={handleSubmit}
          className="border border-blue-100 bg-blue-50 rounded-lg p-4 mb-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {fields.map((f) => (
              <div
                key={f.name}
                className={f.span === "full" ? "col-span-full" : ""}
              >
                <label className="label">
                  {f.label}
                  {f.required ? " *" : ""}
                </label>
                {f.type === "select" ? (
                  <select
                    className="input"
                    value={formData[f.name] || ""}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, [f.name]: e.target.value }))
                    }
                  >
                    <option value="">Select...</option>
                    {f.options.map((o) => (
                      <option key={o.value || o} value={o.value || o}>
                        {o.label || o}
                      </option>
                    ))}
                  </select>
                ) : f.type === "textarea" ? (
                  <textarea
                    className="input"
                    rows={3}
                    value={formData[f.name] || ""}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, [f.name]: e.target.value }))
                    }
                  />
                ) : f.type === "checkbox" ? (
                  <div className="flex items-center mt-2">
                    <input
                      type="checkbox"
                      id={f.name}
                      checked={!!formData[f.name]}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          [f.name]: e.target.checked ? 1 : 0,
                        }))
                      }
                      className="mr-2"
                    />
                    <label htmlFor={f.name} className="text-sm text-gray-700">
                      {f.checkLabel || f.label}
                    </label>
                  </div>
                ) : (
                  <input
                    type={f.type || "text"}
                    className="input"
                    value={formData[f.name] || ""}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, [f.name]: e.target.value }))
                    }
                    required={f.required}
                  />
                )}
              </div>
            ))}
          </div>
          {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
          <div className="flex gap-2 mt-4">
            <button
              type="submit"
              className="btn-primary btn-sm"
              disabled={saving}
            >
              {saving ? "Saving..." : editId ? "Update" : "Add"}
            </button>
            <button
              type="button"
              className="btn-secondary btn-sm"
              onClick={resetForm}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Records */}
      {data.length === 0 && !showAdd ? (
        <p className="text-sm text-gray-400">
          No records yet. Click "+ Add" to add one.
        </p>
      ) : (
        <div className="space-y-2">
          {data.map((row) => (
            <div
              key={row.id}
              className="border border-gray-100 rounded-md p-3 flex items-start justify-between hover:bg-gray-50"
            >
              <div className="text-sm text-gray-700 flex-1">
                {renderRow(row)}
              </div>
              <div className="flex gap-1 ml-4 shrink-0">
                <button
                  className="btn-secondary btn-sm"
                  onClick={() => handleEdit(row)}
                >
                  Edit
                </button>
                <button
                  className="btn-danger btn-sm"
                  onClick={() => handleDelete(row.id)}
                >
                  Del
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
