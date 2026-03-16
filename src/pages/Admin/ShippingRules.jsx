import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { useAuth } from "../../contexts/Auth";
import { t } from "../../lib/toast";
import { Plus, Trash2, Save, Package } from "lucide-react";

export default function ShippingRules() {
  const { token } = useAuth();
  const auth = { headers: { Authorization: `Bearer ${token || localStorage.getItem("admin_jwt")}` } };

  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/shipping-rules", auth).then(res => {
      if (res.data?.ok) {
        setRules(res.data.rules.map(r => ({ ...r, onlineCharge: r.onlineCharge ?? "" })));
      }
    }).catch(() => t.err("Failed to load shipping rules"))
      .finally(() => setLoading(false));
  }, []);

  function addRow() {
    setRules(prev => [...prev, { orderValue: "", charge: "", onlineCharge: "" }]);
  }

  function removeRow(i) {
    setRules(prev => prev.filter((_, idx) => idx !== i));
  }

  function updateRow(i, field, value) {
    setRules(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: value } : r));
  }

  async function save() {
    for (const r of rules) {
      if (r.orderValue === "" || r.charge === "") {
        t.info("Fill in Order Value and Charge for all rows.");
        return;
      }
      if (isNaN(Number(r.orderValue)) || isNaN(Number(r.charge))) {
        t.info("Order Value and Charge must be numbers.");
        return;
      }
    }

    setSaving(true);
    try {
      const payload = rules.map(r => ({
        orderValue: Number(r.orderValue),
        charge: Number(r.charge),
        onlineCharge: r.onlineCharge !== "" ? Number(r.onlineCharge) : null
      }));
      const res = await api.put("/shipping-rules", { rules: payload }, auth);
      if (res.data?.ok) {
        setRules(res.data.rules.map(r => ({ ...r, onlineCharge: r.onlineCharge ?? "" })));
        t.success("Shipping rules saved!");
      } else {
        t.err(res.data?.error || "Failed to save");
      }
    } catch (e) {
      t.err(e?.response?.data?.error || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  const fmt = n => n !== "" && !isNaN(Number(n)) ? `₹${Number(n)}` : "—";

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#384959] rounded-xl flex items-center justify-center">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#384959]">Shipping Charges</h1>
            <p className="text-sm text-gray-500 mt-0.5">Set delivery charges based on order value</p>
          </div>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 bg-[#384959] hover:bg-[#2c3a47] text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors disabled:opacity-60"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* Info box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-sm text-blue-800">
        <strong>How it works:</strong> The system picks the tier where the order total meets or exceeds the <em>Min Order Value</em>.
        For example, if you set 300→₹50 and 500→₹70 — an order of ₹450 gets ₹50 charge; ₹600 gets ₹70 charge.
        <br /><br />
        <strong>Online Charge</strong> (optional): Set a lower charge for customers paying fully online. Leave blank to use the same charge for all orders.
        <br /><br />
        These charges apply to <strong>all orders</strong>.
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading…</div>
      ) : (
        <>
          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Min Order Value (₹)</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Delivery Charge (₹)</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600">
                    Online-only Charge (₹)
                    <span className="ml-1 text-xs font-normal text-gray-400">optional</span>
                  </th>
                  <th className="px-5 py-3.5 w-12"></th>
                </tr>
              </thead>
              <tbody>
                {rules.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-12 text-gray-400">
                      No rules yet. Click "Add Tier" to create one.
                    </td>
                  </tr>
                )}
                {rules.map((r, i) => (
                  <tr key={i} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 font-bold">₹</span>
                        <input
                          type="number"
                          min="0"
                          value={r.orderValue}
                          onChange={e => updateRow(i, "orderValue", e.target.value)}
                          className="w-32 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#384959]/30 focus:border-[#384959]"
                          placeholder="e.g. 300"
                        />
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 font-bold">₹</span>
                        <input
                          type="number"
                          min="0"
                          value={r.charge}
                          onChange={e => updateRow(i, "charge", e.target.value)}
                          className="w-32 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#384959]/30 focus:border-[#384959]"
                          placeholder="e.g. 50"
                        />
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 font-bold">₹</span>
                        <input
                          type="number"
                          min="0"
                          value={r.onlineCharge}
                          onChange={e => updateRow(i, "onlineCharge", e.target.value)}
                          className="w-32 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#384959]/30 focus:border-[#384959]"
                          placeholder="e.g. 30"
                        />
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => removeRow(i)}
                        className="text-gray-300 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={addRow}
            className="flex items-center gap-2 text-[#384959] hover:text-[#2c3a47] border border-dashed border-[#384959]/40 hover:border-[#384959] px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:bg-[#384959]/5 w-full justify-center mb-8"
          >
            <Plus className="w-4 h-4" />
            Add Tier
          </button>

          {/* Preview */}
          {rules.length > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
              <h3 className="font-semibold text-gray-700 mb-3 text-sm">Preview (sorted by order value)</h3>
              <div className="space-y-2">
                {[...rules]
                  .filter(r => r.orderValue !== "" && r.charge !== "")
                  .sort((a, b) => Number(a.orderValue) - Number(b.orderValue))
                  .map((r, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <span className="text-gray-500 w-36">Order ≥ {fmt(r.orderValue)}</span>
                      <span className="font-semibold text-gray-800">→ {fmt(r.charge)}</span>
                      {r.onlineCharge !== "" && (
                        <span className="text-blue-600 text-xs font-medium">
                          ({fmt(r.onlineCharge)} online)
                        </span>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
