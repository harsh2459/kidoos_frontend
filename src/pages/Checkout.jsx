import { useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useCart } from "../contexts/CartStore";
import { assetUrl } from "../api/asset";
import { useSite } from "../contexts/SiteConfig";
import { t } from "../lib/toast";

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
  const remove = useCart((s) => s.remove);
  const { payments } = useSite();
  const pollTimer = useRef(null);
  
  // --- PAYMENT OPTION SELECTION ---
  const [paymentOption, setPaymentOption] = useState("full_online");

  /* ------------ Totals ------------ */
  const totals = useMemo(() => {
    const sub = items.reduce((sum, i) => {
      const price = Number(i.unitPriceSnapshot ?? i.price ?? i.bookId?.price ?? 0);
      const qty = Number(i.qty ?? 1);
      return sum + price * qty;
    }, 0);
    const tax = 0;
    const ship = 0;
    return { sub, tax, ship, grand: sub + tax + ship };
  }, [items]);

  /* ------------ fmt ------------ */
  const fmt = (n) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(n);

  /* ------------ Customer / Shipping ------------ */
  const [cust, setCust] = useState({
    name: "",
    email: "",
    phone: "",
    line1: "",
    city: "",
    state: "",
    pin: "",
    country: "India",
  });
  const set = (k, v) => setCust((p) => ({ ...p, [k]: v }));

  /* ------------ PIN → auto-fill state ------------ */
  const [pinStatus, setPinStatus] = useState("");
  const [offices, setOffices] = useState([]);
  const [locality, setLocality] = useState("");
  const pinDebounce = useRef(null);

  async function lookupPin(pin) {
    if (!/^\d{6}$/.test(pin)) {
      setPinStatus("");
      setOffices([]);
      return;
    }
    try {
      setPinStatus("Looking up…");
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const data = await res.json();
      const entry = Array.isArray(data) ? data[0] : null;
      if (
        !entry ||
        entry.Status !== "Success" ||
        !Array.isArray(entry.PostOffice) ||
        entry.PostOffice.length === 0
      ) {
        setPinStatus("Not found");
        setOffices([]);
        return;
      }
      const list = entry.PostOffice;
      setOffices(list);
      setLocality(list[0]?.Name || "");
      set("city", (list[0]?.District || "").trim());
      set("state", (list[0]?.State || "").trim());
      setPinStatus("OK");
    } catch {
      setPinStatus("Not found");
      setOffices([]);
    }
  }

  function onPinChange(v) {
    const onlyDigits = v.replace(/\D/g, "").slice(0, 6);
    set("pin", onlyDigits);
    clearTimeout(pinDebounce.current);
    if (/^\d{6}$/.test(onlyDigits)) {
      pinDebounce.current = setTimeout(() => lookupPin(onlyDigits), 250);
    } else {
      setPinStatus("");
      setOffices([]);
    }
  }

  /* ------------ Order placement ------------ */
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState(null);

  const hasOnlinePay = (payments?.providers || []).some(
    (p) => p.id === "razorpay" && p.enabled
  );

  function validateShipping() {
    if (items.length === 0) {
      navigate("/cart");
      return false;
    }
    if (
      !cust.name ||
      !cust.phone ||
      !cust.line1 ||
      !cust.city ||
      !cust.state ||
      !cust.pin
    ) {
      t.info("Please fill shipping details.");
      return false;
    }
    if (!/^\d{6}$/.test(cust.pin)) {
      t.info("Please enter a valid 6-digit PIN.");
      return false;
    }
    return true;
  }

  async function createLocalOrder(paymentMethod, paymentStatus = "pending") {
    const payload = {
      items: items.map((i) => ({
        bookId: i._id || i.id,
        title: i.title,
        price: i.price,
        qty: i.qty,
      })),
      customer: {
        name: cust.name,
        email: cust.email,
        phone: cust.phone,
      },
      shipping: {
        address1: cust.line1,
        city: cust.city,
        state: cust.state,
        postalCode: cust.pin,
        country: cust.country,
        locality: locality || undefined,
      },
      amount: totals.grand,
      currency: "INR",
      payment: {
        method: paymentMethod,
        status: paymentStatus,
      },
    };
    const { data } = await api.post("/orders", payload);
    if (!data?.ok) throw new Error(data?.error || "Failed to create order");
    const newId = data.orderId || data._id;
    if (!newId) throw new Error("Order created but id missing");
    return newId;
  }

  async function placeWithRazorpay() {
    if (!validateShipping()) return;
    setPlacing(true);
    try {
      const orderId = await createLocalOrder("razorpay", "created");

      // ✅ ALWAYS SEND FULL AMOUNT - Backend will calculate half if needed
      const { data } = await api.post("/payments/razorpay/order", {
        amountInRupees: totals.grand,  // ✅ Send full ₹10,000
        receipt: `web_${orderId}`,
        orderId,
        paymentType: paymentOption,  // "half_online_half_cod" or "full_online"
      });

      const { order, key, paymentId } = data || {};
      if (!order?.id || !key || !paymentId)
        throw new Error("Payment init failed");

      await loadRzp();
      const rzp = new window.Razorpay({
        key,
        amount: order.amount,  // Backend returns ₹5,000 (in paise) for half_online_half_cod
        currency: order.currency,
        name: "Your Store",
        description: `Order ${orderId}`,
        order_id: order.id,
        prefill: {
          name: cust.name || "",
          email: cust.email || "",
          contact: cust.phone || "",
        },
        notes: {
          ourOrderId: orderId,
        },
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
              t.success("Payment successful and verified!");
              navigate("/order-confirmed", { state: { orderId } });
            } else {
              t.err("Payment verification failed");
            }
          } catch (e) {
            t.err("Error verifying payment");
          }
        },
        modal: {
          ondismiss: async function () {
            t.info("Payment cancelled.");
            try {
              await api.delete(`/orders/${orderId}`);
              t.info("Order was deleted since payment was not completed.");
            } catch (err) {
              t.err("Could not delete order after payment cancel.");
            }
          },
        },
        theme: {
          color: "#3399cc",
        },
      });
      rzp.open();
    } catch (e) {
      t.err(
        e?.response?.data?.error || e.message || "Payment failed to start"
      );
    } finally {
      setPlacing(false);
    }
  }



  /* ------------ Thank-you page ------------ */
  if (placed) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h2 className="text-2xl font-bold text-green-600 mb-4">
          ✓ Order Placed Successfully!
        </h2>
        <p className="text-lg mb-2">
          <strong>Order ID:</strong> {placed.orderId}
        </p>
        <p className="text-gray-600 mb-6">
          Thank you for your purchase! You will receive a confirmation email shortly.
        </p>
        <button
          onClick={() => navigate("/")}
          className="btn-primary px-6 py-2 rounded"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  /* ------------ MAIN CHECKOUT FORM ------------ */
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT SIDE - FORM */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <div className="bg-white border rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={cust.name}
                  onChange={(e) => set("name", e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={cust.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="10-digit mobile"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={cust.email}
                  onChange={(e) => set("email", e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="your@email.com"
                />
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white border rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Address Line 1 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={cust.line1}
                  onChange={(e) => set("line1", e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Street address"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    PIN Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={cust.pin}
                    onChange={(e) => onPinChange(e.target.value)}
                    maxLength="6"
                    className="w-full border rounded px-3 py-2"
                    placeholder="6-digit PIN"
                  />
                  {pinStatus && (
                    <p
                      className={`text-xs mt-1 ${pinStatus === "OK"
                          ? "text-green-600"
                          : pinStatus === "Looking up…"
                            ? "text-blue-600"
                            : "text-red-600"
                        }`}
                    >
                      {pinStatus}
                    </p>
                  )}
                </div>

                {offices.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Locality
                    </label>
                    <select
                      value={locality}
                      onChange={(e) => setLocality(e.target.value)}
                      className="w-full border rounded px-3 py-2"
                    >
                      {offices.map((o, i) => (
                        <option key={i} value={o.Name}>
                          {o.Name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={cust.city}
                    onChange={(e) => set("city", e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    State <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={cust.state}
                    onChange={(e) => set("state", e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Country</label>
                <input
                  type="text"
                  value={cust.country}
                  className="w-full border rounded px-3 py-2 bg-gray-100"
                  disabled
                />
              </div>
            </div>
          </div>

          {/* Payment Options */}
          <div className="bg-white border rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="paymentOption"
                  value="full_online"
                  checked={paymentOption === "full_online"}
                  onChange={(e) => setPaymentOption(e.target.value)}
                  className="w-4 h-4 cursor-pointer"
                />
                <span className="text-sm font-medium">
                  Pay Full Amount Online
                </span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="paymentOption"
                  value="half_cod_half_online"
                  checked={paymentOption === "half_cod_half_online"}
                  onChange={(e) => setPaymentOption(e.target.value)}
                  className="w-4 h-4 cursor-pointer"
                />
                <span className="text-sm font-medium">
                  Pay 50% Online + 50% Cash on Delivery
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - ORDER SUMMARY */}
        <div className="lg:col-span-1">
          <div className="bg-white border rounded-lg p-6 shadow-sm sticky top-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

            {/* Cart Items */}
            <div className="space-y-2 mb-4 max-h-64 overflow-y-auto border-b pb-4">
              {items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-gray-700">
                    {item.title} x {item.qty}
                  </span>
                  <span className="font-medium">
                    {fmt(
                      (item.unitPriceSnapshot ?? item.price ?? 0) * item.qty
                    )}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>{fmt(totals.sub)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax:</span>
                <span>{fmt(totals.tax)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping:</span>
                <span>{fmt(totals.ship)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span>{fmt(totals.grand)}</span>
              </div>

              {/* Payment Amount Breakdown */}
              {paymentOption === "half_cod_half_online" && (
                <div className="bg-blue-50 border border-blue-200 rounded p-3 mt-3 text-xs">
                  <p>Pay Now: <strong>{fmt(totals.grand / 2)}</strong></p>
                  <p>Pay on Delivery: <strong>{fmt(totals.grand / 2)}</strong></p>
                </div>
              )}
            </div>

            {/* ============ PAYMENT BUTTON ============ */}
            <button
              onClick={placeWithRazorpay}
              disabled={placing || !hasOnlinePay}
              className={`w-full py-3 rounded-lg font-semibold text-white transition-all ${placing || !hasOnlinePay
                  ? "bg-gray-400 cursor-not-allowed"
                  : "btn-primary"
                }`}
            >
              {placing ? (
                <span className="flex items-center justify-center space-x-2">
                  <span>Processing...</span>
                </span>
              ) : (
                `Proceed to Payment (${fmt(
                  paymentOption === "half_cod_half_online"
                    ? totals.grand / 2
                    : totals.grand
                )})`
              )}
            </button>

            {!hasOnlinePay && (
              <p className="text-red-500 text-xs mt-3 text-center">
                ⚠️ Online payment is currently unavailable
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
