// src/pages/Admin/Categories.jsx
import { useEffect, useState } from "react";
import { CategoriesAPI } from "../../api/categories";
import { useAuth } from "../../contexts/Auth";
import { t } from "../../lib/toast";

export default function AdminCategories() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ name: "", description: "" });

  async function load() {
    setLoading(true);
    try {
      const res = await CategoriesAPI.list();
      setList(res?.data?.items || []);
    } catch (err) {
      t.err(err?.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function submit(e) {
    e.preventDefault();
    if (!form.name.trim()) return t.info("Name is required");

    setSaving(true);
    try {
      await CategoriesAPI.create({
        name: form.name.trim(),
        description: form.description.trim(),
      });

      t.ok("Category added!");
      setForm({ name: "", description: "" });
      load();
    } catch (err) {
      t.err(err?.response?.data?.error || err?.message || "Unable to create category");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Categories</h1>

      {/* Add Category Form */}
      <form
        onSubmit={submit}
        className="bg-surface border border-border-subtle rounded-xl shadow p-5 space-y-4"
      >
        <div>
          <label className="text-sm font-medium">Name *</label>
          <input
            className="w-full bg-surface border border-border rounded-lg px-3 py-2 mt-1"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Kids, GK, CBSE Class 6"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Description</label>
          <textarea
            className="w-full bg-surface border border-border rounded-lg px-3 py-2 mt-1"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Optional description"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 rounded-lg bg-black text-white"
        >
          {saving ? "Saving…" : "Add Category"}
        </button>
      </form>

      {/* Category List */}
      <div className="mt-6 bg-surface border border-border-subtle rounded-xl shadow">
        <div className="p-4 border-b border-border-subtle font-semibold">
          Existing Categories
        </div>

        {loading ? (
          <div className="p-4 text-sm text-fg-subtle">Loading…</div>
        ) : list.length === 0 ? (
          <div className="p-4 text-sm text-fg-subtle">No categories yet.</div>
        ) : (
          <ul className="divide-y divide-border-subtle">
            {list.map((c) => (
              <li key={c._id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium">{c.name}</div>
                  {c.description ? (
                    <div className="text-sm text-fg-subtle">{c.description}</div>
                  ) : null}
                </div>
                <div className="text-sm text-fg-subtle">Books: {c.count}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
