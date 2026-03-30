// src/pages/Admin/TickerSettings.jsx
import { useState, useEffect } from "react";
import { api } from "../../api/client";
import { t } from "../../lib/toast";
import {
  Plus, Trash2, Save, Loader2, GripVertical,
  ToggleLeft, ToggleRight, Timer, Type, Zap,
  Eye, EyeOff, ChevronUp, ChevronDown
} from "lucide-react";

const DEFAULT_TICKER = {
  enabled: true,
  speed: 30,
  items: [
    { id: "1", text: "⚡ Flash Deal", highlighted: true,  showTimer: false },
    { id: "2", text: "Ultimate Discount on All Books Here", highlighted: false, showTimer: false },
    { id: "3", text: "Purchase Now & Save Big", highlighted: true,  showTimer: false },
    { id: "4", text: "Offer Ends In", highlighted: false, showTimer: true  },
    { id: "5", text: "Kiddos Intellect Special Offer", highlighted: true,  showTimer: false },
    { id: "6", text: "Shop Smart, Grow Bright", highlighted: false, showTimer: false },
  ],
};

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export default function TickerSettings() {
  const token = localStorage.getItem("admin_jwt") || "";
  const auth = { headers: { Authorization: `Bearer ${token}` } };

  const [enabled, setEnabled] = useState(true);
  const [speed, setSpeed] = useState(30);
  const [items, setItems] = useState(DEFAULT_TICKER.items);
  const [saving, setSaving] = useState(false);

  // Load existing settings
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/settings", auth);
        if (data.ok && data.ticker) {
          setEnabled(data.ticker.enabled ?? true);
          setSpeed(data.ticker.speed ?? 30);
          setItems(data.ticker.items ?? DEFAULT_TICKER.items);
        }
      } catch {
        // fall back to defaults
      }
    })();
  }, []);

  // ── item helpers ──────────────────────────────────────────────────────────
  const addItem = () =>
    setItems(prev => [...prev, { id: uid(), text: "", highlighted: false, showTimer: false }]);

  const removeItem = (id) => setItems(prev => prev.filter(i => i.id !== id));

  const updateItem = (id, patch) =>
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...patch } : i));

  const moveItem = (idx, dir) => {
    setItems(prev => {
      const next = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };

  // ── save ──────────────────────────────────────────────────────────────────
  const save = async () => {
    setSaving(true);
    try {
      await api.put("/settings/ticker", { enabled, speed, items }, auth);
      t.success("Ticker saved!");
    } catch {
      t.error("Failed to save ticker");
    } finally {
      setSaving(false);
    }
  };

  // ── preview ───────────────────────────────────────────────────────────────
  const activeItems = items.filter(i => i.text.trim());

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#384959]">Ticker Bar Settings</h1>
          <p className="text-sm text-[#5C756D] mt-1">
            Manage the scrolling announcement banner at the top of the site
          </p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#384959] text-white rounded-xl font-bold text-sm hover:bg-[#2c3a47] disabled:opacity-50 transition-all shadow"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>

      {/* Live Preview */}
      {enabled && activeItems.length > 0 && (
        <div className="rounded-xl overflow-hidden shadow border border-[#E3E8E5]">
          <div className="px-3 py-1.5 bg-[#F4F7F5] text-[10px] font-bold uppercase tracking-widest text-[#5C756D]">
            Live Preview
          </div>
          <div className="relative overflow-hidden bg-[#3E2723] py-1.5">
            <style>{`@keyframes preview-ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}`}</style>
            <div
              style={{ animation: `preview-ticker ${speed}s linear infinite` }}
              className="flex whitespace-nowrap w-max"
            >
              {[0, 1].map(copy => (
                <span key={copy} className="inline-flex items-center gap-5 px-4 text-[11px] font-bold uppercase tracking-widest font-['Cinzel']">
                  {activeItems.map((item, idx) => (
                    <span key={idx} className="inline-flex items-center gap-5">
                      {item.showTimer ? (
                        <span className="inline-flex items-center gap-2 text-[#F3E5AB]">
                          {item.text}
                          <span className="inline-flex items-center gap-1">
                            <span className="bg-[#D4AF37] text-[#3E2723] font-black rounded px-1.5 py-0.5 text-[11px] font-mono leading-none">44</span>
                            <span className="text-[#D4AF37] font-black">:</span>
                            <span className="bg-[#D4AF37] text-[#3E2723] font-black rounded px-1.5 py-0.5 text-[11px] font-mono leading-none">10</span>
                          </span>
                        </span>
                      ) : (
                        <span className={item.highlighted ? "text-[#D4AF37]" : "text-[#F3E5AB]"}>
                          {item.text}
                        </span>
                      )}
                      <span className="text-[#D4AF37]/40">◆</span>
                    </span>
                  ))}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Global Controls */}
      <div className="bg-white rounded-2xl border border-[#E3E8E5] shadow-sm p-5 space-y-5">
        <h2 className="font-bold text-[#384959] text-sm uppercase tracking-wider">Global Settings</h2>

        {/* Enable / Disable */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-[#384959]">Show Ticker Bar</p>
            <p className="text-xs text-[#5C756D]">Toggle the entire scrolling banner on or off</p>
          </div>
          <button
            onClick={() => setEnabled(v => !v)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all border ${
              enabled
                ? "bg-[#384959] text-white border-[#384959]"
                : "bg-white text-[#5C756D] border-[#E3E8E5] hover:border-[#384959]"
            }`}
          >
            {enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            {enabled ? "Visible" : "Hidden"}
          </button>
        </div>

        {/* Speed */}
        <div>
          <label className="block font-semibold text-[#384959] mb-1">
            Scroll Speed
            <span className="ml-2 text-xs font-normal text-[#5C756D]">(seconds per full loop — lower = faster)</span>
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range" min={10} max={80} step={5}
              value={speed}
              onChange={e => setSpeed(Number(e.target.value))}
              className="flex-1 accent-[#384959]"
            />
            <span className="w-14 text-center bg-[#F4F7F5] rounded-lg px-2 py-1 text-sm font-mono font-bold text-[#384959]">
              {speed}s
            </span>
          </div>
          <div className="flex justify-between text-[10px] text-[#5C756D] mt-1 px-1">
            <span>Fast</span><span>Slow</span>
          </div>
        </div>
      </div>

      {/* Items List */}
      <div className="bg-white rounded-2xl border border-[#E3E8E5] shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-[#384959] text-sm uppercase tracking-wider">
            Ticker Items <span className="text-[#5C756D] font-normal">({items.length})</span>
          </h2>
          <button
            onClick={addItem}
            className="flex items-center gap-2 px-4 py-2 bg-[#F4F7F5] text-[#384959] rounded-xl font-bold text-sm hover:bg-[#E8EEEB] transition-all border border-[#E3E8E5]"
          >
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </div>

        {items.length === 0 && (
          <div className="text-center py-10 text-[#5C756D]">
            <Type className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No items yet. Click "Add Item" to start.</p>
          </div>
        )}

        <div className="space-y-3">
          {items.map((item, idx) => (
            <div
              key={item.id}
              className="flex gap-3 items-start bg-[#FAFBF9] rounded-xl border border-[#E3E8E5] p-4 transition-shadow hover:shadow-sm"
            >
              {/* Reorder buttons */}
              <div className="flex flex-col gap-1 pt-1 shrink-0">
                <button
                  onClick={() => moveItem(idx, -1)}
                  disabled={idx === 0}
                  className="p-1 rounded hover:bg-[#E8EEEB] disabled:opacity-20 transition-colors"
                  title="Move up"
                >
                  <ChevronUp className="w-3.5 h-3.5 text-[#5C756D]" />
                </button>
                <button
                  onClick={() => moveItem(idx, 1)}
                  disabled={idx === items.length - 1}
                  className="p-1 rounded hover:bg-[#E8EEEB] disabled:opacity-20 transition-colors"
                  title="Move down"
                >
                  <ChevronDown className="w-3.5 h-3.5 text-[#5C756D]" />
                </button>
              </div>

              {/* Main content */}
              <div className="flex-1 space-y-3">
                {/* Text input */}
                <input
                  type="text"
                  value={item.text}
                  onChange={e => updateItem(item.id, { text: e.target.value })}
                  placeholder="Enter ticker text…"
                  className="w-full px-3 py-2 border border-[#E3E8E5] rounded-lg text-sm text-[#384959] bg-white focus:outline-none focus:ring-2 focus:ring-[#384959]/20 focus:border-[#384959] font-['Cinzel'] uppercase tracking-wide placeholder:normal-case placeholder:font-sans placeholder:tracking-normal"
                />

                {/* Toggles row */}
                <div className="flex flex-wrap gap-3">
                  {/* Highlighted toggle */}
                  <button
                    onClick={() => updateItem(item.id, { highlighted: !item.highlighted })}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                      item.highlighted
                        ? "bg-[#D4AF37]/15 text-[#9a7c2a] border-[#D4AF37]/40"
                        : "bg-white text-[#5C756D] border-[#E3E8E5] hover:border-[#D4AF37]/40"
                    }`}
                    title="Toggle gold highlight color"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    {item.highlighted ? "Gold (highlighted)" : "Cream (normal)"}
                    <span
                      className={`w-3 h-3 rounded-full border-2 ${
                        item.highlighted ? "bg-[#D4AF37] border-[#D4AF37]" : "bg-[#F3E5AB] border-[#ccc]"
                      }`}
                    />
                  </button>

                  {/* Show Timer toggle */}
                  <button
                    onClick={() => updateItem(item.id, { showTimer: !item.showTimer })}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                      item.showTimer
                        ? "bg-[#384959]/10 text-[#384959] border-[#384959]/30"
                        : "bg-white text-[#5C756D] border-[#E3E8E5] hover:border-[#384959]/30"
                    }`}
                    title="Append countdown timer to this item"
                  >
                    <Timer className="w-3.5 h-3.5" />
                    {item.showTimer ? "Timer ON" : "No Timer"}
                  </button>

                  {/* Item preview swatch */}
                  <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-[#3E2723] rounded-lg">
                    {item.showTimer ? (
                      <span className="text-[#F3E5AB] text-[10px] font-['Cinzel'] font-bold uppercase tracking-widest">
                        {item.text || "…"}{" "}
                        <span className="bg-[#D4AF37] text-[#3E2723] rounded px-1 font-mono">44:10</span>
                      </span>
                    ) : (
                      <span
                        className={`text-[10px] font-['Cinzel'] font-bold uppercase tracking-widest ${
                          item.highlighted ? "text-[#D4AF37]" : "text-[#F3E5AB]"
                        }`}
                      >
                        {item.text || "Preview text"}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Delete */}
              <button
                onClick={() => removeItem(item.id)}
                className="p-2 rounded-lg hover:bg-red-50 text-[#ccc] hover:text-red-500 transition-colors shrink-0"
                title="Delete item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Save footer */}
      <div className="flex justify-end">
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-[#384959] text-white rounded-xl font-bold hover:bg-[#2c3a47] disabled:opacity-50 transition-all shadow-md"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Ticker Settings
        </button>
      </div>
    </div>
  );
}
