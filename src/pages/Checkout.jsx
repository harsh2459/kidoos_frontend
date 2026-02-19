import { useMemo, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useCart } from "../contexts/CartStore";
import { assetUrl } from "../api/asset";
import { useSite } from "../contexts/SiteConfig";
import { t } from "../lib/toast";
import { useCustomer } from "../contexts/CustomerAuth";
import {
  MapPin, CreditCard, ArrowLeft, ShieldCheck, Truck, Zap, PartyPopper, Gift,
  ArrowRight, CheckCircle
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

  // --- VRINDAVAN THEME ASSETS ---
  const parchmentBg = "url('/images-webp/homepage/parchment-bg.webp')";
  const mandalaBg = "url('/images-webp/homepage/mandala-bg.webp')";

  const [cust, setCust] = useState({
    name: "", email: "", phone: "",
    line1: "", city: "", state: "", pin: "", country: "India",
  });

  // State for Puzzle Reward
  const [hasPuzzleReward, setHasPuzzleReward] = useState(false);

  useEffect(() => {
    if (customer) {
      setCust(prev => ({
        ...prev,
        name: customer.name || prev.name,
        email: customer.email || prev.email,
        phone: customer.phone || prev.phone,
      }));
    }
    // Check if user won the puzzle
    const reward = localStorage.getItem('puzzle_reward_claimed');
    if (reward === 'true') setHasPuzzleReward(true);
  }, [customer]);

  const set = (k, v) => setCust((p) => ({ ...p, [k]: v }));

  /* ------------ FEE LOGIC ------------ */
  const getBaseZoneFee = (pincode) => {
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

  /* ------------ TOTALS CALCULATION ------------ */
  const totals = useMemo(() => {
    let itemTotal = 0;
    let totalQty = 0;
    let maxPrice = 0;
    let maxPriceItemId = null;

    items.forEach(i => {
      const price = Number(i.unitPriceSnapshot ?? i.price ?? i.bookId?.price ?? 0);
      const qty = Number(i.qty ?? 1);
      itemTotal += price * qty;
      totalQty += qty;

      if (price > maxPrice) {
        maxPrice = price;
        maxPriceItemId = i._id || i.id;
      }
    });

    // Calculate Reward Discount (20% off highest item)
    let rewardDiscount = 0;
    if (hasPuzzleReward && maxPrice > 0) {
      rewardDiscount = Math.round(maxPrice * 0.20);
    }

    // Apply reward to subtotal before adding fees
    const subTotalAfterReward = Math.max(0, itemTotal - rewardDiscount);

    let finalShippingFee = 0;
    let finalServiceFee = 0;
    let baseTotalFee = 0;
    let discount = 0;

    if (paymentOption === "half_online_half_cod") {
      baseTotalFee = getBaseZoneFee(cust.pin);
      if (baseTotalFee > 0) {
        discount = getBulkDiscount(totalQty);
        let totalFeeAfterDiscount = Math.max(0, baseTotalFee - discount);
        finalServiceFee = Math.min(30, totalFeeAfterDiscount);
        finalShippingFee = Math.max(0, totalFeeAfterDiscount - finalServiceFee);
      }
    }

    const grand = subTotalAfterReward + finalShippingFee + finalServiceFee;
    let payNow = 0;
    let payLater = 0;

    if (paymentOption === "half_online_half_cod") {
      payLater = subTotalAfterReward / 2;
      payNow = (subTotalAfterReward / 2) + finalShippingFee + finalServiceFee;
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
      payLater,
      rewardDiscount,
      maxPriceItemId
    };
  }, [items, paymentOption, cust.pin, hasPuzzleReward]);

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
    if (!cust.name || !cust.phone || !cust.email || !cust.line1 || !cust.city || !cust.state || !cust.pin) {
      t.info("Please fill all shipping details."); return false;
    }
    if (!/^[a-zA-Z\s]{2,}$/.test(cust.name)) {
      t.info("Please enter a valid full name.");
      return false;
    }

    if (!/^\d{10}$/.test(cust.phone)) {
      t.info("Please enter a valid 10-digit phone number.");
      return false;
    }

    if (cust.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cust.email)) {
      t.info("Please enter a valid email address.");
      return false;
    }
    if (pinStatus && pinStatus !== "OK") {
      t.info("Please enter a valid PIN Code.");
      return false;
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

      let finalPrice = item.unitPriceSnapshot || item.price;
      if (hasPuzzleReward && (item._id === totals.maxPriceItemId || item.id === totals.maxPriceItemId)) {
        finalPrice = Math.round(finalPrice * 0.8); // 20% Off
      }

      return {
        bookId,
        title: item.title,
        price: finalPrice,
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
      shippingFee: totals.finalShippingFee,
      serviceFee: totals.finalServiceFee,
      payment: { method: paymentMethod, status: paymentStatus, dueOnDeliveryAmount: totals.payLater },
    };

    const { data } = await api.post("/orders", payload);
    if (!data?.ok) throw new Error(data?.error || "Failed to create order");
    return data.orderId || data._id;
  }
  async function placeWithRazorpay() {
    if (placing) return;
    if (!validateShipping()) return;
    setPlacing(true);
    try {
      const orderId = await createLocalOrder("razorpay", "created");

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
              // ✅ Fire Meta Purchase Event - Payment Verified Successfully
              if (window.fbq) {
                window.fbq('track', 'Purchase', {
                  value: totals.payNow,  // Amount actually paid in this transaction
                  currency: 'INR',
                  content_ids: items.map(i => getBookIdFromCartItem(i)),
                  content_type: 'product',
                  num_items: totals.totalQty,
                  // Additional tracking data
                  content_name: `Order ${orderId}`,
                  payment_method: paymentOption
                });
                console.log("✅ Meta Pixel 'Purchase' event fired:", {
                  value: totals.payNow,
                  orderId,
                  items: items.length
                });
              } else {
                console.warn("⚠️ Meta Pixel (window.fbq) not found! Ensure base pixel is installed in index.html");
              }
              
              clear();
              localStorage.removeItem('puzzle_reward_claimed');
              t.success("Payment successful!");
              navigate("/order-confirmed", { state: { orderId } });
            } else { 
              console.error("❌ Payment verification failed");
              t.err("Payment verification failed"); 
            }
          } catch (e) { t.err("Error verifying payment"); }
        },
        theme: { color: "#3E2723" },
      });
      rzp.open();
    } catch (e) { t.err(e?.response?.data?.error || e.message || "Payment failed to start"); }
    finally { setPlacing(false); }
  }

  // --- STYLES ---
  const inputStyle = "w-full pl-4 pr-4 py-3.5 bg-white border border-[#D4AF37]/30 rounded-xl text-[#3E2723] focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/50 outline-none transition-all placeholder-[#8A7A5E]/50 font-medium shadow-sm";
  const labelStyle = "block text-xs font-bold text-[#8A7A5E] uppercase tracking-wider mb-2 ml-1";

  return (
    <div className="bg-[#FAF7F2] min-h-screen font-['Lato'] text-[#5C4A2E] selection:bg-[#F3E5AB] selection:text-[#3E2723] pb-20">

      {/* Global Texture */}
      <div
        className="fixed inset-0 pointer-events-none opacity-100 z-0"
        style={{ backgroundImage: parchmentBg, backgroundSize: 'cover', backgroundAttachment: 'fixed' }}
      />

      {/* --- HEADER --- */}
      <div className="relative w-full pt-28 md:pt-36 pb-16 px-6 border-b border-[#D4AF37]/30 bg-[#3E2723] overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-10 mix-blend-overlay" style={{ backgroundImage: mandalaBg, backgroundSize: '400px' }} />
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#3E2723] to-transparent z-0"></div>

        <div className="relative z-10 max-w-7xl 2xl:max-w-[1800px] mx-auto flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <h1 className="text-4xl md:text-6xl font-['Playfair_Display'] font-bold text-[#F3E5AB] mb-2 tracking-tight">Secure Checkout</h1>
            <p className="text-[#D4AF37] text-lg font-light tracking-wide">Complete your sacred acquisition.</p>
          </div>
          <button onClick={() => navigate("/cart")} className="flex items-center gap-2 text-[#D4AF37] hover:text-[#F3E5AB] transition-colors text-sm font-bold font-['Cinzel'] tracking-wide">
            <ArrowLeft className="w-4 h-4" /> Back to Cart
          </button>
        </div>
      </div>

      <div className="relative z-20 max-w-7xl 2xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 -mt-8">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-16">

          {/* --- LEFT: FORMS --- */}
          <div className="lg:col-span-8 space-y-10">

            {/* Shipping Form */}
            <div className="bg-white/90 backdrop-blur-sm p-8 md:p-10 rounded-[2rem] border border-[#D4AF37]/20 shadow-[0_5px_20px_rgba(62,39,35,0.05)]">
              <div className="flex items-center gap-4 mb-8 border-b border-[#D4AF37]/10 pb-6">
                <div className="w-12 h-12 rounded-full bg-[#FFF9E6] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shadow-inner"><MapPin className="w-6 h-6" /></div>
                <h2 className="text-2xl font-['Cinzel'] font-bold text-[#3E2723]">Shipping Details</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className={labelStyle}>Full Name</label>
                  <input value={cust.name} onChange={(e) => set("name", e.target.value)} className={inputStyle} placeholder="e.g. Arjun Kumar" />
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelStyle}>Email</label>
                    <input type="email" value={cust.email} onChange={(e) => set("email", e.target.value)} className={inputStyle} placeholder="arjun@example.com" />
                  </div>
                  <div>
                    <label className={labelStyle}>Phone</label>
                    <input
                      type="tel"
                      value={cust.phone}
                      onChange={(e) => {
                        const onlyDigits = e.target.value.replace(/\D/g, "").slice(0, 10);
                        set("phone", onlyDigits);
                      }}
                      className={inputStyle}
                      placeholder="10-digit number"
                      maxLength={10}
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className={labelStyle}>Address</label>
                    <input value={cust.line1} onChange={(e) => set("line1", e.target.value)} className={inputStyle} placeholder="House No, Building, Street Area" />
                  </div>
                  <div>
                    <label className={labelStyle}>PIN Code</label>
                    <div className="relative">
                      <input value={cust.pin} onChange={(e) => onPinChange(e.target.value)} className={inputStyle} placeholder="6-digit PIN" maxLength={6} />
                      {pinStatus && <span className={`absolute right-4 top-4 text-xs font-bold ${pinStatus === "OK" ? "text-green-600" : "text-[#B0894C]"}`}>{pinStatus}</span>}
                    </div>
                  </div>
                  <div>
                    <label className={labelStyle}>City</label>
                    <input value={cust.city} className={`${inputStyle} bg-[#FAF7F2] text-[#8A7A5E] cursor-not-allowed`} readOnly />
                  </div>
                  <div>
                    <label className={labelStyle}>State</label>
                    <input value={cust.state} className={`${inputStyle} bg-[#FAF7F2] text-[#8A7A5E] cursor-not-allowed`} readOnly />
                  </div>
                </div>
              </div>
            </div>

            {/* Smart Savings Nudge (Gold/Parchment Style) */}
            {savingsNudge && (
              <div className="bg-gradient-to-r from-[#FFF9E6] to-[#FFF5E0] border border-[#D4AF37]/40 rounded-2xl p-6 flex items-center justify-between shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 opacity-10 pointer-events-none"><PartyPopper className="w-24 h-24 text-[#D4AF37]" /></div>
                <div className="flex items-center gap-4 relative z-10">
                  <div className="bg-[#D4AF37]/20 p-3 rounded-full text-[#B0894C]"><Gift className="w-6 h-6" /></div>
                  <div>
                    <h4 className="text-[#3E2723] font-['Cinzel'] font-bold text-lg">Bulk Blessing Available!</h4>
                    <p className="text-[#8A7A5E] text-sm mt-1">Add <strong>{savingsNudge.needed} more</strong> books to save <strong>₹{savingsNudge.nextSave}</strong> on fees!</p>
                  </div>
                </div>
                <button onClick={() => navigate('/catalog')} className="relative z-10 flex items-center gap-2 bg-white border border-[#D4AF37] text-[#3E2723] text-xs font-bold px-5 py-3 rounded-full hover:bg-[#D4AF37] hover:text-white transition-all shadow-sm font-['Cinzel'] tracking-wide">
                  Shop More <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Payment Method */}
            {hasOnlinePay && (
              <div className="bg-white/90 backdrop-blur-sm p-8 md:p-10 rounded-[2rem] border border-[#D4AF37]/20 shadow-[0_5px_20px_rgba(62,39,35,0.05)]">
                <div className="flex items-center gap-4 mb-8 border-b border-[#D4AF37]/10 pb-6">
                  <div className="w-12 h-12 rounded-full bg-[#FFF9E6] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shadow-inner"><CreditCard className="w-6 h-6" /></div>
                  <h2 className="text-2xl font-['Cinzel'] font-bold text-[#3E2723]">Payment Method</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Full Payment (Gold Standard) */}
                  <label className={`relative p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 group ${paymentOption === "full_online" ? "border-[#D4AF37] bg-[#FFF9E6]/50 shadow-md scale-[1.01]" : "border-[#E3E8E5] hover:border-[#D4AF37]/50"}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-3 rounded-xl transition-colors ${paymentOption === "full_online" ? "bg-[#D4AF37] text-white" : "bg-[#FAF7F2] text-[#8A7A5E]"}`}><Zap className="w-5 h-5" /></div>
                      <input type="radio" name="payment" value="full_online" checked={paymentOption === "full_online"} onChange={(e) => setPaymentOption(e.target.value)} className="accent-[#D4AF37] w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-[#3E2723] font-['Cinzel'] text-lg mb-1">Full Payment</h4>
                    <p className="text-xs text-[#8A7A5E] font-medium uppercase tracking-wide mb-6">Best Value. Instant Confirmation.</p>
                    <div className="flex justify-between items-center text-sm bg-white/60 p-3 rounded-lg border border-[#D4AF37]/20 mb-3">
                      <span className="font-bold text-[#3E2723]">Shipping Fee</span><span className="font-bold text-[#D4AF37] flex items-center gap-1"><CheckCircle className="w-3 h-3" /> FREE</span>
                    </div>
                    <div className="text-2xl font-bold text-[#3E2723] text-right font-['Playfair_Display']">{fmt(totals.sub)}</div>
                  </label>

                  {/* Half & Half (Bronze/Wood Option) */}
                  <label className={`relative p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 group ${paymentOption === "half_online_half_cod" ? "border-[#3E2723] bg-[#FAF7F2] shadow-md scale-[1.01]" : "border-[#E3E8E5] hover:border-[#3E2723]/50"}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-3 rounded-xl transition-colors ${paymentOption === "half_online_half_cod" ? "bg-[#3E2723] text-[#F3E5AB]" : "bg-[#FAF7F2] text-[#8A7A5E]"}`}><Truck className="w-5 h-5" /></div>
                      <input type="radio" name="payment" value="half_online_half_cod" checked={paymentOption === "half_online_half_cod"} onChange={(e) => setPaymentOption(e.target.value)} className="accent-[#3E2723] w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-[#3E2723] font-['Cinzel'] text-lg mb-1">Half & Half</h4>
                    <p className="text-xs text-[#8A7A5E] font-medium uppercase tracking-wide mb-6">Pay 50% Now, Rest on Delivery.</p>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between items-center text-sm bg-white/60 px-3 py-2 rounded-lg border border-[#3E2723]/10">
                        <span className="text-[#5C4A2E] text-xs">Shipping</span>
                        <span className="font-bold text-[#3E2723] text-xs">{totals.finalShippingFee > 0 ? `+ ${fmt(totals.finalShippingFee)}` : "-"}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm bg-white/60 px-3 py-2 rounded-lg border border-[#3E2723]/10">
                        <span className="text-[#5C4A2E] text-xs">Service Fee</span>
                        <span className="font-bold text-[#3E2723] text-xs">{totals.finalServiceFee > 0 ? `+ ${fmt(totals.finalServiceFee)}` : "-"}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-end border-t border-[#3E2723]/10 pt-3">
                      <span className="text-xs font-bold uppercase tracking-wide text-[#8A7A5E]">Pay Now</span>
                      <span className="text-xl font-bold text-[#3E2723] font-['Playfair_Display']">{fmt(totals.payNow)}</span>
                    </div>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Order Ledger */}
          <div className="lg:col-span-4">
            <div className="bg-white/90 backdrop-blur-md rounded-[2rem] border border-[#D4AF37]/30 shadow-[0_10px_40px_rgba(62,39,35,0.08)] p-8 sticky top-28 overflow-hidden">

              {/* Gold Top Bar */}
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#C59D5F] to-[#B0894C]"></div>

              <h2 className="text-2xl font-['Cinzel'] font-bold text-[#3E2723] mb-8">Order Summary</h2>

              {/* Reward Banner */}
              {hasPuzzleReward && (
                <div className="mb-8 bg-gradient-to-r from-[#FFF9E6] to-[#FFF5E0] border border-[#D4AF37] rounded-xl p-4 flex items-center gap-4 shadow-sm animate-in fade-in">
                  <div className="bg-[#D4AF37] p-2 rounded-full text-white shadow-sm"><Gift className="w-5 h-5" /></div>
                  <div>
                    <h4 className="text-[#3E2723] font-bold text-sm font-['Cinzel']">Puzzle Winner Reward!</h4>
                    <p className="text-[#8A7A5E] text-xs">20% off applied to highest item.</p>
                  </div>
                </div>
              )}

              <div className="space-y-5 mb-8 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {items.map((item) => (
                  <div key={item._id || item.id} className="flex gap-4">
                    <div className="w-14 h-20 bg-[#FAF7F2] rounded-lg border border-[#D4AF37]/20 overflow-hidden flex-shrink-0 shadow-inner">
                      <img src={assetUrl(item.bookId?.assets?.coverUrl?.[0] || item.image) || "/placeholder.png"} className="w-full h-full object-contain p-1" />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <p className="font-bold text-[#3E2723] text-sm font-['Cinzel'] truncate leading-tight mb-1">{item.title}</p>
                      <p className="text-[10px] text-[#8A7A5E] font-bold uppercase tracking-wider">Qty: {item.qty}</p>
                    </div>
                    <div className="text-right flex flex-col justify-center">
                      <p className="font-bold text-[#3E2723] text-sm font-['Playfair_Display']">{fmt(item.unitPriceSnapshot || item.price)}</p>
                      {/* Discount Tag */}
                      {hasPuzzleReward && (item._id === totals.maxPriceItemId || item.id === totals.maxPriceItemId) && (
                        <span className="text-[9px] text-white font-bold bg-[#B0894C] px-1.5 py-0.5 rounded block mt-1">-20% Off</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#D4AF37]/20 pt-6 space-y-4 mb-8">
                <div className="flex justify-between text-[#5C4A2E] text-sm font-medium">
                  <span>Subtotal ({totals.totalQty} items)</span><span className="font-bold text-[#3E2723]">{fmt(totals.sub)}</span>
                </div>

                {hasPuzzleReward && totals.rewardDiscount > 0 && (
                  <div className="flex justify-between text-sm text-[#B0894C] font-bold">
                    <span>Puzzle Reward</span><span>-{fmt(totals.rewardDiscount)}</span>
                  </div>
                )}

                {paymentOption === "full_online" ? (
                  <div className="flex justify-between text-[#5C4A2E] text-sm">
                    <span>Shipping</span><span className="font-bold text-[#D4AF37]">FREE</span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between text-[#5C4A2E] text-sm">
                      <span>Shipping</span><span className="font-bold text-[#3E2723]">{fmt(totals.finalShippingFee)}</span>
                    </div>
                    <div className="flex justify-between text-[#5C4A2E] text-sm">
                      <span>Service Fee</span><span className="font-bold text-[#3E2723]">{fmt(totals.finalServiceFee)}</span>
                    </div>
                    {totals.discount > 0 && (
                      <div className="text-xs text-[#D4AF37] font-bold flex justify-end items-center gap-1">
                        <PartyPopper className="w-3 h-3" /> Bulk Saving: -{fmt(totals.discount)}
                      </div>
                    )}
                  </>
                )}

                <div className="flex justify-between items-center pt-4 border-t border-[#D4AF37]/20">
                  <span className="font-bold text-[#3E2723] text-lg font-['Cinzel']">Total</span>
                  <span className="font-bold text-[#3E2723] text-2xl font-['Playfair_Display']">{fmt(totals.grand)}</span>
                </div>

                {paymentOption === "half_online_half_cod" && (
                  <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#3E2723]/10 mt-2 space-y-2">
                    <div className="flex justify-between text-sm"><span className="text-[#3E2723] font-bold uppercase text-xs tracking-wider">Pay Now (Online)</span><span className="text-[#3E2723] font-bold">{fmt(totals.payNow)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-[#8A7A5E] text-xs uppercase tracking-wider">Pay on Delivery</span><span className="text-[#8A7A5E] font-bold">{fmt(totals.payLater)}</span></div>
                  </div>
                )}
              </div>

              {hasOnlinePay ? (
                <button
                  onClick={placeWithRazorpay}
                  disabled={placing}
                  className={`
                        w-full py-4.5 text-white rounded-full font-bold font-['Cinzel'] tracking-widest uppercase transition-all shadow-[0_10px_25px_rgba(0,0,0,0.1)] active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70 group border border-white/20
                        ${paymentOption === 'half_online_half_cod'
                      ? 'bg-[#3E2723] hover:bg-[#2C1810]'
                      : 'bg-gradient-to-r from-[#C59D5F] to-[#B0894C] hover:from-[#D4AF37] hover:to-[#C59D5F]'}
                    `}
                >
                  {placing ? "Processing..." : `Pay ${fmt(totals.payNow)}`}
                  {!placing && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                </button>
              ) : (
                <div className="bg-[#FFF9F0] border border-[#F5E6D3] p-4 rounded-xl text-center text-[#8A6A4B] text-sm font-bold">⚠️ Payments currently disabled</div>
              )}

              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[#8A7A5E] font-medium opacity-80">
                <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                <span>Secure SSL Encryption</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}