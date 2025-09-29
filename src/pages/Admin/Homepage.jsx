// src/pages/admin/Homepage.jsx
import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { toRelativeFromPublic } from "../../api/asset";
import { t } from "../../lib/toast";

export default function HomepageAdmin() {
  const [token] = useState(localStorage.getItem("admin_jwt") || "");
  const [blocks, setBlocks] = useState([]);

  useEffect(() => {
    (async () => {
      const { data } = await api.get("/settings", { headers: { Authorization: `Bearer ${token}` } });
      if (data.ok) setBlocks(data.homepage?.blocks || []);
    })();
  }, [token]);

  const addBlock = (type) => setBlocks(b => [...b, defaultBlock(type)]);
  const save = async () => {
    const cleaned = blocks.map((b) => {
      const nb = { ...b };
      if (nb.image) nb.image = toRelativeFromPublic(nb.image);
      if (nb.type === "hero") {
        nb.image = toRelativeFromPublic(nb.image);
      }
      return nb;
    });
    await api.put("/settings/homepage", { blocks: cleaned }, { headers: { Authorization: `Bearer ${token}` } });
    t.ok("Homepage saved");
  };

  // ---- NEW: reordering helpers (minimal) ----
  const move = (from, to) => {
    setBlocks(prev => {
      const arr = [...prev];
      if (from < 0 || from >= arr.length) return arr;
      if (to   < 0) to = 0;
      if (to   > arr.length - 1) to = arr.length - 1;
      if (from === to) return arr;
      const [it] = arr.splice(from, 1);
      arr.splice(to, 0, it);
      return arr;
    });
  };
  const moveUp   = (i) => move(i, i - 1);
  const moveDown = (i) => move(i, i + 1);

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Homepage Builder</h1>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-3 mb-4 flex flex-wrap gap-2">
        {["hero", "banner", "grid", "html"].map(t => (
          <button key={t} onClick={() => addBlock(t)} className="px-3 py-2 rounded-lg border bg-white hover:bg-gray-50">+ {t}</button>
        ))}
        <div className="ml-auto" />
        <button onClick={save} className="px-4 py-2 rounded-lg bg-brand  font-semibold">Save</button>
      </div>

      <div className="space-y-4">
        {blocks.map((b, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="font-semibold">{b.type.toUpperCase()}</div>

              {/* ---- NEW: simple position controls ---- */}
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-500">Position</label>
                <select
                  value={i}
                  onChange={(e) => move(i, Number(e.target.value))}
                  className="border rounded px-2 py-1 text-sm"
                >
                  {blocks.map((_, idx) => (
                    <option key={idx} value={idx}>{idx + 1}</option>
                  ))}
                </select>

                <button
                  onClick={() => moveUp(i)}
                  className="px-2 py-1 rounded border bg-white hover:bg-gray-50 text-sm"
                  disabled={i === 0}
                  title="Move up"
                >
                  ↑
                </button>
                <button
                  onClick={() => moveDown(i)}
                  className="px-2 py-1 rounded border bg-white hover:bg-gray-50 text-sm"
                  disabled={i === blocks.length - 1}
                  title="Move down"
                >
                  ↓
                </button>

                <button
                  onClick={() => setBlocks(blocks.filter((_, x) => x !== i))}
                  className="text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            </div>

            <BlockEditor block={b} onChange={(nb) => setBlocks(blocks.map((x, idx) => idx === i ? nb : x))} />
          </div>
        ))}
        {blocks.length === 0 && (
          <div className="text-gray-500 text-sm">No sections yet. Add a block above.</div>
        )}
      </div>
    </div>
  );
}

function defaultBlock(type) {
  if (type === "hero") return { type, title: "Welcome", subtitle: "", image: "", ctaText: "Shop Now", ctaHref: "/catalog" };
  if (type === "banner") return { type, image: "", href: "#", alt: "" };
  if (type === "grid") return { type, title: "Featured", query: { q: "", category: "", sort: "new", limit: 8 } };
  if (type === "html") return { type, html: "<h2>Custom Section</h2><p>Edit me</p>" };
  return { type };
}

function BlockEditor({ block, onChange }) {
  switch (block.type) {
    case "hero":
      return (
        <div className="grid md:grid-cols-2 gap-3 mt-3">
          <Text label="Title" value={block.title} onChange={v => onChange({ ...block, title: v })} />
          <Text label="Subtitle" value={block.subtitle} onChange={v => onChange({ ...block, subtitle: v })} />
          <Text label="Image URL" value={block.image} onChange={v => onChange({ ...block, image: toRelativeFromPublic(v) })} />
          <Text label="CTA Text" value={block.ctaText} onChange={v => onChange({ ...block, ctaText: v })} />
          <Text label="CTA Link" value={block.ctaHref} onChange={v => onChange({ ...block, ctaHref: v })} />
        </div>
      );
    case "grid":
      return (
        <div className="grid md:grid-cols-4 gap-3 mt-3">
          <Text label="Title" value={block.title} onChange={v => onChange({ ...block, title: v })} />
          <Text label="Query q" value={block.query.q || ""} onChange={v => onChange({ ...block, query: { ...block.query, q: v } })} />
          <Text label="Category" value={block.query.category || ""} onChange={v => onChange({ ...block, query: { ...block.query, category: v } })} />
          <Text label="Limit" value={block.query.limit || 8} onChange={v => onChange({ ...block, query: { ...block.query, limit: Number(v) || 8 } })} />

          <div className="md:col-span-2">
            <label className="block text-sm mb-1">Layout</label>
            <select
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
              value={block.query.layout || "classic"}
              onChange={e => onChange({ ...block, query: { ...block.query, layout: e.target.value } })}
            >
              <option value="classic">Classic (current)</option>
              <option value="white">Showcase (white card)</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm mb-1">Columns</label>
            <select
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
              value={block.query.cols || 4}
              onChange={e => onChange({ ...block, query: { ...block.query, cols: Number(e.target.value) || 4 } })}
            >
              {[2, 3, 4, 5, 6].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      );
    case "grid":
      return (
        <div className="grid md:grid-cols-4 gap-3 mt-3">
          <Text label="Title" value={block.title} onChange={v => onChange({ ...block, title: v })} />
          <Text label="Query q" value={block.query.q} onChange={v => onChange({ ...block, query: { ...block.query, q: v } })} />
          <Text label="Category" value={block.query.category} onChange={v => onChange({ ...block, query: { ...block.query, category: v } })} />
          <Text label="Limit" value={block.query.limit} onChange={v => onChange({ ...block, query: { ...block.query, limit: Number(v) || 8 } })} />
        </div>
      );
    case "html":
      return (
        <div className="mt-3">
          <label className="block text-sm mb-1">HTML</label>
          <textarea value={block.html} onChange={e => onChange({ ...block, html: e.target.value })}
            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 h-40" />
        </div>
      );
    default: return null;
  }
}

function Text({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-sm mb-1">{label}</label>
      <input className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
        value={value || ""} onChange={e => onChange(e.target.value)} />
    </div>
  );
}
