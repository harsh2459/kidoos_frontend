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
  MapPin, CreditCard, ArrowLeft, ShieldCheck, Truck, Zap, PartyPopper, ArrowRight
} from "lucide-react";

function loadRzp() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve();
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.async = true;
    s.onload = () => resolve();
    document.body.appendChild(s);
  });
}

export default function Checkout() {
  const navigate = useNavigate();
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);
  const { payments } = useSite();
  const { customer, isCustomer } = useCustomer();
  const [paymentOption, setPaymentOption] = useState("full_online");
  const bgImage = "url('/images/terms-bg.png')";

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

  /* ------------ FEE LOGIC ------------ */
  const getBaseZoneFee = (pincode) => {
    // If pincode is invalid/empty, return 0 so fees don't show prematurely
    if (!pincode || String(pincode).length < 6) return 0; 
    
    const pinStr = String(pincode);
    if (pinStr.startsWith("394")) return 60; // Surat
    const prefix = parseInt(pinStr.substring(0, 2));
    if (prefix >= 36 && prefix <= 39) return 80; // Gujarat
    return 100; // Rest of India
  };

  const getBulkDiscount = (qty) => {
    if (qty >= 20) return 50;
    if (qty >= 15) return 40;
    if (qty >= 10) return 30;
    if (qty >= 5) return 20;
    return 0;
  };

  /* ------------ TOTALS ------------ */
  const totals = useMemo(() => {
    let itemTotal = 0;
    let totalQty = 0;

    items.forEach(i => {
      const price = Number(i.unitPriceSnapshot ?? i.price ?? i.bookId?.price ?? 0);
      const qty = Number(i.qty ?? 1);
      itemTotal += price * qty;
      totalQty += qty;
    });

    let finalShippingFee = 0;
    let finalServiceFee = 0;
    let baseTotalFee = 0;
    let discount = 0;

    if (paymentOption === "half_online_half_cod") {
      baseTotalFee = getBaseZoneFee(cust.pin);
      
      // Only apply logic if we have a valid base fee (valid pincode)
      if (baseTotalFee > 0) {
        discount = getBulkDiscount(totalQty);
        let totalFeeAfterDiscount = Math.max(0, baseTotalFee - discount);

        // Split: Service fixed at 30, rest is Shipping
        finalServiceFee = Math.min(30, totalFeeAfterDiscount);
        finalShippingFee = Math.max(0, totalFeeAfterDiscount - finalServiceFee);
      }
    }

    const grand = itemTotal + finalShippingFee + finalServiceFee;
    let payNow = 0;
    let payLater = 0;

    if (paymentOption === "half_online_half_cod") {
      payLater = itemTotal / 2;
      payNow = (itemTotal / 2) + finalShippingFee + finalServiceFee;
    } else {
      payNow = grand;
      payLater = 0;
    }

    return { 
      sub: itemTotal, 
      totalQty, 
      baseTotalFee, 
      discount, 
      finalShippingFee, 
      finalServiceFee,
      grand, 
      payNow, 
      payLater 
    };
  }, [items, paymentOption, cust.pin]);

  /* ------------ NUDGE ------------ */
  const savingsNudge = useMemo(() => {
    const qty = totals.totalQty;
    if (qty >= 20) return null;
    let nextTier = 0;
    let nextSave = 0;
    if (qty < 5) { nextTier = 5; nextSave = 20; }
    else if (qty < 10) { nextTier = 10; nextSave = 30; }
    else if (qty < 15) { nextTier = 15; nextSave = 40; }
    else if (qty < 20) { nextTier = 20; nextSave = 50; }
    return { needed: nextTier - qty, nextSave };
  }, [totals.totalQty]);

  const fmt = (n) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

  /* ------------ PIN Logic ------------ */
  const [pinStatus, setPinStatus] = useState("");
  const [offices, setOffices] = useState([]);
  const [locality, setLocality] = useState("");
  const pinDebounce = useRef(null);

  async function lookupPin(pin) {
    if (!/^\d{6}$/.test(pin)) { setPinStatus(""); setOffices([]); return; }
    try {
      setPinStatus("Looking up…");
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const data = await res.json();
      const entry = Array.isArray(data) ? data[0] : null;
      if (!entry || entry.Status !== "Success" || !entry.PostOffice?.length) {
        setPinStatus("Not found"); setOffices([]); return;
      }
      setOffices(entry.PostOffice);
      setLocality(entry.PostOffice[0]?.Name || "");
      set("city", (entry.PostOffice[0]?.District || "").trim());
      set("state", (entry.PostOffice[0]?.State || "").trim());
      setPinStatus("OK");
    } catch { setPinStatus("Not found"); setOffices([]); }
  }

  function onPinChange(v) {
    const onlyDigits = v.replace(/\D/g, "").slice(0, 6);
    set("pin", onlyDigits);
    clearTimeout(pinDebounce.current);
    if (/^\d{6}$/.test(onlyDigits)) { pinDebounce.current = setTimeout(() => lookupPin(onlyDigits), 250); }
    else { setPinStatus(""); setOffices([]); }
  }

  /* ------------ ORDER CREATION ------------ */
  const [placing, setPlacing] = useState(false);
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
      amount: totals.grand, 
      currency: "INR",
      
      // ✅ Sending fees separately so Backend stores them correctly
      shippingFee: totals.finalShippingFee,
      serviceFee: totals.finalServiceFee,
      
      payment: { method: paymentMethod, status: paymentStatus, dueOnDeliveryAmount: totals.payLater },
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
      
      // ✅ FIX FOR BACKEND LOGIC:
      // Since the backend DIVIDES Half Payments by 2, we must MULTIPLY by 2 here 
      // to ensure the customer pays the correct calculated amount.
      let amountToSend = totals.payNow;
      if (paymentOption === "half_online_half_cod") {
        amountToSend = totals.payNow * 2;
      }

      const { data } = await api.post("/payments/razorpay/order", {
        amountInRupees: amountToSend,
        receipt: `web_${orderId}`,
        orderId,
        paymentType: paymentOption,
      });

      if (!data.ok) throw new Error(data.error || "Payment init failed");

      await loadRzp();
      const rzp = new window.Razorpay({
        key: data.key, 
        amount: data.order.amount, 
        currency: data.order.currency,
        name: "Kiddos Intellect", 
        description: `Order ${orderId}`,
        order_id: data.order.id,
        prefill: { name: cust.name || "", email: cust.email || "", contact: cust.phone || "" },
        notes: { ourOrderId: orderId },
        handler: async function (response) {
          try {
            const verifyRes = await api.post("/payments/razorpay/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              paymentId: data.paymentId,
            });
            if (verifyRes?.data?.ok && verifyRes?.data?.verified) {
              clear();
              t.success("Payment successful!");
              navigate("/order-confirmed", { state: { orderId } });
            } else { t.err("Payment verification failed"); }
          } catch (e) { t.err("Error verifying payment"); }
        },
        theme: { color: "#1A3C34" },
      });
      rzp.open();
    } catch (e) { t.err(e?.response?.data?.error || e.message || "Payment failed to start"); }
    finally { setPlacing(false); }
  }

  return (
    <div className="bg-[#F4F7F5] min-h-screen font-sans text-[#2C3E38] selection:bg-[#D4E2D4] selection:text-[#1A3C34] pb-20">
      {/* Header */}
      <div className="relative w-full pt-20 md:pt-28 pb-12 px-6 border-b border-[#E3E8E5] bg-[#1A3C34] overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20 mix-blend-soft-light" style={{ backgroundImage: bgImage, backgroundSize: 'cover', filter: 'grayscale(100%)' }} />
        <div className="relative z-10 max-w-7xl 2xl:max-w-[1800px] mx-auto flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-2">Secure Checkout</h1>
            <p className="text-[#8BA699] text-lg font-light">Complete your order details.</p>
          </div>
          <button onClick={() => navigate("/cart")} className="flex items-center gap-2 text-[#8BA699] hover:text-white transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to Cart
          </button>
        </div>
      </div>

      <div className="max-w-7xl 2xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column */}
          <div className="lg:col-span-8 space-y-8">
            {/* Shipping Form */}
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-[#E3E8E5] shadow-sm">
              <div className="flex items-center gap-3 mb-6 border-b border-[#E3E8E5] pb-4">
                <div className="w-10 h-10 rounded-full bg-[#E8F0EB] flex items-center justify-center text-[#1A3C34]"><MapPin className="w-5 h-5" /></div>
                <h2 className="text-xl font-serif font-bold text-[#1A3C34]">Shipping Details</h2>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-[#2C3E38] mb-2">Full Name</label>
                  <input value={cust.name} onChange={(e) => set("name", e.target.value)} className="w-full pl-4 pr-4 py-3 bg-[#FAFBF9] border border-[#DCE4E0] rounded-xl focus:border-[#1A3C34] outline-none transition-all" placeholder="e.g. John Doe" />
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-[#2C3E38] mb-2">Email</label>
                    <input type="email" value={cust.email} onChange={(e) => set("email", e.target.value)} className="w-full pl-4 pr-4 py-3 bg-[#FAFBF9] border border-[#DCE4E0] rounded-xl outline-none" placeholder="john@example.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#2C3E38] mb-2">Phone</label>
                    <input type="tel" maxLength={10} value={cust.phone} onChange={(e) => set("phone", e.target.value)} className="w-full pl-4 pr-4 py-3 bg-[#FAFBF9] border border-[#DCE4E0] rounded-xl outline-none" placeholder="10-digit number" />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-[#2C3E38] mb-2">Address</label>
                    <input value={cust.line1} onChange={(e) => set("line1", e.target.value)} className="w-full px-4 py-3 bg-[#FAFBF9] border border-[#DCE4E0] rounded-xl outline-none" placeholder="House No, Building, Street Area" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#2C3E38] mb-2">PIN Code</label>
                    <div className="relative">
                      <input value={cust.pin} onChange={(e) => onPinChange(e.target.value)} className="w-full px-4 py-3 bg-[#FAFBF9] border border-[#DCE4E0] rounded-xl outline-none" placeholder="6-digit PIN" maxLength={6} />
                      {pinStatus && <span className={`absolute right-4 top-3.5 text-xs font-bold ${pinStatus === "OK" ? "text-green-600" : "text-blue-600"}`}>{pinStatus}</span>}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#2C3E38] mb-2">City</label>
                    <input value={cust.city} className="w-full px-4 py-3 bg-[#E8F0EB] border border-[#DCE4E0] rounded-xl text-[#5C756D]" readOnly />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#2C3E38] mb-2">State</label>
                    <input value={cust.state} className="w-full px-4 py-3 bg-[#E8F0EB] border border-[#DCE4E0] rounded-xl text-[#5C756D]" readOnly />
                  </div>
                </div>
              </div>
            </div>

            {/* Smart Savings Nudge */}
            {savingsNudge && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-full text-green-700"><PartyPopper className="w-5 h-5" /></div>
                  <div>
                    <h4 className="text-green-800 font-bold text-sm">Bulk Offer Available!</h4>
                    <p className="text-green-700 text-xs mt-0.5">Add <strong>{savingsNudge.needed} more</strong> books to save <strong>₹{savingsNudge.nextSave}</strong> on service fees!</p>
                  </div>
                </div>
                <button onClick={() => navigate('/catalog')} className="flex items-center gap-1 bg-white border border-green-200 text-green-700 text-xs font-bold px-3 py-2 rounded-lg hover:bg-green-50 transition-colors shadow-sm">
                  Shop More <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Payment Method */}
            {hasOnlinePay && (
              <div className="bg-white p-6 md:p-8 rounded-2xl border border-[#E3E8E5] shadow-sm">
                <div className="flex items-center gap-3 mb-6 border-b border-[#E3E8E5] pb-4">
                  <div className="w-10 h-10 rounded-full bg-[#E8F0EB] flex items-center justify-center text-[#1A3C34]"><CreditCard className="w-5 h-5" /></div>
                  <h2 className="text-xl font-serif font-bold text-[#1A3C34]">Payment Method</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Full Payment */}
                  <label className={`relative p-5 border-2 rounded-xl cursor-pointer transition-all ${paymentOption === "full_online" ? "border-[#1A3C34] bg-[#F4F7F5] shadow-md scale-[1.01]" : "border-[#E3E8E5] hover:border-[#8BA699] opacity-70 hover:opacity-100"}`}>
                    <div className="flex justify-between items-start mb-3">
                      <div className="bg-[#1A3C34] text-white p-2 rounded-lg"><Zap className="w-5 h-5" /></div>
                      <input type="radio" name="payment" value="full_online" checked={paymentOption === "full_online"} onChange={(e) => setPaymentOption(e.target.value)} className="accent-[#1A3C34] w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-[#1A3C34] text-lg mb-1">Full Payment</h4>
                    <p className="text-xs text-[#5C756D] mb-4">Best value. Instant confirmation.</p>
                    <div className="flex justify-between items-center text-sm bg-white p-2 rounded-lg border border-[#DCE4E0] mb-2">
                      <span>Shipping Fee</span><span className="font-bold text-green-600">FREE</span>
                    </div>
                    <div className="text-xl font-bold text-[#1A3C34] text-right">{fmt(totals.sub)}</div>
                  </label>

                  {/* Half & Half */}
                  <label className={`relative p-5 border-2 rounded-xl cursor-pointer transition-all ${paymentOption === "half_online_half_cod" ? "border-[#2c5282] bg-[#ebf8ff] shadow-md scale-[1.01]" : "border-[#E3E8E5] hover:border-[#8BA699] opacity-70 hover:opacity-100"}`}>
                    <div className="flex justify-between items-start mb-3">
                      <div className="bg-[#2c5282] text-white p-2 rounded-lg"><Truck className="w-5 h-5" /></div>
                      <input type="radio" name="payment" value="half_online_half_cod" checked={paymentOption === "half_online_half_cod"} onChange={(e) => setPaymentOption(e.target.value)} className="accent-[#2c5282] w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-[#2c5282] text-lg mb-1">Half & Half</h4>
                    <p className="text-xs text-[#4a5568] mb-4">Pay 50% now, rest on delivery.</p>
                    <div className="space-y-1 mb-3">
                      <div className="flex justify-between items-center text-sm bg-white px-2 py-1 rounded border border-[#bee3f8]">
                        <span className="text-[#4a5568] text-xs">Shipping</span>
                        <span className="font-bold text-[#2c5282] text-xs">{totals.finalShippingFee > 0 ? `+ ${fmt(totals.finalShippingFee)}` : "-"}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm bg-white px-2 py-1 rounded border border-[#bee3f8]">
                        <span className="text-[#4a5568] text-xs">Service Fee</span>
                        <span className="font-bold text-[#2c5282] text-xs">{totals.finalServiceFee > 0 ? `+ ${fmt(totals.finalServiceFee)}` : "-"}</span>
                      </div>
                    </div>
                    {/* Discount Tag */}
                    {totals.discount > 0 && (
                      <div className="flex items-center gap-1 text-[10px] text-green-700 font-bold bg-green-100 px-2 py-0.5 rounded mb-2 w-fit">
                        <PartyPopper className="w-3 h-3" /> Bulk Discount: -{fmt(totals.discount)}
                      </div>
                    )}
                    <div className="flex justify-between items-end">
                      <div className="text-xs text-right w-full">
                        <span className="block text-gray-500">Pay Now</span>
                        <span className="text-lg font-bold text-[#2c5282]">{fmt(totals.payNow)}</span>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl border border-[#E3E8E5] shadow-sm p-6 lg:p-8 sticky top-24">
              <h2 className="text-xl font-serif font-bold text-[#1A3C34] mb-6">Order Summary</h2>
              <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 scrollbar-thin">
                {items.map((item) => (
                  <div key={item._id || item.id} className="flex gap-3">
                    <div className="w-12 h-16 bg-[#F4F7F5] rounded border border-[#E3E8E5] overflow-hidden flex-shrink-0">
                      <img src={assetUrl(item.bookId?.assets?.coverUrl?.[0] || item.image) || "/placeholder.png"} className="w-full h-full object-cover" />
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
                  <span>Subtotal ({totals.totalQty} items)</span><span>{fmt(totals.sub)}</span>
                </div>
                {paymentOption === "full_online" ? (
                  <div className="flex justify-between text-[#5C756D] text-sm">
                    <span>Shipping</span><span className="font-bold text-[#4A7C59]">Free</span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between text-[#5C756D] text-sm">
                      <span>Shipping</span><span className="font-bold text-[#2c5282]">{fmt(totals.finalShippingFee)}</span>
                    </div>
                    <div className="flex justify-between text-[#5C756D] text-sm">
                      <span>Service Fee</span><span className="font-bold text-[#2c5282]">{fmt(totals.finalServiceFee)}</span>
                    </div>
                    {totals.discount > 0 && (
                      <div className="text-xs text-green-600 flex justify-end items-center gap-1">
                        <PartyPopper className="w-3 h-3" /> Bulk Saving: -{fmt(totals.discount)}
                      </div>
                    )}
                  </>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-[#E3E8E5]">
                  <span className="font-bold text-[#1A3C34] text-lg">Total</span><span className="font-bold text-[#1A3C34] text-xl">{fmt(totals.grand)}</span>
                </div>
                {paymentOption === "half_online_half_cod" && (
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mt-2 space-y-2">
                    <div className="flex justify-between text-sm"><span className="text-blue-800 font-medium">Pay Now (Online)</span><span className="text-blue-800 font-bold">{fmt(totals.payNow)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-600">Pay on Delivery</span><span className="text-gray-600 font-medium">{fmt(totals.payLater)}</span></div>
                  </div>
                )}
              </div>

              {hasOnlinePay ? (
                <button onClick={placeWithRazorpay} disabled={placing} className={`w-full py-4 text-white rounded-xl font-bold transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 ${paymentOption === 'half_online_half_cod' ? 'bg-[#2c5282] hover:bg-[#2a4365]' : 'bg-[#1A3C34] hover:bg-[#2F523F]'}`}>
                  {placing ? "Processing..." : `Pay ${fmt(totals.payNow)}`}
                </button>
              ) : (
                <div className="bg-[#FFF9F0] border border-[#F5E6D3] p-3 rounded-lg text-center text-[#8A6A4B] text-sm font-medium">⚠️ Payments currently disabled</div>
              )}
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[#8BA699]"><ShieldCheck className="w-3 h-3" /><span>Secure SSL Encryption</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}