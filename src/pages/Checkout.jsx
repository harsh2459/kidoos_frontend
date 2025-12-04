// src/pages/Checkout.jsx
import { useMemo, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useCart } from "../contexts/CartStore";
import { assetUrl } from "../api/asset";
import { useSite } from "../contexts/SiteConfig";
import { t } from "../lib/toast";
import { useCustomer } from "../contexts/CustomerAuth";
import {
  MapPin, CreditCard,
  ArrowLeft, ShieldCheck,
} from "lucide-react";

/* ------------ Razorpay loader ------------ */
function loadRzp() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve();
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load Razorpay"));
    document.body.appendChild(s);
  });
}

export default function Checkout() {
  const navigate = useNavigate();
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);
  const { payments } = useSite();

  const { customer, isCustomer, token } = useCustomer();
  const pollTimer = useRef(null);
  const [paymentOption, setPaymentOption] = useState("full_online");

  // Background texture
  const bgImage = "url('/images/terms-bg.png')";

  /* ------------ Totals ------------ */
  const totals = useMemo(() => {
    const sub = items.reduce((sum, i) => {
      const price = Number(i.unitPriceSnapshot ?? i.price ?? i.bookId?.price ?? 0);
      const qty = Number(i.qty ?? 1);
      return sum + price * qty;
    }, 0);
    return { sub, grand: sub };
  }, [items]);

  const fmt = (n) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency", currency: "INR", maximumFractionDigits: 0,
    }).format(n);

  /* ------------ Customer State ------------ */
  const [cust, setCust] = useState({
    name: "", email: "", phone: "",
    line1: "", city: "", state: "", pin: "", country: "India",
  });

  useEffect(() => {
    if (customer) {
      setCust(prev => ({
        ...prev,
        name: customer.name || prev.name,
        email: customer.email || prev.email,
        phone: customer.phone || prev.phone,
      }));
    }
  }, [customer]);

  const set = (k, v) => setCust((p) => ({ ...p, [k]: v }));

  /* ------------ PIN Logic ------------ */
  const [pinStatus, setPinStatus] = useState("");
  const [offices, setOffices] = useState([]);
  const [locality, setLocality] = useState("");
  const pinDebounce = useRef(null);

  async function lookupPin(pin) {
    if (!/^\d{6}$/.test(pin)) {
      setPinStatus(""); setOffices([]); return;
    }
    try {
      setPinStatus("Looking up…");
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const data = await res.json();
      const entry = Array.isArray(data) ? data[0] : null;

      if (!entry || entry.Status !== "Success" || !entry.PostOffice?.length) {
        setPinStatus("Not found"); setOffices([]); return;
      }

      const list = entry.PostOffice;
      setOffices(list);
      setLocality(list[0]?.Name || "");
      set("city", (list[0]?.District || "").trim());
      set("state", (list[0]?.State || "").trim());
      setPinStatus("OK");
    } catch {
      setPinStatus("Not found"); setOffices([]);
    }
  }

  function onPinChange(v) {
    const onlyDigits = v.replace(/\D/g, "").slice(0, 6);
    set("pin", onlyDigits);
    clearTimeout(pinDebounce.current);
    if (/^\d{6}$/.test(onlyDigits)) {
      pinDebounce.current = setTimeout(() => lookupPin(onlyDigits), 250);
    } else {
      setPinStatus(""); setOffices([]);
    }
  }

  /* ------------ Order Placement ------------ */
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState(null);
  const hasOnlinePay = (payments?.providers || []).some(p => p.id === "razorpay" && p.enabled);

  function validateShipping() {
    if (items.length === 0) { navigate("/cart"); return false; }
    if (!cust.name || !cust.phone || !cust.line1 || !cust.city || !cust.state || !cust.pin) {
      t.info("Please fill all shipping details."); return false;
    }
    if (!/^\d{6}$/.test(cust.pin)) { t.info("Invalid PIN Code."); return false; }
    return true;
  }

  const getBookIdFromCartItem = (item) => {
    if (item.bookId && typeof item.bookId === 'object' && item.bookId._id) return item.bookId._id;
    if (typeof item.bookId === 'string') return item.bookId;
    if (item.book?._id) return item.book._id;
    if (item._id && !item._id.startsWith('local_')) return item._id;
    return item.id;
  };

  async function createLocalOrder(paymentMethod, paymentStatus = "pending") {
    const mappedItems = items.map((item) => {
      const bookId = getBookIdFromCartItem(item);
      if (!bookId || bookId.startsWith('local_')) throw new Error(`Invalid book ID for "${item.title}"`);
      return {
        bookId,
        title: item.title,
        price: item.unitPriceSnapshot || item.price,
        qty: item.qty,
      };
    });

    const payload = {
      ...(isCustomer && customer?.id && { customerId: customer.id }),
      items: mappedItems,
      customer: { name: cust.name, email: cust.email, phone: cust.phone },
      shipping: {
        address1: cust.line1, city: cust.city, state: cust.state,
        postalCode: cust.pin, country: cust.country, locality: locality || undefined,
      },
      amount: totals.grand, currency: "INR",
      payment: { method: paymentMethod, status: paymentStatus },
    };

    const { data } = await api.post("/orders", payload);
    if (!data?.ok) throw new Error(data?.error || "Failed to create order");
    return data.orderId || data._id;
  }

  async function placeWithRazorpay() {
    if (!validateShipping()) return;
    setPlacing(true);
    try {
      const orderId = await createLocalOrder("razorpay", "created");
      const { data } = await api.post("/payments/razorpay/order", {
        amountInRupees: totals.grand,
        receipt: `web_${orderId}`,
        orderId,
        paymentType: paymentOption,
      });

      const { order, key, paymentId } = data || {};
      if (!order?.id || !key || !paymentId) throw new Error("Payment init failed");

      await loadRzp();
      const rzp = new window.Razorpay({
        key, amount: order.amount, currency: order.currency,
        name: "Kiddos Intellect", description: `Order ${orderId}`,
        order_id: order.id,
        prefill: { name: cust.name || "", email: cust.email || "", contact: cust.phone || "" },
        notes: { ourOrderId: orderId },
        handler: async function (response) {
          try {
            const verifyRes = await api.post("/payments/razorpay/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              paymentId,
            });
            if (verifyRes?.data?.ok && verifyRes?.data?.verified) {
              setPlaced({ orderId });
              clear();
              t.success("Payment successful!");
              navigate("/order-confirmed", { state: { orderId } });
            } else { t.err("Payment verification failed"); }
          } catch (e) { t.err("Error verifying payment"); }
        },
        theme: { color: "#1A3C34" },
      });
      rzp.open();
    } catch (e) { t.err(e?.response?.data?.error || "Payment failed to start"); }
    finally { setPlacing(false); }
  }

  if (placed) return null; // Navigate handles this

  return (
    <div className="bg-[#F4F7F5] min-h-screen font-sans text-[#2C3E38] selection:bg-[#D4E2D4] selection:text-[#1A3C34] pb-20">

      {/* --- HEADER --- */}
      <div className="relative w-full pt-20 md:pt-28 pb-12 px-6 border-b border-[#E3E8E5] bg-[#1A3C34] overflow-hidden">
        <div
          className="absolute inset-0 z-0 pointer-events-none opacity-20 mix-blend-soft-light"
          style={{ backgroundImage: bgImage, backgroundSize: 'cover', filter: 'grayscale(100%)' }}
        />
        <div className="relative z-10 max-w-7xl 2xl:max-w-[1800px] mx-auto flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-2">Secure Checkout</h1>
            <p className="text-[#8BA699] text-lg font-light">Complete your order details.</p>
          </div>
          <button
            onClick={() => navigate("/cart")}
            className="flex items-center gap-2 text-[#8BA699] hover:text-white transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Cart
          </button>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="max-w-7xl 2xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">

          {/* LEFT COLUMN: FORMS */}
          <div className="lg:col-span-8 space-y-8">

            {/* 1. Shipping Details */}
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-[#E3E8E5] shadow-sm">
              <div className="flex items-center gap-3 mb-6 border-b border-[#E3E8E5] pb-4">
                <div className="w-10 h-10 rounded-full bg-[#E8F0EB] flex items-center justify-center text-[#1A3C34]">
                  <MapPin className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-serif font-bold text-[#1A3C34]">Shipping Details</h2>
              </div>

              <div className="space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-bold text-[#2C3E38] mb-2">Full Name</label>
                  <div className="relative">
                    {/* <User className="absolute left-4 top-3.5 w-5 h-5 text-[#8BA699]" /> */}
                    <input
                      value={cust.name} onChange={(e) => set("name", e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-[#FAFBF9] border border-[#DCE4E0] rounded-xl focus:border-[#1A3C34] focus:ring-1 focus:ring-[#1A3C34] outline-none transition-all"
                      placeholder="e.g. John Doe"
                    />
                  </div>
                </div>

                {/* Contact */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-[#2C3E38] mb-2">Email</label>
                    <div className="relative">

                      <input
                        type="email" value={cust.email} onChange={(e) => set("email", e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-[#FAFBF9] border border-[#DCE4E0] rounded-xl focus:border-[#1A3C34] outline-none transition-all"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#2C3E38] mb-2">Phone</label>
                    <div className="relative">
                      <input
                        type="tel" maxLength={10} value={cust.phone} onChange={(e) => set("phone", e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-[#FAFBF9] border border-[#DCE4E0] rounded-xl focus:border-[#1A3C34] outline-none transition-all"
                        placeholder="10-digit number"
                      />
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-[#2C3E38] mb-2">Address</label>
                    <input
                      value={cust.line1} onChange={(e) => set("line1", e.target.value)}
                      className="w-full px-4 py-3 bg-[#FAFBF9] border border-[#DCE4E0] rounded-xl focus:border-[#1A3C34] outline-none transition-all"
                      placeholder="House No, Building, Street Area"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#2C3E38] mb-2">PIN Code</label>
                    <div className="relative">
                      <input
                        value={cust.pin} onChange={(e) => onPinChange(e.target.value)}
                        className="w-full px-4 py-3 bg-[#FAFBF9] border border-[#DCE4E0] rounded-xl focus:border-[#1A3C34] outline-none transition-all"
                        placeholder="6-digit PIN" maxLength={6}
                      />
                      {pinStatus && (
                        <span className={`absolute right-4 top-3.5 text-xs font-bold ${pinStatus === "OK" ? "text-green-600" : "text-blue-600"}`}>
                          {pinStatus}
                        </span>
                      )}
                    </div>
                  </div>

                  {offices.length > 0 && (
                    <div>
                      <label className="block text-sm font-bold text-[#2C3E38] mb-2">Locality</label>
                      <select
                        value={locality} onChange={(e) => setLocality(e.target.value)}
                        className="w-full px-4 py-3 bg-[#FAFBF9] border border-[#DCE4E0] rounded-xl focus:border-[#1A3C34] outline-none"
                      >
                        {offices.map((o, i) => <option key={i} value={o.Name}>{o.Name}</option>)}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-bold text-[#2C3E38] mb-2">City</label>
                    <input
                      value={cust.city} onChange={(e) => set("city", e.target.value)}
                      className="w-full px-4 py-3 bg-[#E8F0EB] border border-[#DCE4E0] rounded-xl text-[#5C756D]"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#2C3E38] mb-2">State</label>
                    <input
                      value={cust.state} onChange={(e) => set("state", e.target.value)}
                      className="w-full px-4 py-3 bg-[#E8F0EB] border border-[#DCE4E0] rounded-xl text-[#5C756D]"
                      readOnly
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Payment Options */}
            {hasOnlinePay && (
              <div className="bg-white p-6 md:p-8 rounded-2xl border border-[#E3E8E5] shadow-sm">
                <div className="flex items-center gap-3 mb-6 border-b border-[#E3E8E5] pb-4">
                  <div className="w-10 h-10 rounded-full bg-[#E8F0EB] flex items-center justify-center text-[#1A3C34]">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-serif font-bold text-[#1A3C34]">Payment Method</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Full Payment */}
                  <label className={`relative p-5 border-2 rounded-xl cursor-pointer transition-all ${paymentOption === "full_online"
                      ? "border-[#1A3C34] bg-[#F4F7F5]"
                      : "border-[#E3E8E5] hover:border-[#8BA699]"
                    }`}>
                    <input
                      type="radio" name="payment" value="full_online"
                      checked={paymentOption === "full_online"}
                      onChange={(e) => setPaymentOption(e.target.value)}
                      className="absolute top-5 right-5 accent-[#1A3C34] w-5 h-5"
                    />
                    <h4 className="font-bold text-[#1A3C34] mb-1">Full Online Payment</h4>
                    <p className="text-sm text-[#5C756D] mb-3">Pay 100% securely now.</p>
                    <div className="text-xl font-bold text-[#1A3C34]">{fmt(totals.grand)}</div>
                  </label>

                  {/* Half Payment */}
                  <label className={`relative p-5 border-2 rounded-xl cursor-pointer transition-all ${paymentOption === "half_online_half_cod"
                      ? "border-[#1A3C34] bg-[#F4F7F5]"
                      : "border-[#E3E8E5] hover:border-[#8BA699]"
                    }`}>
                    <input
                      type="radio" name="payment" value="half_online_half_cod"
                      checked={paymentOption === "half_online_half_cod"}
                      onChange={(e) => setPaymentOption(e.target.value)}
                      className="absolute top-5 right-5 accent-[#1A3C34] w-5 h-5"
                    />
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-[#1A3C34]">Half & Half</h4>
                    </div>
                    <p className="text-sm text-[#5C756D] mb-3">50% Now + 50% on Delivery.</p>
                    <div className="flex gap-4 text-sm">
                      <div>
                        <span className="block text-xs text-[#8BA699]">Now</span>
                        <span className="font-bold text-[#4A7C59]">{fmt(totals.grand / 2)}</span>
                      </div>
                      <div className="border-l border-[#DCE4E0]"></div>
                      <div>
                        <span className="block text-xs text-[#8BA699]">Later (COD)</span>
                        <span className="font-bold text-[#1A3C34]">{fmt(totals.grand / 2)}</span>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: SUMMARY */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl border border-[#E3E8E5] shadow-sm p-6 lg:p-8 sticky top-24">
              <h2 className="text-xl font-serif font-bold text-[#1A3C34] mb-6">Order Summary</h2>

              {/* Mini Cart Items */}
              <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#DCE4E0]">
                {items.map((item) => (
                  <div key={item._id || item.id} className="flex gap-3">
                    <div className="w-12 h-16 bg-[#F4F7F5] rounded overflow-hidden flex-shrink-0 border border-[#E3E8E5]">
                      {item.bookId?.assets?.coverUrl?.[0] || item.image ? (
                        <img src={assetUrl(item.bookId?.assets?.coverUrl?.[0] || item.image)} className="w-full h-full object-cover" />
                      ) : <div className="w-full h-full flex items-center justify-center text-[10px]">No Img</div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[#1A3C34] text-sm truncate">{item.title}</p>
                      <p className="text-xs text-[#5C756D]">Qty: {item.qty}</p>
                    </div>
                    <p className="font-bold text-[#1A3C34] text-sm">{fmt(item.unitPriceSnapshot || item.price)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#E3E8E5] pt-4 space-y-3 mb-6">
                <div className="flex justify-between text-[#5C756D] text-sm">
                  <span>Subtotal</span>
                  <span>{fmt(totals.grand)}</span>
                </div>
                <div className="flex justify-between text-[#5C756D] text-sm">
                  <span>Shipping</span>
                  <span className="font-bold text-[#4A7C59]">Free</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-[#E3E8E5]">
                  <span className="font-bold text-[#1A3C34] text-lg">Total</span>
                  <span className="font-bold text-[#1A3C34] text-xl">{fmt(totals.grand)}</span>
                </div>
              </div>

              {hasOnlinePay ? (
                <button
                  onClick={placeWithRazorpay}
                  disabled={placing}
                  className="w-full py-4 bg-[#1A3C34] text-white rounded-xl font-bold hover:bg-[#2F523F] transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {placing ? "Processing..." : `Pay ${fmt(paymentOption === "half_online_half_cod" ? totals.grand / 2 : totals.grand)}`}
                </button>
              ) : (
                <div className="bg-[#FFF9F0] border border-[#F5E6D3] p-3 rounded-lg text-center text-[#8A6A4B] text-sm font-medium">
                  ⚠️ Payments currently disabled
                </div>
              )}

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[#8BA699]">
                <ShieldCheck className="w-3 h-3" />
                <span>Secure SSL Encryption</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}