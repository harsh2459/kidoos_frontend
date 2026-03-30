import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { useAuth } from "../../contexts/Auth";
import { t } from "../../lib/toast";
import { Plus, Trash2, Save, MapPin } from "lucide-react";

export default function ShippingRules() {
  const { token } = useAuth();
  const auth = { headers: { Authorization: `Bearer ${token || localStorage.getItem("admin_jwt")}` } };

  const [stateOverrides, setStateOverrides] = useState([]);
  const [codExtra, setCodExtra] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/shipping-rates/overrides").then(res => {
      if (res.data?.ok) {
        setStateOverrides((res.data.stateOverrides || []).map(r => ({ ...r, halfCodOnly: !!r.halfCodOnly })));
        setCodExtra(res.data.codExtra !== undefined ? String(res.data.codExtra) : "");
      }
    }).catch(() => t.err({ title: "Load failed", sub: "Could not load shipping settings. Please refresh." }));
  }, []);

  function addStateRow() {
    setStateOverrides(prev => [...prev, { state: "", extra: "", halfCodOnly: false }]);
  }

  function removeStateRow(i) {
    setStateOverrides(prev => prev.filter((_, idx) => idx !== i));
  }

  function updateStateRow(i, field, value) {
    setStateOverrides(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: value } : r));
  }

  async function save() {
    for (const r of stateOverrides) {
      if (!r.state.trim() || r.extra === "") {
        t.info({ title: "Incomplete rows", sub: "Fill in State and Extra Charge for all rows." });
        return;
      }
      if (isNaN(Number(r.extra)) || Number(r.extra) < 0) {
        t.info({ title: "Invalid value", sub: "Extra charge must be a non-negative number." });
        return;
      }
    }
    setSaving(true);
    try {
      const payload = {
        stateOverrides: stateOverrides.map(r => ({ state: r.state.trim(), extra: Number(r.extra) })),
        codExtra: codExtra !== "" ? Number(codExtra) : 0,
      };
      const res = await api.put("/shipping-rates/overrides", payload, auth);
      if (res.data?.ok) {
        t.ok({ title: "Saved", sub: "Shipping surcharge settings have been updated." });
      } else {
        t.err({ title: "Save failed", sub: res.data?.error || "Could not save settings." });
      }
    } catch (e) {
      t.err({ title: "Save failed", sub: e?.response?.data?.error || "Could not save settings." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#384959] rounded-xl flex items-center justify-center">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#384959]">Shipping Surcharges</h1>
            <p className="text-sm text-gray-500 mt-0.5">Extra charges applied on top of Shiprocket's live courier rate</p>
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
        Shipping charges are fetched live from <strong>Shiprocket</strong> based on the customer's pincode and cart weight.
        Use the settings below to add extra charges on top — for specific states or for COD orders.
      </div>

      {/* State surcharges table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-5 py-3.5 font-semibold text-gray-600">State Name</th>
              <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Extra Charge (₹)</th>
              <th className="text-left px-5 py-3.5 font-semibold text-gray-600">
                Half-COD only
                <span className="ml-1 text-xs font-normal text-gray-400">skip for full-online</span>
              </th>
              <th className="px-5 py-3.5 w-12"></th>
            </tr>
          </thead>
          <tbody>
            {stateOverrides.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-10 text-gray-400">
                  No state surcharges. Click "Add State" to create one.
                </td>
              </tr>
            )}
            {stateOverrides.map((r, i) => (
              <tr key={i} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3">
                  <input
                    type="text"
                    value={r.state}
                    onChange={e => updateStateRow(i, "state", e.target.value)}
                    className="w-48 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#384959]/30 focus:border-[#384959]"
                    placeholder="e.g. Maharashtra"
                  />
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 font-bold">₹</span>
                    <input
                      type="number"
                      min="0"
                      value={r.extra}
                      onChange={e => updateStateRow(i, "extra", e.target.value)}
                      className="w-28 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#384959]/30 focus:border-[#384959]"
                      placeholder="e.g. 20"
                    />
                  </div>
                </td>
                <td className="px-5 py-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!r.halfCodOnly}
                      onChange={e => updateStateRow(i, "halfCodOnly", e.target.checked)}
                      className="w-4 h-4 accent-[#384959] cursor-pointer"
                    />
                    <span className="text-xs text-gray-500">Half-COD only</span>
                  </label>
                </td>
                <td className="px-5 py-3 text-right">
                  <button
                    onClick={() => removeStateRow(i)}
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
        onClick={addStateRow}
        className="flex items-center gap-2 text-[#384959] hover:text-[#2c3a47] border border-dashed border-[#384959]/40 hover:border-[#384959] px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:bg-[#384959]/5 w-full justify-center mb-8"
      >
        <Plus className="w-4 h-4" />
        Add State
      </button>

      {/* COD extra */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <h3 className="font-semibold text-gray-700 mb-1 text-sm">Half-Online / Half-COD Extra Charge</h3>
        <p className="text-xs text-gray-400 mb-4">Added to shipping when customer selects half-online + half cash-on-delivery payment.</p>
        <div className="flex items-center gap-3">
          <span className="text-gray-500 font-bold">₹</span>
          <input
            type="number"
            min="0"
            value={codExtra}
            onChange={e => setCodExtra(e.target.value)}
            className="w-36 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#384959]/30 focus:border-[#384959]"
            placeholder="e.g. 50"
          />
          <span className="text-xs text-gray-400">Enter 0 for no extra charge</span>
        </div>
      </div>
    </div>
  );
}
