import { useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useCart } from "../contexts/CartStore";
import { assetUrl } from "../api/asset";
import { useSite } from "../contexts/SiteConfig";

// Load Razorpay script once on demand
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

  const totals = useMemo(() => {
    const sub = items.reduce((s, i) => s + i.price * i.qty, 0);
    const tax = 0;
    const ship = 0;
    return { sub, tax, ship, grand: sub + tax + ship };
  }, [items]);

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
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState(null); // { orderId }

  const set = (k, v) => setCust((p) => ({ ...p, [k]: v }));

  const hasOnlinePay = (payments?.providers || []).some(
    (p) => p.id === "razorpay" && p.enabled
  );

  function validateShipping() {
    if (items.length === 0) { navigate("/cart"); return false; }
    if (!cust.name || !cust.phone || !cust.line1 || !cust.city || !cust.state || !cust.pin) {
      alert("Please fill shipping details.");
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
        address1: cust.line1, city: cust.city, state: cust.state,
        postalCode: cust.pin, country: cust.country,
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

  async function pollOrderUntilPaid(orderId) {
    return new Promise((resolve, reject) => {
      const check = async () => {
        try {
          const { data } = await api.get(`/orders/${orderId}`);
          const status = data?.order?.payment?.status || data?.order?.status;
          if (status === "paid") {
            clearInterval(pollTimer.current);
            pollTimer.current = null;
            resolve(true);
            return;
          }
        } catch (e) {
          // ignore transient errors; keep polling
        }
      };
      pollTimer.current = setInterval(check, 2000);
      // Also do an immediate first check
      check();
      // Safety timeout (90s)
      setTimeout(() => {
        if (pollTimer.current) {
          clearInterval(pollTimer.current);
          pollTimer.current = null;
        }
        resolve(false);
      }, 90000);
    });
  }

  async function placeWithRazorpay() {
    if (!validateShipping()) return;
    setPlacing(true);
    try {
      // 1) Create local order with method=razorpay
      const orderId = await createLocalOrder("razorpay", "created");

      // 2) Get Razorpay order + key from backend
      const { data } = await api.post("/payments/razorpay/order", {
        amountInRupees: totals.grand,
        receipt: `web_${orderId}`,
        orderId
      });
      const { order, key } = data || {};
      if (!order?.id || !key) throw new Error("Payment init failed");

      // 3) Ensure script and open checkout
      await loadRzp();

      const rzp = new window.Razorpay({
        key,
        amount: order.amount,       // paise
        currency: order.currency,   // INR
        name: "Your Store",
        description: `Order ${orderId}`,
        order_id: order.id,
        prefill: {
          name: cust.name || "",
          email: cust.email || "",
          contact: cust.phone || "",
        },
        notes: { ourOrderId: orderId },
        handler: async function () {
          // We rely on webhook to mark paid; show confirming and poll
          setPlaced({ orderId });
          // Poll until webhook marks paid
          const paid = await pollOrderUntilPaid(orderId);
          if (!paid) {
            alert("Payment captured, awaiting confirmation. If not updated soon, contact support with your Order ID.");
          } else {
            clear(); // success
          }
        },
        modal: {
          ondismiss: function () {
            // User closed without paying
          }
        },
        theme: { color: "#3399cc" }
      });

      rzp.open();
    } catch (e) {
      alert(e?.response?.data?.error || e.message || "Payment failed to start");
    } finally {
      setPlacing(false);
    }
  }

  async function placeWithoutPayment() {
    if (!validateShipping()) return;
    setPlacing(true);
    try {
      const orderId = await createLocalOrder("cod", "pending");
      setPlaced({ orderId });
      clear();
    } catch (e) {
      alert(e?.response?.data?.error || e.message || "Failed to place order");
    } finally {
      setPlacing(false);
    }
  }

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

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-8 grid lg:grid-cols-3 gap-6">
      {/* Shipping form */}
      <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-3">
        <h1 className="text-xl font-semibold mb-2">Shipping details</h1>
        <Row>
          <Input label="Full name" value={cust.name} onChange={(e) => set("name", e.target.value)} />
        </Row>
        <div className="grid md:grid-cols-2 gap-3">
          <Input label="Email (optional)" value={cust.email} onChange={(e) => set("email", e.target.value)} />
          <Input label="Phone" value={cust.phone} onChange={(e) => set("phone", e.target.value)} />
        </div>
        <Input label="Address" value={cust.line1} onChange={(e) => set("line1", e.target.value)} />
        <div className="grid md:grid-cols-3 gap-3">
          <Input label="City" value={cust.city} onChange={(e) => set("city", e.target.value)} />
          <Input label="State" value={cust.state} onChange={(e) => set("state", e.target.value)} />
          <Input label="PIN code" value={cust.pin} onChange={(e) => set("pin", e.target.value)} />
        </div>
      </div>

      {/* Order summary */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-3">Order summary</h2>
        <div className="space-y-3">
          {items.map((i) => (
            <div key={(i._id || i.id) + String(i.qty)} className="flex gap-3">
              <img src={assetUrl(i.assets?.coverUrl)} alt={i.title} className="h-14 w-10 object-cover rounded-md" />
              <div className="flex-1">
                <div className="font-medium">{i.title}</div>
                <div className="text-gray-600 text-sm">Qty: {i.qty}</div>
              </div>
              <div>₹{i.price * i.qty}</div>
              <button className="text-red-600 text-sm" onClick={() => remove(i._id || i.id)}>Remove</button>
            </div>
          ))}
          {items.length === 0 && <div className="text-gray-600">Your cart is empty.</div>}
        </div>

        <div className="border-t border-gray-200 mt-4 pt-4 space-y-1">
          <Line label="Subtotal" value={`₹${totals.sub}`} />
          <Line label="Tax" value={`₹${totals.tax}`} />
          <Line label="Shipping" value={totals.ship ? `₹${totals.ship}` : "Free"} />
          <Line label="Total" value={<strong>₹{totals.grand}</strong>} />
        </div>

        <div className="mt-4 space-y-2">
          {hasOnlinePay && (
            <button
              onClick={placeWithRazorpay}
              disabled={placing || items.length === 0}
              className="w-full btn-primary"
            >
              {placing ? "Starting payment…" : "Pay Online (Razorpay)"}
            </button>
          )}
          <button
            onClick={placeWithoutPayment}
            disabled={placing || items.length === 0}
            className="w-full btn-muted"
          >
            {placing ? "Placing…" : "Place Order (No Payment)"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ children }) { return <div className="mb-3">{children}</div>; }

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
