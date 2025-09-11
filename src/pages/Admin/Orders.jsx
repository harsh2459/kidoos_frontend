import { useEffect, useMemo, useState } from "react";
import { api } from "../../api/client";
import { ShipAPI } from "../../api/shiprocket";
import { useAuth } from "../../contexts/Auth";
import AdminTabs from "../../components/AdminTabs";

function cx(...arr) { return arr.filter(Boolean).join(" "); }

export default function AdminOrders() {
  const { token } = useAuth();
  const auth = { headers: { Authorization: `Bearer ${token || localStorage.getItem("admin_jwt")}` } };

  const [loading, setLoading]   = useState(true);
  const [items, setItems]       = useState([]);
  const [q, setQ]               = useState("");
  const [status, setStatus]     = useState("");
  const [page, setPage]         = useState(1);
  const [total, setTotal]       = useState(0);
  const [selected, setSelected] = useState(() => new Set());
  const hasSelection = selected.size > 0;

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get("/orders", { params: { q, status, page, limit: 20 }, ...auth });
      setItems(data.items || []);
      setTotal(data.total || 0);
      setSelected(prev => {
        const keep = new Set();
        for (const id of prev) if ((data.items || []).some(o => String(o._id) === String(id))) keep.add(id);
        return keep;
      });
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [status, page]);
  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [q]);

  const stats = useMemo(() => {
    const s = { total: items.length, sr: 0, awb: 0, label: 0 };
    for (const o of items) {
      const sr = o?.shipping?.sr || {};
      if (sr.shipmentId) s.sr++;
      if (sr.awb)        s.awb++;
      if (sr.labelUrl)   s.label++;
    }
    return s;
  }, [items]);

  const allOnPageIds = useMemo(() => items.map(o => String(o._id)), [items]);
  const toggleAll = () => {
    const next = new Set(selected);
    const allSelected = allOnPageIds.every(id => next.has(id));
    (allSelected ? allOnPageIds : []).forEach(id => next.delete(id));
    (!allSelected ? allOnPageIds : []).forEach(id => next.add(id));
    setSelected(next);
  };
  const toggleOne = (id) => setSelected(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const ensureSome = () => { if (!selected.size) { alert("Select at least one order"); return null; } return Array.from(selected); };

  async function bulkGenerateLabels() { const ids = ensureSome(); if (!ids) return; await ShipAPI.label(ids, auth); await load(); }
  async function bulkPrintLabels() {
    const ids = ensureSome(); if (!ids) return;
    const chosen = items.filter(o => ids.includes(String(o._id)));
    const existing = chosen.map(o => o?.shipping?.sr?.labelUrl).filter(Boolean);
    for (const url of existing) window.open(url, "_blank", "noopener,noreferrer");
    const toGen = chosen.filter(o => !o?.shipping?.sr?.labelUrl).map(o => String(o._id));
    if (toGen.length) {
      const { data } = await ShipAPI.label(toGen, auth);
      const url = data?.data?.label_url || data?.label_url;
      if (url) window.open(url, "_blank", "noopener,noreferrer");
      await load();
    }
  }
  async function generateAndPrintOne(order) {
    const id = String(order._id);
    if (order?.shipping?.sr?.labelUrl) { window.open(order.shipping.sr.labelUrl, "_blank"); return; }
    const { data } = await ShipAPI.label([id], auth);
    const url = data?.data?.label_url || data?.label_url;
    if (url) window.open(url, "_blank"); else { await load(); alert("Label generated, but URL not ready. Refresh and try again."); }
  }

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-6">
      <h1 className="text-2xl font-bold mb-3">Orders</h1>
      <AdminTabs />

      {/* Toolbar */}
      <div className="bg-surface/80 backdrop-blur border border-border-subtle rounded-xl p-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <input
            className="flex-1 bg-surface border border-border rounded-lg px-3 py-2"
            placeholder="Search order id, customer, phone, email…"
            value={q} onChange={e => { setQ(e.target.value); setPage(1); }}
          />

          {/* chips with a gentle brand ring */}
          <StatChip label="On page" value={stats.total} />
          <StatChip label="SR" value={stats.sr} />
          <StatChip label="AWB" value={stats.awb} />
          <StatChip label="Labels" value={stats.label} />
        </div>

        <div className="mt-3 flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="flex gap-2 overflow-x-auto pr-1">
            {["", "pending", "paid", "shipped", "delivered"].map(st => (
              <button
                key={st || "all"}
                onClick={() => { setStatus(st); setPage(1); }}
                className={cx(
                  "px-3 py-1.5 rounded-full text-sm border transition",
                  st === status
                    ? "bg-brand text-brand-foreground border-brand ring-1 ring-brand/40"
                    : "bg-surface-subtle text-fg border-border-subtle hover:bg-border-subtle/50"
                )}
              >
                {st || "All"}
              </button>
            ))}
          </div>

          <div className="lg:ml-auto flex items-center gap-2">
            <button
              onClick={bulkGenerateLabels}
              disabled={!hasSelection}
              className={cx(
                "px-3 py-2 rounded-lg border text-sm transition",
                hasSelection ? "bg-surface border-border hover:bg-surface-subtle" : "bg-surface border-border-subtle opacity-60 cursor-not-allowed"
              )}
            >
              Generate labels
            </button>
            <button
              onClick={bulkPrintLabels}
              disabled={!hasSelection}
              className={cx(
                "px-3 py-2 rounded-lg text-sm font-semibold transition",
                hasSelection ? "btn-primary" : "btn-muted cursor-not-allowed"
              )}
            >
              Print selected
            </button>

            <details className="relative">
              <summary className="list-none cursor-pointer px-3 py-2 rounded-lg border bg-surface text-sm hover:bg-surface-subtle">
                More
              </summary>
              <div className="absolute right-0 mt-2 w-64 bg-surface border border-border-subtle rounded-lg shadow-lg p-3 z-20">
                <MoreActions ensureSome={ensureSome} auth={auth} reload={load} />
              </div>
            </details>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="mt-4 bg-surface border border-border-subtle rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-subtle text-fg">
              <tr>
                <th className="py-3 px-4 w-10">
                  <input type="checkbox"
                         checked={allOnPageIds.length>0 && allOnPageIds.every(id => selected.has(id))}
                         onChange={toggleAll}/>
                </th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Label</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="py-10 text-center text-gray-500">Loading…</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={7} className="py-10 text-center text-gray-500">No orders</td></tr>
              ) : items.map((o, idx) => {
                const id     = String(o._id);
                const sr     = o?.shipping?.sr || {};
                const dt     = o.createdAt ? new Date(o.createdAt) : null;
                const rupees = typeof o.amount === "number" ? o.amount : (o.amount?.total ?? 0);

                const statusChip =
                  o.status === "paid"      ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                  o.status === "shipped"   ? "bg-blue-50 text-blue-700 border-blue-200" :
                  o.status === "delivered" ? "bg-purple-50 text-purple-700 border-purple-200" :
                                              "bg-amber-50 text-amber-700 border-amber-200";

                return (
                  <tr key={id}
                      className={cx("border-t border-border-subtle", idx % 2 ? "bg-surface-subtle/60" : "bg-surface", "hover:bg-surface-subtle")}>
                    <td className="py-2 px-4">
                      <input type="checkbox" checked={selected.has(id)} onChange={() => toggleOne(id)}/>
                    </td>
                    <td className="py-2 px-4 whitespace-nowrap">{dt ? dt.toLocaleString() : "—"}</td>
                    <td className="py-2 px-4">{id.slice(-8)}</td>
                    <td className="py-2 px-4">
                      <div className="text-sm">{o?.shipping?.name || o?.email || "—"}</div>
                      <div className="text-xs text-fg-subtle">{o?.shipping?.phone || o?.phone || ""}</div>
                    </td>
                    <td className="py-2 px-4">₹{rupees}</td>
                    <td className="py-2 px-4">
                      <span className={cx("inline-flex items-center gap-2 px-2 py-1 rounded-full border text-xs", statusChip, "ring-1 ring-black/0")}>
                        {o.status}
                        <span className={cx("hidden sm:inline-flex items-center gap-1 text-fg-subtle", sr.shipmentId && "text-success")}>
                          • SR {sr.shipmentId ? "✓" : "—"}
                        </span>
                        <span className={cx("hidden sm:inline-flex items-center gap-1 text-fg-subtle", sr.awb && "text-success")}>
                          • AWB {sr.awb || "—"}
                        </span>
                      </span>
                    </td>
                    <td className="py-2 px-4 text-right">
                      <button
                        onClick={() => generateAndPrintOne(o)}
                        className={cx("px-3 py-1.5 rounded-lg text-sm",
                          sr.labelUrl ? "btn-primary" : "btn-muted hover:bg-surface-subtle")}
                      >
                        {sr.labelUrl ? "Print" : "Gen + Print"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-3 bg-surface-subtle border-t border-border-subtle">
          <div className="text-fg-muted text-sm">Page {page} • Showing {items.length} of {total}</div>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="px-3 py-2 rounded-lg border bg-surface hover:bg-surface-subtle">Prev</button>
            <button onClick={() => setPage(p => p + 1)}
                    className="px-3 py-2 rounded-lg border bg-surface hover:bg-surface-subtle">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatChip({ label, value }) {
  return (
    <div className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 ring-1 ring-brand/20 text-sm">
      <span className="text-gray-500">{label}: </span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function MoreActions({ ensureSome, auth, reload }) {
  const [courier, setCourier] = useState("");
  const [pickup, setPickup] = useState("");

  return (
    <div className="space-y-2">
      <button
        onClick={async () => { const ids = ensureSome(); if (!ids) return; await ShipAPI.create(ids, auth); await reload(); }}
        className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-50"
      >
        Create SR shipments
      </button>

      <div className="grid grid-cols-2 gap-2">
        <input placeholder="Courier ID" className="px-2 py-2 border border-gray-300 rounded-md text-sm"
               value={courier} onChange={e => setCourier(e.target.value)} />
        <button
          onClick={async () => { const ids = ensureSome(); if (!ids) return; await ShipAPI.assignAwb(ids, courier || undefined, auth); await reload(); }}
          className="px-2 py-2 rounded-md border hover:bg-gray-50 text-sm"
        >
          Assign AWB
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <input type="date" className="px-2 py-2 border border-gray-300 rounded-md text-sm"
               value={pickup} onChange={e => setPickup(e.target.value)} />
        <button
          onClick={async () => { const ids = ensureSome(); if (!ids) return; await ShipAPI.pickup(ids, pickup || undefined, auth); await reload(); }}
          className="px-2 py-2 rounded-md border hover:bg-gray-50 text-sm"
        >
          Schedule pickup
        </button>
      </div>
    </div>
  );
}