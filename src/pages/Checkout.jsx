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
    if (!/^\d{6}$/.test(pin)) { setPinStatus(""); setOffices([]); return; }
    try {
      setPinStatus("Looking up…");
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const data = await res.json();
      const entry = Array.isArray(data) ? data[0] : null;
      if (!entry || entry.Status !== "Success" || !Array.isArray(entry.PostOffice) || entry.PostOffice.length === 0) {
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
    if (items.length === 0) { navigate("/cart"); return false; }
    if (!cust.name || !cust.phone || !cust.line1 || !cust.city || !cust.state || !cust.pin) {
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
      customer: { name: cust.name, email: cust.email, phone: cust.phone },
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
      payment: { method: paymentMethod, status: paymentStatus },
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
      const { data } = await api.post("/payments/razorpay/order", {
        amountInRupees: totals.grand,
        receipt: `web_${orderId}`,
        orderId,
        paymentType: paymentOption // Send correct paymentType
      });

      const { order, key, paymentId } = data || {};
      if (!order?.id || !key || !paymentId) throw new Error("Payment init failed");

      await loadRzp();
      const rzp = new window.Razorpay({
        key,
        amount: order.amount,
        currency: order.currency,
        name: "Your Store",
        description: `Order ${orderId}`,
        order_id: order.id,
        prefill: {
          name: cust.name || "",
          email: cust.email || "",
          contact: cust.phone || "",
        },
        notes: { ourOrderId: orderId },
        handler: async function (response) {
          try {
            const verifyRes = await api.post("/payments/razorpay/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              paymentId // critical to link the record!
            });

            if (verifyRes?.data?.ok && verifyRes?.data?.verified) {
              setPlaced({ orderId });
              clear();
              t.success("Payment successful and verified!");
              // Redirect to order confirmation page:
              navigate('/order-confirmed', { state: { orderId } });
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
          }
        },
        theme: { color: "#3399cc" }
      });
      rzp.open();
    } catch (e) {
      t.err(e?.response?.data?.error || e.message || "Payment failed to start");
    } finally {
      setPlacing(false);
    }
  }

  // -- No COD. Remove placeWithoutPayment logic and button! --

  /* ------------ Thank-you page ------------ */
  if (placed) {
    return (
      <div className="mx-auto max-w-screen-xl px-4 py-8">
        <h1 className="text-2xl font-bold mb-2">Thank you!</h1>
        <p className="text-gray-600">Your order has been placed.</p>
        <p className="text-gray-600 mt-1">
          <strong>Order ID:</strong> {placed.orderId}
        </p>
        <button onClick={() => navigate("/catalog")} className="mt-6 btn-primary">
          Continue browsing
        </button>
      </div>
    );
  }

  /* ------------ Checkout UI ------------ */
  return (
    <div className="mx-auto max-w-screen-xl px-4 py-8 grid lg:grid-cols-3 gap-6">
      {/* Shipping form */}
      <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-3">
        <h1 className="text-xl font-semibold mb-2">Shipping details</h1>
        <Row>
          <Input
            label="Full name"
            value={cust.name}
            onChange={(e) => set("name", e.target.value)}
          />
        </Row>
        <div className="grid md:grid-cols-2 gap-3">
          <Input
            label="Email (optional)"
            value={cust.email}
            onChange={(e) => set("email", e.target.value)}
          />
          <Input
            label="Phone"
            value={cust.phone}
            onChange={(e) => set("phone", e.target.value)}
          />
        </div>
        <Input
          label="Address"
          value={cust.line1}
          onChange={(e) => set("line1", e.target.value)}
        />
        <div className="grid md:grid-cols-3 gap-3">
          <Input
            label="City"
            value={cust.city}
            onChange={(e) => set("city", e.target.value)}
          />
          <Input
            label="State"
            value={cust.state}
            onChange={(e) => set("state", e.target.value)}
          />
          <Input
            label="PIN code"
            value={cust.pin}
            onChange={(e) => onPinChange(e.target.value)}
          />
        </div>
        {/* Locality + PIN status */}
        {(offices.length > 1 || pinStatus) && (
          <div className="grid md:grid-cols-3 gap-3 mt-2">
            {offices.length > 1 && (
              <div>
                <label className="block text-sm mb-1">Locality / Post Office</label>
                <select
                  className="w-full bg-white border border-gray-300 rounded-theme px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
                  value={locality}
                  onChange={(e) => {
                    const val = e.target.value;
                    setLocality(val);
                    const sel = offices.find((o) => o.Name === val);
                    if (sel) {
                      set("city", (sel.District || "").trim());
                      set("state", (sel.State || "").trim());
                    }
                  }}
                >
                  {offices.map((o) => (
                    <option key={o.Name} value={o.Name}>{o.Name}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex items-end text-sm text-gray-600">
              {pinStatus === "Looking up…" && <span>Looking up PIN…</span>}
              {pinStatus === "Not found" && (
                <span className="text-red-600">PIN not found. Please check.</span>
              )}
              {pinStatus === "OK" && <span>Auto-filled from PIN.</span>}
            </div>
          </div>
        )}
      </div>
      {/* Order summary */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-3">Order summary</h2>
        <div className="space-y-3">
          {items.map((i) => (
            <div key={(i._id || i.id) + String(i.qty)} className="flex gap-3">
              <img
                src={assetUrl(i.assets?.coverUrl)}
                alt={i.title}
                className="h-14 w-10 object-cover rounded-md"
              />
              <div className="flex-1">
                <div className="font-medium">{i.title}</div>
                <div className="text-gray-600 text-sm">Qty: {i.qty}</div>
              </div>
              <div>{fmt((Number(i.unitPriceSnapshot ?? i.price ?? i.bookId?.price ?? 0) * Number(i.qty ?? 1)))}</div>
              <button
                className="text-red-600 text-sm"
                onClick={() => remove(i._id || i.id)}
              >
                Remove
              </button>
            </div>
          ))}
          {items.length === 0 && (
            <div className="text-gray-600">Your cart is empty.</div>
          )}
        </div>
        <div className="border-t border-gray-200 mt-4 pt-4 space-y-1">
          <Line label="Subtotal" value={`₹${totals.sub}`} />
          <Line label="Tax" value={`₹${totals.tax}`} />
          <Line label="Shipping" value={totals.ship ? `₹${totals.ship}` : "Free"} />
          <Line label="Total" value={<strong>₹{totals.grand}</strong>} />
        </div>
        {/* --- PAYMENT OPTION UI --- */}
        <div className="mt-4">
          <div className="mb-2 font-medium">Select payment option:</div>
          <label className="mr-4">
            <input
              type="radio"
              checked={paymentOption === "full_online"}
              onChange={() => setPaymentOption("full_online")}
            />{" "}
            Pay Full Online
          </label>
          <label>
            <input
              type="radio"
              checked={paymentOption === "half_online_half_cod"}
              onChange={() => setPaymentOption("half_online_half_cod")}
            />{" "}
            Pay Half Online, Half on Delivery
          </label>
        </div>
        <div className="mt-4 space-y-2">
          {hasOnlinePay && (
            <button
              onClick={placeWithRazorpay}
              disabled={placing || items.length === 0}
              className="w-full btn-primary"
            >
              {placing
                ? "Starting payment…"
                : paymentOption === "full_online"
                  ? "Pay Full Online"
                  : "Pay Half Online, Half on Delivery"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------ UI helpers ------------ */
function Row({ children }) {
  return <div className="mb-3">{children}</div>;
}

function Input({ label, ...rest }) {
  return (
    <div>
      <label className="block text-sm mb-1">{label}</label>
      <input
        className="w-full bg-white border border-gray-300 rounded-theme px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
        {...rest}
      />
    </div>
  );
}

function Line({ label, value }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-600">{label}</span>
      <span>{value}</span>
    </div>
  );
}
