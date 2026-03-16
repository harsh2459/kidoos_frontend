import { useMemo, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useCart } from "../contexts/CartStore";
import { assetUrl } from "../api/asset";
import { useSite } from "../contexts/SiteConfig";
import { t } from "../lib/toast";
import { useCustomer } from "../contexts/CustomerAuth";
import {
  MapPin, CreditCard, ArrowLeft, ShieldCheck, Truck, Zap, Gift,
  ArrowRight, CheckCircle, Tag, X, ChevronRight, Sparkles, BookOpen, Star
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
  const addToCart = useCart((s) => s.add);
  const setQty = useCart((s) => s.setQty);
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

  // Coupon state
  const [couponInput, setCouponInput] = useState("");
  const [couponApplied, setCouponApplied] = useState(null); // { code, discount, discountType, discountValue, couponId }
  const [couponLoading, setCouponLoading] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [offersOpen, setOffersOpen] = useState(false);
  const [offersFilter, setOffersFilter] = useState("all");

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

  /* ------------ SHIPPING RULES ------------ */
  const [shippingRules, setShippingRules] = useState([]);

  useEffect(() => {
    api.get("/shipping-rules").then(res => {
      if (res.data?.ok) setShippingRules(res.data.rules);
    }).catch(() => {});
    api.get("/coupons/public").then(res => {
      if (res.data?.ok) setAvailableCoupons(res.data.coupons || []);
    }).catch(() => {});
  }, []);

  function getShippingFee(subtotal, paymentType) {
    if (!shippingRules.length) return 0;
    const sorted = [...shippingRules].sort((a, b) => a.orderValue - b.orderValue);
    let matched = null;
    for (const rule of sorted) {
      if (subtotal >= rule.orderValue) matched = rule;
    }
    if (!matched) return 0;
    const isOnline = paymentType === "full_online";
    if (isOnline && matched.onlineCharge !== null && matched.onlineCharge !== undefined) {
      return matched.onlineCharge;
    }
    return matched.charge;
  }

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

    const subTotalAfterReward = Math.max(0, itemTotal - rewardDiscount);
    const couponDiscount = couponApplied?.discount || 0;
    const subTotalAfterCoupon = Math.max(0, subTotalAfterReward - couponDiscount);
    const finalShippingFee = getShippingFee(subTotalAfterCoupon, paymentOption);
    const grand = subTotalAfterCoupon + finalShippingFee;

    // Fixed per-option totals (independent of selection — used to display each card correctly)
    const fullOnlineShipping = getShippingFee(subTotalAfterCoupon, "full_online");
    const fullOnlineTotal = subTotalAfterCoupon + fullOnlineShipping;
    const halfShipping = getShippingFee(subTotalAfterCoupon, "half_online_half_cod");
    const halfNow = Math.round(subTotalAfterCoupon / 2) + halfShipping;
    const halfLater = subTotalAfterCoupon - Math.round(subTotalAfterCoupon / 2);

    let payNow = 0;
    let payLater = 0;

    if (paymentOption === "half_online_half_cod") {
      payNow = halfNow;
      payLater = halfLater;
    } else {
      payNow = grand;
      payLater = 0;
    }

    return {
      sub: itemTotal,
      totalQty,
      finalShippingFee,
      finalServiceFee: 0,
      grand,
      payNow,
      payLater,
      rewardDiscount,
      couponDiscount,
      maxPriceItemId,
      fullOnlineShipping,
      fullOnlineTotal,
      halfShipping,
      halfNow,
      halfLater,
    };
  }, [items, paymentOption, hasPuzzleReward, shippingRules, couponApplied]);


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

  /* ------------ CART-COUPON SYNC ------------ */
  // Auto-remove or update coupon when cart items change
  useEffect(() => {
    if (!couponApplied) return;

    const currentSubtotal = Math.max(0, totals.sub - totals.rewardDiscount);

    // Check min order value
    if ((couponApplied.minOrderValue || 0) > 0 && currentSubtotal < couponApplied.minOrderValue) {
      setCouponApplied(null);
      setCouponInput("");
      t.info("Coupon removed — order total dropped below the minimum");
      return;
    }

    // Check required book still in cart
    if (couponApplied.requiredBookId) {
      const currentCartItems = items.map(i => ({ bookId: getBookIdFromCartItem(i), qty: i.qty }));
      const matchingItem = currentCartItems.find(i => String(i.bookId) === String(couponApplied.requiredBookId));
      const itemQty = matchingItem?.qty || 0;
      const neededQty = (couponApplied.minQty || 0) > 0 ? couponApplied.minQty : 1;
      if (itemQty < neededQty) {
        setCouponApplied(null);
        setCouponInput("");
        t.info("Coupon removed — required book is no longer in your cart");
        return;
      }
    } else if ((couponApplied.minQty || 0) > 0 && totals.totalQty < couponApplied.minQty) {
      setCouponApplied(null);
      setCouponInput("");
      t.info(`Coupon removed — minimum ${couponApplied.minQty} books required`);
      return;
    }

    // For % coupons, recalculate discount as subtotal changes
    if (couponApplied.discountType === "percent") {
      let base = currentSubtotal;
      if (couponApplied.requiredBookId) {
        // Discount only applies to the required book's subtotal
        const bookItem = items.find(i => String(getBookIdFromCartItem(i)) === String(couponApplied.requiredBookId));
        base = bookItem ? (bookItem.unitPriceSnapshot || bookItem.price || 0) * (bookItem.qty || 0) : 0;
      }
      const newDiscount = Math.round(base * couponApplied.discountValue / 100);
      if (newDiscount !== couponApplied.discount) {
        setCouponApplied(prev => ({ ...prev, discount: newDiscount }));
      }
    }
  }, [items]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ------------ COUPON ------------ */
  async function applyCoupon() {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    try {
      const res = await api.post("/coupons/validate", {
        code: couponInput.trim().toUpperCase(),
        orderTotal: Math.max(0, totals.sub - totals.rewardDiscount),
        totalQty: totals.totalQty,
        cartItems: items.map(i => ({ bookId: getBookIdFromCartItem(i), qty: i.qty })),
        ...(isCustomer && customer?.id && { customerId: customer.id }),
      });
      if (res.data?.ok) {
        setCouponApplied(res.data);
        t.success(`Coupon applied! You save ${res.data.discountType === "percent" ? res.data.discountValue + "%" : "₹" + res.data.discount}`);
      }
    } catch (e) {
      t.err(e?.response?.data?.error || "Invalid coupon code");
    } finally {
      setCouponLoading(false);
    }
  }

  function removeCoupon() {
    setCouponApplied(null);
    setCouponInput("");
  }

  async function applyCouponFromCard(coupon) {
    if (couponApplied) return;
    let updatedItems = [...items];

    // If coupon requires a specific book, add it at the required qty
    if (coupon.requiredBookId) {
      const book = coupon.requiredBookId;
      const neededQty = (coupon.minQty || 0) > 0 ? coupon.minQty : 1;
      const existingItem = items.find(i => String(getBookIdFromCartItem(i)) === String(book._id));
      const currentQty = existingItem?.qty || 0;

      if (currentQty < neededQty) {
        if (existingItem) {
          setQty(String(book._id), neededQty);
          updatedItems = items.map(i =>
            String(getBookIdFromCartItem(i)) === String(book._id) ? { ...i, qty: neededQty } : i
          );
        } else {
          const bookForCart = { _id: book._id, title: book.title, price: book.price, assets: book.assets, inventory: book.inventory };
          addToCart(bookForCart, neededQty);
          updatedItems = [...items, { ...bookForCart, qty: neededQty }];
        }
        t.success(`Added "${book.title}" × ${neededQty} to cart`);
      }
    }

    // Validate and apply coupon using the updated items list
    setCouponLoading(true);
    try {
      const itemTotal = updatedItems.reduce((sum, i) => sum + Number(i.unitPriceSnapshot ?? i.price ?? 0) * (i.qty || 1), 0);
      const totalQty = updatedItems.reduce((sum, i) => sum + (i.qty || 1), 0);
      const cartItems = updatedItems.map(i => ({ bookId: getBookIdFromCartItem(i), qty: i.qty || 1 }));

      const res = await api.post("/coupons/validate", {
        code: coupon.code,
        orderTotal: Math.max(0, itemTotal - totals.rewardDiscount),
        totalQty,
        cartItems,
        ...(isCustomer && customer?.id && { customerId: customer.id }),
      });
      if (res.data?.ok) {
        setCouponApplied(res.data);
        setCouponInput(coupon.code);
        t.success(`Coupon ${coupon.code} applied! You save ₹${res.data.discount}`);
      }
    } catch (e) {
      t.err(e?.response?.data?.error || "Could not apply coupon");
    } finally {
      setCouponLoading(false);
    }
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

      return {
        bookId,
        title: item.title,
        // Always send original price — server recalculates everything
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
      shippingFee: totals.finalShippingFee,
      serviceFee: totals.finalServiceFee,
      applyPuzzleReward: hasPuzzleReward,
      couponCode: couponApplied?.code || "",
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

              if (window.gtag) {
                window.gtag('event', 'purchase', {
                  transaction_id: orderId,       // Uses the local order ID
                  value: totals.payNow,          // Total amount paid now
                  currency: 'INR',
                  items: items.map(item => ({
                    item_id: getBookIdFromCartItem(item),
                    item_name: item.title,
                    price: item.unitPriceSnapshot || item.price,
                    quantity: item.qty
                  }))
                });
                console.log("✅ GA4 'purchase' event fired for Order:", orderId);
              }

              clear();
              localStorage.removeItem('puzzle_reward_claimed');
              setCouponApplied(null);
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
    <>
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


            {/* Coupon Code */}
            <div className="bg-white/90 backdrop-blur-sm p-8 md:p-10 rounded-[2rem] border border-[#D4AF37]/20 shadow-[0_5px_20px_rgba(62,39,35,0.05)]">
              <div className="flex items-center gap-4 mb-6 border-b border-[#D4AF37]/10 pb-6">
                <div className="w-12 h-12 rounded-full bg-[#FFF9E6] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shadow-inner"><Tag className="w-6 h-6" /></div>
                <h2 className="text-2xl font-['Cinzel'] font-bold text-[#3E2723]">Coupon Code</h2>
              </div>

              {couponApplied ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <div>
                      <span className="font-mono font-bold text-green-700 tracking-widest text-sm">{couponApplied.code}</span>
                      <p className="text-xs text-green-600 mt-0.5">
                        {couponApplied.discountType === "percent"
                          ? `${couponApplied.discountValue}% off`
                          : `₹${couponApplied.discountValue} off`} applied — you save ₹{couponApplied.discount}
                      </p>
                    </div>
                  </div>
                  <button onClick={removeCoupon} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <input
                    value={couponInput}
                    onChange={e => setCouponInput(e.target.value.toUpperCase())}
                    onKeyDown={e => e.key === "Enter" && applyCoupon()}
                    className="flex-1 pl-4 pr-4 py-3 bg-white border border-[#D4AF37]/30 rounded-xl text-[#3E2723] focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/50 outline-none uppercase font-mono tracking-widest placeholder-[#8A7A5E]/50"
                    placeholder="ENTER CODE"
                    maxLength={30}
                  />
                  <button
                    onClick={applyCoupon}
                    disabled={couponLoading || !couponInput.trim()}
                    className="px-6 py-3 bg-[#3E2723] text-[#F3E5AB] rounded-xl font-bold font-['Cinzel'] text-sm hover:bg-[#2C1810] transition-colors disabled:opacity-50"
                  >
                    {couponLoading ? "…" : "Apply"}
                  </button>
                </div>
              )}

              {/* View Available Offers button */}
              {!couponApplied && availableCoupons.length > 0 && (
                <button
                  onClick={() => setOffersOpen(true)}
                  className="mt-4 w-full flex items-center justify-between px-4 py-3 bg-[#FFFBF0] border border-[#D4AF37]/30 rounded-xl hover:border-[#D4AF37]/70 hover:bg-[#FFF9E6] transition-all group"
                >
                  <div className="flex items-center gap-2.5 text-[#3E2723]">
                    <Gift className="w-4 h-4 text-[#D4AF37]" />
                    <span className="text-sm font-bold font-['Cinzel']">View Available Offers</span>
                    <span className="text-xs bg-[#D4AF37] text-white font-bold px-2 py-0.5 rounded-full">{availableCoupons.length}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#D4AF37] group-hover:translate-x-0.5 transition-transform" />
                </button>
              )}
            </div>

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
                      <span className="font-bold text-[#3E2723]">Delivery Charge</span>
                      {totals.fullOnlineShipping === 0
                        ? <span className="font-bold text-[#D4AF37] flex items-center gap-1"><CheckCircle className="w-3 h-3" /> FREE</span>
                        : <span className="font-bold text-[#3E2723]">{fmt(totals.fullOnlineShipping)}</span>
                      }
                    </div>
                    <div className="text-2xl font-bold text-[#3E2723] text-right font-['Playfair_Display']">{fmt(totals.fullOnlineTotal)}</div>
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
                        <span className="text-[#5C4A2E] text-xs">Delivery Charge</span>
                        <span className="font-bold text-[#3E2723] text-xs">{totals.halfShipping > 0 ? `+ ${fmt(totals.halfShipping)}` : "Free"}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-end border-t border-[#3E2723]/10 pt-3">
                      <span className="text-xs font-bold uppercase tracking-wide text-[#8A7A5E]">Pay Now</span>
                      <span className="text-xl font-bold text-[#3E2723] font-['Playfair_Display']">{fmt(totals.halfNow)}</span>
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

                {couponApplied && totals.couponDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-700 font-bold">
                    <span className="flex items-center gap-1.5"><Tag className="w-3 h-3" />{couponApplied.code}</span>
                    <span>-{fmt(totals.couponDiscount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-[#5C4A2E] text-sm">
                  <span>Delivery Charge</span>
                  {totals.finalShippingFee === 0
                    ? <span className="font-bold text-[#D4AF37]">FREE</span>
                    : <span className="font-bold text-[#3E2723]">{fmt(totals.finalShippingFee)}</span>
                  }
                </div>

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

    {/* ── Available Offers Modal ── */}
    {offersOpen && (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={() => setOffersOpen(false)}>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        <div
          className="relative bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[90vh]"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#D4AF37]/15">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FFF9E6] border border-[#D4AF37]/30 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#D4AF37]" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-['Cinzel'] text-[#3E2723]">Available Offers</h3>
                <p className="text-xs text-[#8A7A5E]">{availableCoupons.length} coupon{availableCoupons.length !== 1 ? "s" : ""} available</p>
              </div>
            </div>
            <button onClick={() => setOffersOpen(false)} className="p-2 rounded-xl text-[#8A7A5E] hover:bg-[#FFF9E6] hover:text-[#3E2723] transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Category Filter Tabs */}
          <div className="px-6 pt-4 pb-2 flex gap-2 overflow-x-auto scrollbar-none">
            {[
              { id: "all", label: "All", icon: <Tag className="w-3 h-3" /> },
              { id: "general", label: "General", icon: <Gift className="w-3 h-3" /> },
              { id: "book", label: "Book Specific", icon: <BookOpen className="w-3 h-3" /> },
              { id: "firstorder", label: "First Order", icon: <Star className="w-3 h-3" /> },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setOffersFilter(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                  offersFilter === tab.id
                    ? "bg-[#3E2723] text-[#F3E5AB] border-[#3E2723]"
                    : "bg-white text-[#5C4A2E] border-[#D4AF37]/30 hover:border-[#D4AF37]"
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Coupon List */}
          <div className="flex-1 overflow-y-auto px-6 py-3 space-y-3">
            {availableCoupons
              .filter(c => {
                if (offersFilter === "book") return !!c.requiredBookId;
                if (offersFilter === "firstorder") return c.isFirstOrderOnly;
                if (offersFilter === "general") return !c.requiredBookId && !c.isFirstOrderOnly;
                return true;
              })
              .map(coupon => {
                const book = coupon.requiredBookId;
                const cover = book?.assets?.coverUrl?.[0];
                const neededQty = (coupon.minQty || 0) > 0 ? coupon.minQty : (book ? 1 : 0);
                const discountLabel = coupon.discountType === "percent" ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`;
                const shortTitle = book?.title ? (book.title.length > 25 ? book.title.slice(0, 25) + "…" : book.title) : null;
                const inCartQty = book ? (items.find(i => String(getBookIdFromCartItem(i)) === String(book._id))?.qty || 0) : 0;
                const needsAdd = book && inCartQty < (neededQty || 1);

                // Category label
                const categoryLabel = book ? "Book Specific" : coupon.isFirstOrderOnly ? "First Order" : "General";
                const categoryColor = book ? "bg-blue-50 text-blue-700 border-blue-200" : coupon.isFirstOrderOnly ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-amber-50 text-amber-700 border-amber-200";

                return (
                  <div key={coupon._id} className="border border-[#D4AF37]/20 rounded-2xl overflow-hidden bg-[#FFFDF7] hover:border-[#D4AF37]/50 transition-all">
                    {/* Top stripe */}
                    <div className="flex items-center gap-3 p-4">
                      {/* Thumbnail */}
                      {book ? (
                        <div className="w-14 h-18 flex-shrink-0 rounded-xl overflow-hidden border border-[#D4AF37]/20 bg-[#FAF7F2] shadow-sm" style={{height: '72px'}}>
                          {cover
                            ? <img src={assetUrl(cover)} alt={shortTitle} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center text-[#D4AF37]"><BookOpen className="w-5 h-5" /></div>
                          }
                        </div>
                      ) : (
                        <div className="w-14 h-14 flex-shrink-0 rounded-xl bg-[#FFF9E6] border border-[#D4AF37]/20 flex items-center justify-center">
                          {coupon.isFirstOrderOnly ? <Star className="w-6 h-6 text-purple-500" /> : <Gift className="w-6 h-6 text-[#D4AF37]" />}
                        </div>
                      )}

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-mono font-bold text-[#3E2723] tracking-widest bg-[#FFF3CD] px-2 py-0.5 rounded-lg border border-[#D4AF37]/30 text-sm">{coupon.code}</span>
                          <span className="text-xs font-bold text-white bg-[#D4AF37] px-2 py-0.5 rounded-full">{discountLabel}</span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${categoryColor}`}>{categoryLabel}</span>
                        </div>
                        {shortTitle && <p className="text-sm font-semibold text-[#3E2723] mb-0.5">{shortTitle}</p>}
                        {coupon.description && <p className="text-xs text-[#8A7A5E] leading-relaxed">{coupon.description}</p>}
                      </div>
                    </div>

                    {/* Conditions row */}
                    <div className="bg-[#FAF7F2] border-t border-[#D4AF37]/10 px-4 py-2.5 flex items-center justify-between gap-3">
                      <div className="flex flex-wrap gap-x-4 gap-y-1">
                        {neededQty > 0 && (
                          <span className="text-xs text-[#5C4A2E] flex items-center gap-1">
                            <BookOpen className="w-3 h-3 text-[#D4AF37]" />
                            {book ? `Min ${neededQty} ${neededQty === 1 ? "copy" : "copies"} of this book` : `Min ${neededQty} books in cart`}
                          </span>
                        )}
                        {(coupon.minOrderValue || 0) > 0 && (
                          <span className="text-xs text-[#5C4A2E] flex items-center gap-1">
                            <Tag className="w-3 h-3 text-[#D4AF37]" />
                            Min order ₹{coupon.minOrderValue}
                          </span>
                        )}
                        {coupon.isFirstOrderOnly && (
                          <span className="text-xs text-purple-700 flex items-center gap-1">
                            <Star className="w-3 h-3" /> Valid on first order only
                          </span>
                        )}
                        {coupon.expiresAt && (
                          <span className="text-xs text-red-500 flex items-center gap-1">
                            Expires {new Date(coupon.expiresAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => { applyCouponFromCard(coupon); setOffersOpen(false); }}
                        disabled={couponLoading}
                        className={`flex-shrink-0 px-4 py-1.5 rounded-xl text-xs font-bold font-['Cinzel'] transition-all disabled:opacity-50 whitespace-nowrap ${
                          needsAdd
                            ? "bg-[#D4AF37] text-[#3E2723] hover:bg-[#C9A227]"
                            : "bg-[#3E2723] text-[#F3E5AB] hover:bg-[#2C1810]"
                        }`}
                      >
                        {needsAdd ? "Add & Apply" : "Use Coupon"}
                      </button>
                    </div>
                  </div>
                );
              })}

            {/* Empty state for filter */}
            {availableCoupons.filter(c => {
              if (offersFilter === "book") return !!c.requiredBookId;
              if (offersFilter === "firstorder") return c.isFirstOrderOnly;
              if (offersFilter === "general") return !c.requiredBookId && !c.isFirstOrderOnly;
              return true;
            }).length === 0 && (
              <div className="text-center py-12 text-[#8A7A5E]">
                <Gift className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">No offers in this category</p>
              </div>
            )}
          </div>

          {/* Bottom pad for mobile */}
          <div className="h-safe-bottom pb-4" />
        </div>
      </div>
    )}
    </>
  );
}