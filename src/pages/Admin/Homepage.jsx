import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { toRelativeFromPublic, assetUrl } from "../../api/asset";  // Import the helper functions
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
      if (nb.image) nb.image = toRelativeFromPublic(nb.image); // Convert to relative path
      if (nb.type === "hero") nb.image = toRelativeFromPublic(nb.image);
      return nb;
    });
    await api.put("/settings/homepage", { blocks: cleaned }, { headers: { Authorization: `Bearer ${token}` } });
    t.ok("Homepage saved");
  };

  const move = (from, to) => {
    setBlocks(prev => {
      const arr = [...prev];
      if (from < 0 || from >= arr.length) return arr;
      if (to < 0) to = 0;
      if (to > arr.length - 1) to = arr.length - 1;
      if (from === to) return arr;
      const [it] = arr.splice(from, 1);
      arr.splice(to, 0, it);
      return arr;
    });
  };
  const moveUp = (i) => move(i, i - 1);
  const moveDown = (i) => move(i, i + 1);

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Homepage Builder</h1>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-3 mb-4 flex flex-wrap gap-2">
        {["hero", "banner", "grid", "html"].map(t => (
          <button key={t} onClick={() => addBlock(t)} className="px-3 py-2 rounded-lg border bg-white hover:bg-gray-50">+ {t}</button>
        ))}
        <div className="ml-auto" />
        <button onClick={save} className="px-4 py-2 rounded-lg bg-brand font-semibold">Save</button>
      </div>

      <div className="space-y-4">
        {blocks.map((b, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="font-semibold">{b.type.toUpperCase()}</div>

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
  if (type === "banner") return { type, image: "", ctaText: "", ctaLink: "/" };
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
          <ImageUpload label="Hero Image" value={block.image} onChange={v => onChange({ ...block, image: v })} />
          <Text label="CTA Text" value={block.ctaText} onChange={v => onChange({ ...block, ctaText: v })} />
          <Text label="CTA Link" value={block.ctaHref} onChange={v => onChange({ ...block, ctaHref: v })} />
        </div>
      );
    case "banner":
      return (
        <div className="grid md:grid-cols-2 gap-3 mt-3">
          <ImageUpload label="Banner Image" value={block.image} onChange={v => onChange({ ...block, image: v })} />
          <Text label="CTA Text" value={block.ctaText} onChange={v => onChange({ ...block, ctaText: v })} />
          <Text label="CTA Link" value={block.ctaLink} onChange={v => onChange({ ...block, ctaLink: v })} />
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

function ImageUpload({ label, value, onChange }) {
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("files", file);

      // Upload the image to the backend with the Authorization header
      try {
        const response = await api.post("/uploads/image", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            "Authorization": `Bearer ${localStorage.getItem("admin_jwt")}`,  // Ensure the token is included
          },
        });

        if (response.data.ok) {
          // Update the image path and show preview
          const { path, previewUrl } = response.data.images[0];
          onChange(path); // Set the image path in state
          document.getElementById(`${label.toLowerCase()}-preview`).src = previewUrl; // Show the preview image
        } else {
          t.err("Failed to upload image");
        }
      } catch (error) {
        t.err("Error uploading image");
      
      }
    }
  };

  return (
    <div>
      <label className="block text-sm mb-1">{label}</label>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
      />
      <input
        type="text"
        className="w-full mt-2 bg-white border border-gray-300 rounded-lg px-3 py-2"
        placeholder="Enter image path"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)} // Update path manually if needed
      />
      {value && <img id={`${label.toLowerCase()}-preview`} src={assetUrl(value)} alt="Uploaded" className="mt-2 h-12" />}
    </div>
  );
}