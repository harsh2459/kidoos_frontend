// src/pages/Admin/Categories.jsx
import { useEffect, useState } from "react";
import { CategoriesAPI } from "../../api/categories";
import { useAuth } from "../../contexts/Auth";
import { t } from "../../lib/toast";

import { 
  Layers, 
  FolderPlus, 
  BookOpen, 
  Loader2, 
  Search,
  Trash2,
  Edit2
} from "lucide-react";

export default function AdminCategories() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ name: "", description: "" });
  const [q, setQ] = useState(""); // Search state for filtering list locally

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

      t.ok("Category added successfully!");
      setForm({ name: "", description: "" });
      load();
    } catch (err) {
      t.err(err?.response?.data?.error || err?.message || "Unable to create category");
    } finally {
      setSaving(false);
    }
  }

  // Simple local search filtering
  const filteredList = list.filter(c => 
    c.name.toLowerCase().includes(q.toLowerCase()) || 
    (c.description && c.description.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 2xl:px-12 max-w-7xl 2xl:max-w-[1800px] py-8">
  
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
            <h1 className="text-3xl font-bold text-[#1A3C34] tracking-tight">Categories</h1>
            <p className="text-[#5C756D] mt-1 text-sm">Organize your books into searchable collections.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: CREATE FORM */}
        <div className="lg:col-span-1">
            <div className="bg-white border border-[#E3E8E5] rounded-2xl shadow-sm sticky top-24 overflow-hidden">
                <div className="bg-[#FAFBF9] border-b border-[#E3E8E5] px-6 py-4 flex items-center gap-2">
                    <FolderPlus className="w-5 h-5 text-[#1A3C34]" />
                    <h2 className="font-bold text-[#1A3C34]">Add New Category</h2>
                </div>
                
                <form onSubmit={submit} className="p-6 space-y-5">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#5C756D] mb-2">
                            Category Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            className="w-full bg-[#FAFBF9] border border-[#E3E8E5] rounded-xl px-4 py-3 text-[#1A3C34] focus:outline-none focus:ring-2 focus:ring-[#1A3C34]/20 focus:border-[#1A3C34] transition-all"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder="e.g. Mythology, Kids, Sci-Fi"
                            disabled={saving}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#5C756D] mb-2">
                            Description
                        </label>
                        <textarea
                            className="w-full bg-[#FAFBF9] border border-[#E3E8E5] rounded-xl px-4 py-3 text-[#1A3C34] focus:outline-none focus:ring-2 focus:ring-[#1A3C34]/20 focus:border-[#1A3C34] transition-all resize-none"
                            rows={4}
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            placeholder="Optional short description..."
                            disabled={saving}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="
                            w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl 
                            bg-[#1A3C34] text-white font-bold text-sm shadow-md 
                            hover:bg-[#2F523F] active:scale-95 transition-all
                            disabled:opacity-70 disabled:cursor-not-allowed
                        "
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                            </>
                        ) : (
                            <>
                                <FolderPlus className="w-4 h-4" /> Create Category
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>

        {/* RIGHT COLUMN: LIST */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* SEARCH BAR FOR LIST */}
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8BA699] w-5 h-5 group-focus-within:text-[#1A3C34] transition-colors" />
                <input
                    className="w-full bg-white border border-[#E3E8E5] rounded-xl pl-12 pr-4 py-3 text-[#1A3C34] placeholder:text-[#8BA699] focus:outline-none focus:ring-2 focus:ring-[#1A3C34]/20 focus:border-[#1A3C34] transition-all shadow-sm"
                    placeholder="Search categories..."
                    value={q}
                    onChange={e => setQ(e.target.value)}
                />
            </div>

            <div className="bg-white border border-[#E3E8E5] rounded-2xl shadow-sm overflow-hidden">
                <div className="bg-[#FAFBF9] border-b border-[#E3E8E5] px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-[#1A3C34]">
                        <Layers className="w-5 h-5" />
                        Existing Categories
                    </div>
                    <span className="text-xs font-bold bg-[#E3E8E5] text-[#5C756D] px-2 py-1 rounded-md">
                        {filteredList.length} Total
                    </span>
                </div>

                {loading ? (
                    <div className="p-12 flex flex-col items-center justify-center text-[#5C756D]">
                        <Loader2 className="w-8 h-8 animate-spin mb-3 text-[#1A3C34]" />
                        <p>Loading categories...</p>
                    </div>
                ) : filteredList.length === 0 ? (
                    <div className="p-12 text-center text-[#5C756D]">
                        <div className="w-12 h-12 bg-[#F4F7F5] rounded-full flex items-center justify-center mx-auto mb-3">
                            <Layers className="w-6 h-6 opacity-30" />
                        </div>
                        <p>No categories found.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-[#F4F7F5]">
                        {filteredList.map((c) => (
                            <div key={c._id} className="p-5 flex items-center justify-between hover:bg-[#FAFBF9] transition-colors group">
                                <div className="flex items-start gap-4">
                                    <div className="mt-1 w-10 h-10 rounded-lg bg-[#E8F5E9] text-[#1A3C34] flex items-center justify-center shrink-0 border border-[#C8E6C9]">
                                        <BookOpen className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-[#1A3C34] text-lg">{c.name}</h3>
                                        {c.description && (
                                            <p className="text-sm text-[#5C756D] mt-0.5 max-w-md">{c.description}</p>
                                        )}
                                        <div className="flex items-center gap-4 mt-2 md:hidden">
                                             <span className="text-xs font-medium text-[#5C756D] bg-[#F4F7F5] px-2 py-0.5 rounded">
                                                {c.count || 0} Books
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-4">
                                    <span className="hidden md:flex items-center gap-1.5 text-sm font-bold text-[#1A3C34] bg-[#F4F7F5] px-3 py-1.5 rounded-lg border border-[#E3E8E5]">
                                        <BookOpen className="w-4 h-4 text-[#5C756D]" />
                                        {c.count || 0}
                                    </span>
                                    
                                    {/* Actions (Future proofing for Edit/Delete) */}
                                    {/* <button className="p-2 text-[#5C756D] hover:text-[#1A3C34] hover:bg-white rounded-lg transition-colors">
                                        <Edit2 className="w-4 h-4" />
                                    </button> */}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}