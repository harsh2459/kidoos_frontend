// src/pages/admin/Payments.jsx
import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { t } from "../../lib/toast";
import {
  CreditCard,

  Save,
  ShieldCheck,
  Loader2
} from "lucide-react";

export default function PaymentsAdmin() {
  const [token] = useState(localStorage.getItem("admin_jwt") || "");
  const [razorpay, setRazorpay] = useState({ enabled: false, config: { keyId: "", keySecret: "" } });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/settings", { headers: { Authorization: `Bearer ${token}` } });
        if (data.ok) {
          const rp = (data.payments?.providers || []).find(p => p.id === "razorpay");
          if (rp) {
            setRazorpay({
              enabled: !!rp.enabled,
              config: { keyId: rp.config?.keyId || "", keySecret: rp.config?.keySecret || "" }
            });
          }
        }
      } catch (error) {
        console.error("Failed to load payment settings", error);
      }
    })();
  }, [token]);

  const save = async () => {
    setSaving(true);
    try {
      await api.post("/settings/payments",
        { providers: [{ id: "razorpay", enabled: razorpay.enabled, config: { keyId: razorpay.config.keyId, keySecret: razorpay.config.keySecret } }] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      t.ok("Payment settings saved successfully");
    } catch (error) {
      t.err("Failed to save payment settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 2xl:px-12 max-w-7xl 2xl:max-w-[1800px] py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#1A3C34] tracking-tight">Payment Gateways</h1>
          <p className="text-[#5C756D] mt-1 text-sm">Configure how you accept payments from customers.</p>
        </div>
      </div>

      <div className="max-w-3xl">
        {/* Razorpay Card */}
        <div className="bg-white border border-[#E3E8E5] rounded-2xl shadow-sm overflow-hidden mb-6">

          {/* Card Header */}
          <div className="bg-[#FAFBF9] border-b border-[#E3E8E5] px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3 font-bold text-[#1A3C34] text-lg">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
                <CreditCard className="w-5 h-5" />
              </div>
              Razorpay
            </div>

            {/* Custom Status Toggle */}
            <label className={`
                    flex items-center gap-3 cursor-pointer px-4 py-2 rounded-xl border transition-all select-none
                    ${razorpay.enabled ? "bg-[#1A3C34] border-[#1A3C34]" : "bg-white border-[#E3E8E5] hover:bg-[#F4F7F5]"}
                `}>
              <input
                type="checkbox"
                checked={razorpay.enabled}
                onChange={() => setRazorpay(r => ({ ...r, enabled: !r.enabled }))}
                className="hidden"
              />
              <div className={`w-8 h-4 rounded-full relative transition-colors ${razorpay.enabled ? "bg-white/20" : "bg-gray-200"}`}>
                <div
                  className={`absolute top-0.5 w-3 h-3 rounded-full transition-all duration-200 bg-white shadow-sm`}
                  style={{ left: razorpay.enabled ? '1.1rem' : '0.125rem' }}
                ></div>
              </div>
              <span className={`font-bold text-sm ${razorpay.enabled ? "text-white" : "text-[#5C756D]"}`}>
                {razorpay.enabled ? 'Active' : 'Disabled'}
              </span>
            </label>
          </div>

          {/* Card Body */}
          <div className="p-6 space-y-6">
            <div className="text-sm text-[#5C756D] bg-[#F4F7F5] p-4 rounded-xl border border-[#E3E8E5] flex gap-3 items-start">
              <ShieldCheck className="w-5 h-5 text-[#1A3C34] shrink-0 mt-0.5" />
              <p>
                Razorpay allows you to accept payments via Credit/Debit Cards, UPI, Wallets, and Netbanking.
                Ensure your keys are from your <strong>Live Mode</strong> dashboard for production.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5">
              {/* Key ID Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5C756D] mb-2">
                  Key ID <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <input
                    className="w-full bg-[#FAFBF9] border border-[#E3E8E5] rounded-xl pl-11 pr-4 py-3 text-[#1A3C34] font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C34]/20 focus:border-[#1A3C34] transition-all placeholder:text-[#8BA699]"
                    value={razorpay.config.keyId}
                    onChange={e => setRazorpay(r => ({ ...r, config: { ...r.config, keyId: e.target.value } }))}
                    placeholder="rzp_live_..."
                  />
                </div>
              </div>

              {/* Key Secret Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5C756D] mb-2">
                  Key Secret <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <input
                    type="password"
                    className="w-full bg-[#FAFBF9] border border-[#E3E8E5] rounded-xl pl-11 pr-4 py-3 text-[#1A3C34] font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C34]/20 focus:border-[#1A3C34] transition-all placeholder:text-[#8BA699]"
                    value={razorpay.config.keySecret}
                    onChange={e => setRazorpay(r => ({ ...r, config: { ...r.config, keySecret: e.target.value } }))}
                    placeholder="••••••••••••••••"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={save}
          disabled={saving}
          className="
                flex items-center gap-2 px-8 py-3 rounded-xl 
                bg-[#1A3C34] text-white font-bold text-sm shadow-md 
                hover:bg-[#2F523F] active:scale-95 transition-all 
                disabled:opacity-70 disabled:cursor-not-allowed
            "
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>
    </div>
  );
}