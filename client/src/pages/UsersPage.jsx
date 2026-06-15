import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { auth as authApi } from "../api/index.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function UsersPage() {
  const { user } = useAuth();
  const qc = useQueryClient();

  if (user?.role !== "admin") {
    return (
      <div className="text-center py-20 text-gray-500">
        Access denied. Admins only.
      </div>
    );
  }
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    role: "worker",
    phone: "",
  });
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: authApi.users,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    try {
      await authApi.register(form);
      qc.invalidateQueries(["users"]);
      setForm({ email: "", password: "", name: "", role: "worker", phone: "" });
      setMsg("User created successfully.");
      setTimeout(() => setMsg(""), 4000);
    } catch (err) {
      setMsg(err.response?.data?.error || "Failed to create user.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">User Management</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-semibold mb-4">Add New User</h2>
          {msg && (
            <div
              className={`mb-3 p-3 rounded text-sm ${msg.includes("fail") || msg.includes("Failed") ? "bg-red-50 text-red-700 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"}`}
            >
              {msg}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="label">Full Name</label>
              <input
                className="input"
                required
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                required
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="label">Password (min 8 chars)</label>
              <input
                type="password"
                className="input"
                required
                minLength={8}
                value={form.password}
                onChange={(e) =>
                  setForm((f) => ({ ...f, password: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="label">Phone</label>
              <input
                className="input"
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="label">Role</label>
              <select
                className="input"
                value={form.role}
                onChange={(e) =>
                  setForm((f) => ({ ...f, role: e.target.value }))
                }
              >
                <option value="worker">Worker</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button
              type="submit"
              className="btn-primary w-full"
              disabled={saving}
            >
              {saving ? "Creating..." : "Create User"}
            </button>
          </form>
        </div>

        <div className="card">
          <h2 className="font-semibold mb-4">All Users</h2>
          {isLoading ? (
            <p className="text-gray-400 text-sm">Loading...</p>
          ) : (
            <div className="space-y-2">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between border border-gray-100 rounded p-3"
                >
                  <div>
                    <div className="text-sm font-medium text-gray-800">
                      {u.name}
                    </div>
                    <div className="text-xs text-gray-500">{u.email}</div>
                  </div>
                  <span
                    className={u.role === "admin" ? "badge-red" : "badge-blue"}
                  >
                    {u.role}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
