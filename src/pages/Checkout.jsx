// src/pages/Checkout.jsx
import { useMemo, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useCart } from "../contexts/CartStore";
import { assetUrl } from "../api/asset";
import { useSite } from "../contexts/SiteConfig";
import { t } from "../lib/toast";
import { useCustomer } from "../contexts/CustomerAuth"; // ✅ ADDED

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
  
  // ✅ ADDED: Get customer authentication info
  const { customer, isCustomer, token } = useCustomer();
  
  const pollTimer = useRef(null);

  // --- PAYMENT OPTION SELECTION ---
  const [paymentOption, setPaymentOption] = useState("full_online");

  const getBookIdFromCartItem = (item) => {
    // Priority 1: bookId field (server format)
    if (item.bookId) {
      // If bookId is an object (populated by server), extract _id
      if (typeof item.bookId === 'object' && item.bookId._id) {
        return item.bookId._id;
      }
      // If bookId is a string, use it directly
      if (typeof item.bookId === 'string') {
        return item.bookId;
      }
    }

    // Priority 2: book._id (alternative server format)
    if (item.book?._id) {
      return item.book._id;
    }

    // Priority 3: _id ONLY if it's NOT a local cart item ID
    if (item._id && !item._id.startsWith('local_')) {
      return item._id;
    }

    // Last resort
    return item.id;
  };

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

  /* ------------ Customer / Shipping (with pre-fill) ------------ */
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

  // ✅ ADDED: Pre-fill customer data if logged in
  useEffect(() => {
    if (customer) {
      console.log("👤 Pre-filling customer data:", customer);
      setCust(prev => ({
        ...prev,
        name: customer.name || prev.name,
        email: customer.email || prev.email,
        phone: customer.phone || prev.phone,
      }));
    }
  }, [customer]);

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
    console.log("\n" + "=".repeat(80));
    console.log("🛒 [Checkout] Creating order...");
    console.log("=".repeat(80));

    // ✅ DEBUG: Log authentication status
    console.log("👤 Customer Authentication:");
    console.log(" - Is Logged In:", isCustomer);
    console.log(" - Customer ID:", customer?.id);
    console.log(" - Customer Name:", customer?.name);
    console.log(" - Customer Email:", customer?.email);
    console.log(" - Token Present:", !!token);

    // ✅ DEBUG: Log cart items BEFORE mapping
    console.log("\n📦 Raw cart items:", items);
    items.forEach((item, idx) => {
      const extractedBookId = getBookIdFromCartItem(item);
      console.log(`\n📚 Cart Item ${idx + 1}:`);
      console.log(`  - Cart Item _id: ${item._id}`);
      console.log(`  - Extracted Book ID: ${extractedBookId}`);
      console.log(`  - Title: ${item.title}`);
      console.log(`  - Price: ${item.unitPriceSnapshot || item.price}`);
      console.log(`  - Qty: ${item.qty}`);
    });

    // ✅ CRITICAL FIX: Extract REAL book IDs from cart items
    const mappedItems = items.map((item) => {
      const bookId = getBookIdFromCartItem(item);

      // ✅ Validate book ID exists
      if (!bookId) {
        console.error(`❌ ERROR: No valid book ID found for "${item.title}"`);
        throw new Error(`Cannot create order: Book "${item.title}" has no valid ID`);
      }

      // ✅ Validate it's not a local cart item ID
      if (bookId.startsWith('local_')) {
        console.error(`❌ ERROR: Attempted to use cart item ID as book ID: ${bookId}`);
        throw new Error(`Cannot create order: Invalid book ID for "${item.title}"`);
      }

      // ✅ Validate MongoDB ObjectId format (24 hex characters)
      if (!/^[0-9a-fA-F]{24}$/.test(bookId)) {
        console.error(`❌ ERROR: Book ID is not a valid MongoDB ObjectId: "${bookId}"`);
        throw new Error(`Cannot create order: Book "${item.title}" has malformed ID`);
      }

      console.log(`✅ Mapping "${item.title}" with Book ID: ${bookId}`);

      return {
        bookId: bookId, // ✅ Only send the REAL book ID
        title: item.title,
        price: item.unitPriceSnapshot || item.price,
        qty: item.qty,
      };
    });

    console.log("\n📋 Final payload items:", JSON.stringify(mappedItems, null, 2));

    // ✅ CRITICAL FIX: Include customerId if user is logged in
    const payload = {
      // ✅ Send customerId if authenticated, otherwise backend creates guest
      ...(isCustomer && customer?.id && { customerId: customer.id }),
      
      items: mappedItems,
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

    console.log("\n📤 Sending order payload:");
    console.log(" - Has customerId:", !!payload.customerId);
    console.log(" - CustomerId value:", payload.customerId);
    console.log(" - Customer name:", payload.customer.name);
    console.log(" - Customer email:", payload.customer.email);
    console.log(" - Customer phone:", payload.customer.phone);
    console.log(" - Full payload:", JSON.stringify(payload, null, 2));

    try {
      // ✅ FIXED: Don't send auth header for order creation (backend uses customerId from payload)
      const { data } = await api.post("/orders", payload);

      console.log("\n✅ Order created successfully:", data);

      if (!data?.ok) throw new Error(data?.error || "Failed to create order");

      const newId = data.orderId || data._id;
      if (!newId) throw new Error("Order created but id missing");

      return newId;
    } catch (error) {
      console.error("\n❌ Order creation failed:", error);
      console.error("Error response:", error?.response?.data);
      throw error;
    }
  }

  async function placeWithRazorpay() {
    if (!validateShipping()) return;

    setPlacing(true);
    try {
      const orderId = await createLocalOrder("razorpay", "created");

      // ✅ ALWAYS SEND FULL AMOUNT - Backend will calculate half if needed
      const { data } = await api.post("/payments/razorpay/order", {
        amountInRupees: totals.grand, // ✅ Send full amount
        receipt: `web_${orderId}`,
        orderId,
        paymentType: paymentOption, // "half_online_half_cod" or "full_online"
      });

      const { order, key, paymentId } = data || {};
      if (!order?.id || !key || !paymentId)
        throw new Error("Payment init failed");

      await loadRzp();

      const rzp = new window.Razorpay({
        key,
        amount: order.amount, // Backend returns correct amount (half or full in paise)
        currency: order.currency,
        name: "Kiddos Intellect",
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
            console.error("Payment verification error:", e);
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
              console.error("Failed to delete order:", err);
              t.err("Could not delete order after payment cancel.");
            }
          },
        },
        theme: {
          color: "#000000",
        },
      });

      rzp.open();
    } catch (e) {
      console.error("Razorpay error:", e);
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
      <div className="max-w-2xl mx-auto p-6 text-center">
        <div className="bg-green-50 border-2 border-green-500 rounded-lg p-8">
          <svg
            className="w-20 h-20 mx-auto text-green-500 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h1 className="text-3xl font-bold text-green-800 mb-2">
            Order Placed Successfully!
          </h1>
          <p className="text-green-700 mb-4">
            <strong>Order ID:</strong> {placed.orderId}
          </p>
          <p className="text-gray-700 mb-6">
            Thank you for your purchase! You will receive a confirmation email shortly.
          </p>
          <button
            onClick={() => navigate("/profile/orders")}
            className="bg-black text-white px-6 py-3 rounded-lg hover:bg-black/90 transition-colors mr-3"
          >
            View My Orders
          </button>
          <button
            onClick={() => navigate("/catalog")}
            className="bg-white text-black border-2 border-black px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  /* ------------ Main UI ------------ */
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-black">Checkout</h1>

      {/* ✅ ADDED: Show customer info banner if logged in */}
      {isCustomer && customer && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-green-800">
                ✅ Logged in as <strong>{customer.name || customer.email}</strong>
              </p>
              <p className="text-xs text-green-600">
                Your order will be linked to your account
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Cart Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-black">Order Summary</h2>
        
        {items.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">Your cart is empty</p>
            <button
              onClick={() => navigate("/catalog")}
              className="bg-black text-white px-6 py-2 rounded-lg hover:bg-black/90 transition-colors"
            >
              Browse Books
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-4">
              {items.map((item, idx) => {
                const price = Number(item.unitPriceSnapshot ?? item.price ?? 0);
                const qty = Number(item.qty ?? 1);
                const bookId = getBookIdFromCartItem(item);
                
                return (
                  <div
                    key={item._id || idx}
                    className="flex items-center gap-4 pb-3 border-b border-gray-100 last:border-0"
                  >
                    {/* Book Image */}
                    <div className="w-16 h-20 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                      {item.bookId?.assets?.coverUrl?.[0] || item.image ? (
                        <img
                          src={assetUrl(item.bookId?.assets?.coverUrl?.[0] || item.image)}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          No Image
                        </div>
                      )}
                    </div>

                    {/* Book Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-black truncate">{item.title}</h4>
                      <p className="text-sm text-gray-600">
                        Qty: {qty} × {fmt(price)}
                      </p>
                    </div>

                    {/* Item Total */}
                    <div className="text-right">
                      <p className="font-semibold text-black">{fmt(price * qty)}</p>
                      <button
                        onClick={() => remove(item._id)}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Totals */}
            <div className="border-t border-gray-200 pt-4 space-y-2">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal:</span>
                <span>{fmt(totals.sub)}</span>
              </div>
              {totals.tax > 0 && (
                <div className="flex justify-between text-gray-700">
                  <span>Tax:</span>
                  <span>{fmt(totals.tax)}</span>
                </div>
              )}
              {totals.ship > 0 && (
                <div className="flex justify-between text-gray-700">
                  <span>Shipping:</span>
                  <span>{fmt(totals.ship)}</span>
                </div>
              )}
              <div className="flex justify-between text-xl font-bold text-black border-t border-gray-300 pt-2 mt-2">
                <span>Total:</span>
                <span>{fmt(totals.grand)}</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Shipping Form */}
      {items.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-black">Shipping Details</h2>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={cust.name}
                onChange={(e) => set("name", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="Enter your full name"
                required
              />
            </div>

            {/* Email & Phone */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={cust.email}
                  onChange={(e) => set("email", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={cust.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="10-digit phone"
                  maxLength={10}
                  required
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address Line 1 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={cust.line1}
                onChange={(e) => set("line1", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="House No, Building Name, Street"
                required
              />
            </div>

            {/* PIN Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PIN Code <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={cust.pin}
                  onChange={(e) => onPinChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="6-digit PIN"
                  maxLength={6}
                  required
                />
                {pinStatus && (
                  <span
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-sm ${
                      pinStatus === "OK"
                        ? "text-green-600"
                        : pinStatus === "Looking up…"
                        ? "text-blue-600"
                        : "text-red-600"
                    }`}
                  >
                    {pinStatus}
                  </span>
                )}
              </div>
            </div>

            {/* Locality (if PIN lookup succeeded) */}
            {offices.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Locality / Area
                </label>
                <select
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  {offices.map((o, i) => (
                    <option key={i} value={o.Name}>
                      {o.Name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* City & State */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={cust.city}
                  onChange={(e) => set("city", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent bg-gray-50"
                  placeholder="Auto-filled from PIN"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={cust.state}
                  onChange={(e) => set("state", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent bg-gray-50"
                  placeholder="Auto-filled from PIN"
                  required
                />
              </div>
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <input
                type="text"
                value={cust.country}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                disabled
              />
            </div>
          </div>
        </div>
      )}

      {/* Payment Options */}
      {items.length > 0 && hasOnlinePay && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-black">Payment Method</h2>

          <div className="space-y-3">
            {/* Full Payment */}
            <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-black transition-colors">
              <input
                type="radio"
                name="payment"
                value="full_online"
                checked={paymentOption === "full_online"}
                onChange={(e) => setPaymentOption(e.target.value)}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="font-semibold text-black">Pay Full Amount Online</div>
                <div className="text-2xl font-bold text-black mt-1">{fmt(totals.grand)}</div>
                <div className="text-sm text-gray-600 mt-1">
                  Pay the complete amount now via UPI, Cards, or Net Banking
                </div>
              </div>
            </label>

            {/* Half Payment */}
            <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-black transition-colors">
              <input
                type="radio"
                name="payment"
                value="half_online_half_cod"
                checked={paymentOption === "half_online_half_cod"}
                onChange={(e) => setPaymentOption(e.target.value)}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="font-semibold text-black">Pay Half Now, Half on Delivery</div>
                <div className="flex items-center gap-4 mt-2">
                  <div>
                    <div className="text-xs text-gray-600">Pay Now:</div>
                    <div className="text-xl font-bold text-green-600">{fmt(totals.grand / 2)}</div>
                  </div>
                  <div className="text-gray-400">+</div>
                  <div>
                    <div className="text-xs text-gray-600">Pay on Delivery:</div>
                    <div className="text-xl font-bold text-blue-600">{fmt(totals.grand / 2)}</div>
                  </div>
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  Pay half amount now as booking, remaining via Cash on Delivery (COD)
                </div>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* Place Order Button */}
      {items.length > 0 && (
        <div className="flex gap-4">
          <button
            onClick={() => navigate("/cart")}
            className="flex-1 bg-white text-black border-2 border-black px-6 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Back to Cart
          </button>

          {hasOnlinePay ? (
            <button
              onClick={placeWithRazorpay}
              disabled={placing}
              className="flex-1 bg-black text-white px-6 py-4 rounded-lg font-semibold hover:bg-black/90 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {placing ? "Processing..." : `Place Order - ${fmt(paymentOption === "half_online_half_cod" ? totals.grand / 2 : totals.grand)}`}
            </button>
          ) : (
            <div className="flex-1 bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
              <p className="text-yellow-800 font-semibold">
                ⚠️ Online payment is currently unavailable
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
