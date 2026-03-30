import { useState, useRef, useEffect } from "react";
import { api } from "../../api/client";
import { useAuth } from "../../contexts/Auth";
import { t } from "../../lib/toast";
import {
  Download,
  Upload,
  Database,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  RefreshCw,
} from "lucide-react";

export default function DataBackup() {
  const { token } = useAuth();
  const auth = { headers: { Authorization: `Bearer ${token || localStorage.getItem("admin_jwt")}` } };

  // Live collection list from backend
  const [models, setModels] = useState([]);        // [{ key, label }]
  const [modelsLoading, setModelsLoading] = useState(true);

  // Export state
  const [selectedModels, setSelectedModels] = useState(new Set());
  const [exporting, setExporting] = useState(false);

  // Import state
  const fileRef = useRef(null);
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  // Load collection list from backend on mount
  useEffect(() => {
    api.get("/data-backup/models", auth)
      .then(res => {
        if (res.data?.ok) {
          setModels(res.data.models);
          setSelectedModels(new Set(res.data.models.map(m => m.key)));
        }
      })
      .catch(() => t.error("Failed to load collections"))
      .finally(() => setModelsLoading(false));
  }, []); // eslint-disable-line

  // ── Export ────────────────────────────────────────────────────────────────
  function toggleModel(key) {
    setSelectedModels(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  function toggleAll() {
    setSelectedModels(prev =>
      prev.size === models.length ? new Set() : new Set(models.map(m => m.key))
    );
  }

  async function handleExport() {
    if (selectedModels.size === 0) {
      t.error("Select at least one collection to export");
      return;
    }
    setExporting(true);
    try {
      const params = selectedModels.size < models.length
        ? `?models=${[...selectedModels].join(",")}`
        : "";

      const res = await api.get(`/data-backup/export${params}`, {
        ...auth,
        responseType: "blob",
        timeout: 120000,
      });

      const blob = new Blob([res.data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `kiddos-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      t.success("Backup downloaded successfully");
    } catch (err) {
      t.error(err?.response?.data?.error || "Export failed");
    } finally {
      setExporting(false);
    }
  }

  // ── Import ────────────────────────────────────────────────────────────────
  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".json")) {
      t.error("Please select a .json backup file");
      return;
    }
    setImportFile(file);
    setImportResult(null);
  }

  async function handleImport() {
    if (!importFile) {
      t.error("Select a backup file first");
      return;
    }
    const confirmed = window.confirm(
      "This will OVERWRITE existing documents by _id. Are you sure you want to restore this backup?"
    );
    if (!confirmed) return;

    setImporting(true);
    setImportResult(null);
    try {
      const form = new FormData();
      form.append("file", importFile);

      const { data } = await api.post("/data-backup/import", form, {
        ...auth,
        timeout: 180000,
      });

      setImportResult(data);
      if (data.ok) {
        t.success("Backup restored successfully");
      } else {
        t.error(data.error || "Import failed");
      }
    } catch (err) {
      t.error(err?.response?.data?.error || "Import failed");
    } finally {
      setImporting(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-[#384959] text-white grid place-items-center">
          <Database className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#384959]">Database Backup</h1>
          <p className="text-sm text-[#5C756D]">Export all data to JSON or restore from a backup file</p>
        </div>
      </div>

      {/* ── Export Card ───────────────────────────────────────────────────── */}
      <div className="bg-white border border-[#E3E8E5] rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-[#384959] text-lg flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Data
          </h2>
          {!modelsLoading && models.length > 0 && (
            <button onClick={toggleAll} className="text-xs font-semibold text-[#384959] hover:underline">
              {selectedModels.size === models.length ? "Deselect All" : "Select All"}
            </button>
          )}
        </div>

        <p className="text-sm text-[#5C756D]">
          Choose which collections to include in the backup JSON file.
          {!modelsLoading && (
            <span className="ml-1 text-[#8BA699]">
              ({models.length} collections found in database — auto-detected, always up to date)
            </span>
          )}
        </p>

        {/* Collection checkboxes */}
        {modelsLoading ? (
          <div className="flex items-center gap-2 text-sm text-[#5C756D] py-4">
            <Loader2 className="w-4 h-4 animate-spin" /> Detecting collections…
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {models.map(({ key, label }) => (
              <label
                key={key}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer text-sm font-medium transition-all
                  ${selectedModels.has(key)
                    ? "border-[#384959] bg-[#384959]/5 text-[#384959]"
                    : "border-[#E3E8E5] text-[#8BA699] hover:border-[#384959]/40"
                  }`}
              >
                <input
                  type="checkbox"
                  checked={selectedModels.has(key)}
                  onChange={() => toggleModel(key)}
                  className="accent-[#384959]"
                />
                {label}
              </label>
            ))}
          </div>
        )}

        <button
          onClick={handleExport}
          disabled={exporting || selectedModels.size === 0 || modelsLoading}
          className="flex items-center gap-2 px-6 py-3 bg-[#384959] text-white font-bold rounded-xl hover:bg-[#2d3a47] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {exporting ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Exporting…</>
          ) : (
            <><Download className="w-4 h-4" /> Download Backup</>
          )}
        </button>
      </div>

      {/* ── Import Card ───────────────────────────────────────────────────── */}
      <div className="bg-white border border-[#E3E8E5] rounded-2xl p-6 shadow-sm space-y-5">
        <h2 className="font-bold text-[#384959] text-lg flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Import / Restore
        </h2>

        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex gap-3 text-sm text-amber-800">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>
            Import will <strong>upsert</strong> documents by their <code>_id</code>. Existing records
            with matching IDs will be overwritten. Works with any backup version — new collections
            in the backup file are automatically created.
          </span>
        </div>

        {/* File picker */}
        <div
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
            ${importFile ? "border-[#384959] bg-[#384959]/5" : "border-[#E3E8E5] hover:border-[#384959]/40"}`}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={handleFileChange}
          />
          {importFile ? (
            <div className="space-y-1">
              <CheckCircle2 className="w-8 h-8 text-[#384959] mx-auto" />
              <p className="font-bold text-[#384959]">{importFile.name}</p>
              <p className="text-xs text-[#5C756D]">
                {(importFile.size / 1024 / 1024).toFixed(2)} MB — click to change
              </p>
            </div>
          ) : (
            <div className="space-y-1 text-[#8BA699]">
              <Upload className="w-8 h-8 mx-auto" />
              <p className="font-medium">Click to select a .json backup file</p>
              <p className="text-xs">Max 100 MB</p>
            </div>
          )}
        </div>

        <button
          onClick={handleImport}
          disabled={importing || !importFile}
          className="flex items-center gap-2 px-6 py-3 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {importing ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Restoring…</>
          ) : (
            <><RefreshCw className="w-4 h-4" /> Restore Backup</>
          )}
        </button>

        {/* Import results */}
        {importResult && importResult.ok && (
          <div className="border border-[#E3E8E5] rounded-xl overflow-hidden">
            <div className="px-4 py-3 bg-[#F4F7F5] border-b border-[#E3E8E5] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="font-bold text-[#384959] text-sm">
                Import Results
                {importResult.exportedAt && (
                  <span className="font-normal text-[#5C756D] ml-2">
                    (backup from {new Date(importResult.exportedAt).toLocaleString()})
                  </span>
                )}
              </span>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-[#FAFBF9]">
                <tr>
                  <th className="text-left px-4 py-2 text-[#5C756D] font-semibold">Collection</th>
                  <th className="text-right px-4 py-2 text-[#5C756D] font-semibold">Upserted</th>
                  <th className="text-right px-4 py-2 text-[#5C756D] font-semibold">Failed</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(importResult.results || {}).map(([key, res]) => (
                  <tr key={key} className="border-t border-[#F4F7F5]">
                    <td className="px-4 py-2 text-[#384959] font-medium capitalize">
                      {key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " ")}
                    </td>
                    <td className="px-4 py-2 text-right text-green-700 font-mono">
                      {res.skipped ? <span className="text-[#8BA699]">—</span> : res.upserted}
                    </td>
                    <td className="px-4 py-2 text-right font-mono">
                      {res.failed > 0
                        ? <span className="text-red-600">{res.failed}</span>
                        : <span className="text-[#8BA699]">0</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
