import { useState, useEffect } from 'react';
import { api } from '../../api/client'; // Your API call
import { assetUrl, toRelativeFromPublic } from "../../api/asset";
import { t } from "../../lib/toast";
import FancyButton from "../../components/button/button";

export default function SiteSettings() {
  const token = localStorage.getItem("admin_jwt") || "";
  const auth = { headers: { Authorization: `Bearer ${token}` } };

  const [form, setForm] = useState({ title: "", logoUrl: "", faviconUrl: "" });
  const [saving, setSaving] = useState(false);
  const [upLogo, setUpLogo] = useState(false);
  const [upFavi, setUpFavi] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await api.get("/settings", auth);
      if (data.ok && data.site) {
        // store relative if server sent absolute
        setForm({
          title: data.site.title || "",
          logoUrl: toRelativeFromPublic(data.site.logoUrl || ""),
          faviconUrl: toRelativeFromPublic(data.site.faviconUrl || ""),
        });
      }
    })();
  }, []); // eslint-disable-line

  // Upload image logic
  async function uploadImage(file) {
    const fd = new FormData();
    fd.append("files", file); // Using "files" field as required by backend
    try {
      const res = await api.post("/uploads/image", fd, {
        ...auth,
        headers: { ...auth.headers, "Content-Type": "multipart/form-data" }
      });
      return { path: res.data.images[0].path, previewUrl: res.data.images[0].previewUrl };  // Ensure correct data structure from response
    } catch (error) {
      t.err("Error uploading image.");
      
      return {};
    }
  }

  // Handle logo upload
  async function onPickLogo(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUpLogo(true);
    try {
      const { path, previewUrl } = await uploadImage(file);
      setForm(f => ({ ...f, logoUrl: path }));
      // Preview the image after upload
      document.getElementById("logo-preview").src = previewUrl;
    } finally { setUpLogo(false); }
  }

  // Handle favicon upload
  async function onPickFavicon(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUpFavi(true);
    try {
      const { path, previewUrl } = await uploadImage(file);
      setForm(f => ({ ...f, faviconUrl: path }));
      // Preview the favicon after upload
      document.getElementById("favicon-preview").src = previewUrl;
    } finally { setUpFavi(false); }
  }

  // Save site settings
  async function save(e) {
    e.preventDefault();
    setSaving(true);

    // Ensure relative paths before sending to the backend
    const payload = {
      title: form.title || "",
      logoUrl: toRelativeFromPublic(form.logoUrl || ""),
      faviconUrl: toRelativeFromPublic(form.faviconUrl || ""),
    };

    // Save settings
    await api.put("/settings/site", payload, auth);
    t.ok("Saved");
    setSaving(false);

    // Update favicon + title in browser immediately (using absolute path for href)
    if (form.faviconUrl) {
      const absFavi = assetUrl(form.faviconUrl);
      let link = document.querySelector("link[rel='icon']");
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = absFavi;
    }
    if (form.title) document.title = form.title;
  }

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Site Settings</h1>

      <form onSubmit={save} className="grid lg:grid-cols-2 gap-6">
        {/* LEFT: form */}
        <div className="bg-surface border border-border-subtle rounded-xl shadow-sm p-5 space-y-5">
          <div>
            <label className="block text-sm mb-1">Site name</label>
            <input
              className="w-full bg-surface border border-border rounded-lg px-3 py-2"
              placeholder="Your brand name"
              value={form.title || ""}
              onChange={e => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm">Logo</label>
              <span className="text-xs text-fg-subtle">PNG/SVG recommended</span>
            </div>
            <div className="mt-2 flex items-center gap-3">
              <input type="file" accept="image/*" onChange={onPickLogo} />
              {upLogo && <span className="text-xs text-fg-subtle">Uploading…</span>}
            </div>
            <input
              className="w-full mt-2 bg-surface border border-border rounded-lg px-3 py-2"
              placeholder="or paste Logo URL"
              value={form.logoUrl || ""}
              onChange={e => setForm({ ...form, logoUrl: toRelativeFromPublic(e.target.value) })}
            />
            <div className="mt-2 text-xs text-fg-subtle">
              Stored as: <code>{form.logoUrl || "(none)"}</code>
            </div>
            {/* Display uploaded logo preview */}
            <img id="logo-preview" src={assetUrl(form.logoUrl)} alt="logo" className="mt-2 h-12" />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm">Favicon</label>
              <span className="text-xs text-fg-subtle">32×32 or 64×64 PNG/ICO</span>
            </div>
            <div className="mt-2 flex items-center gap-3">
              <input type="file" accept="image/*,.ico" onChange={onPickFavicon} />
              {upFavi && <span className="text-xs text-fg-subtle">Uploading…</span>}
            </div>
            <input
              className="w-full mt-2 bg-surface border border-border rounded-lg px-3 py-2"
              placeholder="or paste Favicon URL"
              value={form.faviconUrl || ""}
              onChange={e => setForm({ ...form, faviconUrl: toRelativeFromPublic(e.target.value) })}
            />
            <div className="mt-2 text-xs text-fg-subtle">
              Stored as: <code>{form.faviconUrl || "(none)"}</code>
            </div>
            {/* Display uploaded favicon preview */}
            <img id="favicon-preview" src={assetUrl(form.faviconUrl)} alt="favicon" className="mt-2 h-8 w-8" />
          </div>

          <button
            disabled={saving || upLogo || upFavi}>
            <FancyButton text={saving ? "Saving…" : "Save"} />
          </button>
        </div>

        {/* RIGHT: live preview */}
        <div className="bg-surface border border-border-subtle rounded-xl shadow-sm p-5">
          <div className="text-sm font-semibold text-fg mb-3">Preview</div>
          <div className="border border-border-subtle rounded-lg p-4">
            <div className="flex items-center gap-3">
              {form.logoUrl
                ? <img src={assetUrl(form.logoUrl)} alt="logo" className="h-12 w-auto object-contain" />
                : <div className="h-12 w-12 rounded-md bg-surface-subtle grid place-items-center text-fg-subtle">logo</div>}
              <div className="text-xl font-semibold">{form.title || "Your Site"}</div>
            </div>
            <div className="mt-4 text-fg-subtle text-sm">Favicon:</div>
            <div className="mt-1 h-8 w-8 border border-border-subtle rounded grid place-items-center overflow-hidden">
              {form.faviconUrl
                ? <img src={assetUrl(form.faviconUrl)} alt="favicon" className="max-w-full max-h-full" />
                : <span className="text-fg-subtle text-xs">none</span>}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
