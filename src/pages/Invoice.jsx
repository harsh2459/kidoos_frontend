// src/pages/Invoice.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api/client';
import { Printer } from 'lucide-react';

export default function Invoice() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch order data when page loads
  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(res => {
        setOrder(res.data.order);
        setLoading(false);
      })
      .catch(err => {
        console.error("Invoice Error:", err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="p-10 text-center">Loading Invoice...</div>;
  if (!order) return <div className="p-10 text-center">Invoice not found.</div>;

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n || 0);

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 font-sans print:bg-white print:p-0">
      
      {/* ✅ CSS TO HIDE ICONS & HEADER */}
      <style>{`
        /* 1. Hide Navbar and Header */
        nav, header, .navbar, .header-container, .fixed.top-0, .sticky.top-0 {
          display: none !important;
        }
        
        /* 2. Hide The WhatsApp/Social Floating Menu */
        /* Targets the specific structure of your WhatsAppButton.jsx */
        .fixed.z-\\[9999\\], 
        div[style*="z-index: 9999"],
        div[class*="fixed"][class*="z-"] {
           display: none !important;
        }

        /* 3. Hide any other floating elements just in case */
        .whatsapp-button, 
        .dynamic-popup,
        [class*="WhatsAppButton"],
        [class*="DynamicPopup"],
        a[href*="wa.me"] {
          display: none !important;
        }

        /* Ensure clean white background */
        body {
          background-color: #f3f4f6;
        }
        @media print {
          body { background-color: white; }
          @page { margin: 0; }
          .print-hidden { display: none !important; }
        }
      `}</style>

      {/* Print Button (Hidden when printing) */}
      <div className="max-w-3xl mx-auto mb-6 flex justify-end gap-4 print:hidden print-btn">
        <button 
          onClick={() => window.print()} 
          className="flex items-center gap-2 bg-[#1A3C34] text-white px-4 py-2 rounded-lg font-bold hover:bg-[#2F523F]"
        >
          <Printer className="w-4 h-4 print-icon" /> Print / Save PDF
        </button>
      </div>

      {/* Invoice Paper */}
      <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 shadow-lg rounded-xl print:shadow-none print:w-full">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-gray-200 pb-8 mb-8">
          <div>
            <h1 className="text-4xl font-serif font-bold text-[#1A3C34] mb-2">INVOICE</h1>
            <p className="text-gray-500">Order #{String(order._id).slice(-8).toUpperCase()}</p>
            <p className="text-gray-500 text-sm mt-1">Date: {formatDate(order.createdAt)}</p>
          </div>
          <div className="text-right">
            {/* ✅ LOGO ADDED HERE */}
            <img 
              src="/images/logo.jpg" 
              alt="Kiddos Intellect" 
              className="h-[90px] ml-auto mb-3 object-contain" 
              onError={(e) => { e.target.style.display='none'; }} 
            />
          </div>
        </div>

        {/* Bill To */}
        <div className="mb-10">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Bill To</h3>
          <p className="font-bold text-[#1A3C34] text-lg">{order.shipping?.name || order.customer?.name}</p>
          <p className="text-gray-600">{order.shipping?.address}</p>
          <p className="text-gray-600">
            {order.shipping?.city}, {order.shipping?.state} - {order.shipping?.pincode}
          </p>
          <p className="text-gray-600 mt-1">{order.shipping?.phone}</p>
        </div>

        {/* Items Table */}
        <table className="w-full mb-8">
          <thead>
            <tr className="border-b-2 border-[#1A3C34]">
              <th className="text-left py-3 text-sm font-bold text-[#1A3C34]">Item</th>
              <th className="text-center py-3 text-sm font-bold text-[#1A3C34]">Qty</th>
              <th className="text-right py-3 text-sm font-bold text-[#1A3C34]">Price</th>
              <th className="text-right py-3 text-sm font-bold text-[#1A3C34]">Total</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {order.items.map((item, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="py-4 text-sm font-medium">{item.title}</td>
                <td className="py-4 text-center text-sm">{item.qty}</td>
                <td className="py-4 text-right text-sm">{fmt(item.unitPrice)}</td>
                <td className="py-4 text-right text-sm font-bold">{fmt(item.unitPrice * item.qty)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals Section */}
        <div className="flex justify-end">
          <div className="w-1/2 space-y-3">
            {/* Subtotal */}
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>{fmt(order.amount - (order.shippingAmount || 0) - (order.serviceFee || 0))}</span>
            </div>
            
            {/* Shipping Cost */}
            <div className="flex justify-between text-sm text-gray-600">
              <span>Shipping Fee</span>
              <span>{order.shippingAmount > 0 ? fmt(order.shippingAmount) : "Free"}</span>
            </div>

            {/* Service/COD Fee */}
            {order.serviceFee > 0 && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>Service Fee</span>
                <span>{fmt(order.serviceFee)}</span>
              </div>
            )}

            {/* Total */}
            <div className="flex justify-between text-xl font-bold text-[#1A3C34] pt-4 border-t border-gray-200">
              <span>Total</span>
              <span>{fmt(order.amount)}</span>
            </div>

            {/* Payment Status Breakdown */}
            <div className="bg-gray-50 p-3 rounded-lg text-sm mt-4">
              <div className="flex justify-between mb-1">
                <span className="text-green-700 font-medium">Paid Online</span>
                <span className="text-green-700 font-bold">{fmt(order.payment?.paidAmount)}</span>
              </div>
              {order.payment?.dueOnDeliveryAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-orange-700 font-medium">Due on Delivery</span>
                  <span className="text-orange-700 font-bold">{fmt(order.payment?.dueOnDeliveryAmount)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center text-xs text-gray-400">
          <p>Thank you for shopping with Kiddos Intellect!</p>
          <p className="mt-1">For support, email us at support@kiddosintellect.com</p>
        </div>

      </div>
    </div>
  );
}