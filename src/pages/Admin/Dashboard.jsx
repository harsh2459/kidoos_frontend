import { useEffect, useState } from "react";
import { 
  Users, BookOpen, ShoppingBag, TrendingUp, Download, MapPin, 
  Loader2, AlertTriangle 
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid
} from "recharts";
import { api } from "../../api/client"; 
import { useAuth } from "../../contexts/Auth";
import { t } from "../../lib/toast";

const COLORS = ["#1A3C34", "#10B981", "#F59E0B", "#EF4444"];

export default function Dashboard() {
  const { token } = useAuth();
  const auth = { headers: { Authorization: `Bearer ${token}` } };
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("all");

  async function loadStats() {
    setLoading(true);
    try {
      // ✅ Corrected URL with /auth prefix
      const res = await api.get(`/auth/dashboard/stats?period=${period}`, auth);
      if (res.data.success) setData(res.data);
    } catch (e) {
      console.error(e);
      t.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  async function downloadUsers() {
    try {
        const response = await api.get("/auth/users/download", { ...auth, responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'customers.csv');
        document.body.appendChild(link);
        link.click();
        t.success("User data downloaded!");
    } catch (e) {
        t.error("Download failed");
    }
  }

  useEffect(() => { loadStats(); }, [period]);

  if (loading && !data) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-[#1A3C34]" /></div>;

  const counts = data?.counts || {};
  const analytics = data?.analytics || {};
  const financials = data?.financials || {};

  const paymentData = (analytics.paymentModes || []).map(m => ({
    name: m._id === 'full' ? 'Prepaid' : 'COD',
    value: m.count
  }));

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-10 bg-gradient-to-br from-gray-50 to-green-50/20 min-h-screen">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-serif font-bold text-[#1A3C34] mb-1">Dashboard Overview</h1>
          <p className="text-[#5C756D] text-base">Track your business performance at a glance</p>
        </div>
        <div className="flex gap-2 bg-white p-1.5 rounded-xl border-2 border-[#E3E8E5] shadow-sm">
            {['today', 'week', 'month', 'all'].map(p => (
                <button
                  key={p} onClick={() => setPeriod(p)}
                  className={`px-5 py-2.5 rounded-lg text-sm font-bold capitalize transition-all duration-200 ${period === p ? 'bg-gradient-to-r from-[#1A3C34] to-[#2C5544] text-white shadow-md' : 'text-[#5C756D] hover:bg-gray-50'}`}
                >
                    {p === 'all' ? 'All Time' : p}
                </button>
            ))}
        </div>
      </div>

      {/* 1. KEY METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <StatCard
          title="Total Revenue"
          value={`₹${financials.revenue?.toLocaleString() || 0}`}
          icon={TrendingUp}
          gradient="from-green-500 to-emerald-600"
          bgColor="bg-gradient-to-br from-green-50 to-emerald-50"
        />
        <StatCard
          title="Total Orders"
          value={counts.orders}
          icon={ShoppingBag}
          gradient="from-blue-500 to-cyan-600"
          bgColor="bg-gradient-to-br from-blue-50 to-cyan-50"
        />
        <StatCard
          title="Total Books"
          value={counts.books}
          icon={BookOpen}
          gradient="from-purple-500 to-pink-600"
          bgColor="bg-gradient-to-br from-purple-50 to-pink-50"
        />

        <div className="p-6 bg-gradient-to-br from-white to-orange-50 border-2 border-[#E3E8E5] rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex justify-between items-start">
            <div>
                <p className="text-xs font-bold text-[#5C756D] uppercase tracking-wide">Total Users</p>
                <h3 className="text-3xl font-bold text-[#1A3C34] mt-2">{counts.users}</h3>
                <button onClick={downloadUsers} className="mt-3 text-xs font-bold text-[#1A3C34] flex items-center gap-1.5 hover:gap-2 transition-all duration-200 hover:text-orange-700">
                    <Download className="w-3.5 h-3.5" /> Download CSV
                </button>
            </div>
            <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-xl shadow-md">
              <Users className="w-6 h-6" />
            </div>
        </div>
      </div>

      {/* 2. CHARTS & LOW STOCK */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">

        {/* REVENUE GRAPH */}
        <div className="lg:col-span-2 bg-gradient-to-br from-white to-green-50/30 p-8 rounded-3xl border border-[#E3E8E5] shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-[#1A3C34]">Sales Trend</h3>
              <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                Revenue Analytics
              </div>
            </div>
            <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.trend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E3E8E5" vertical={false} />
                        <XAxis
                          dataKey="_id"
                          axisLine={false}
                          tickLine={false}
                          tick={{fill:'#5C756D', fontSize:12, fontWeight: 500}}
                          dy={10}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{fill:'#5C756D', fontSize:12, fontWeight: 500}}
                          dx={-10}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1A3C34',
                            border: 'none',
                            borderRadius: '12px',
                            color: 'white',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            padding: '8px 12px'
                          }}
                          labelStyle={{ color: '#10B981' }}
                          cursor={{ fill: 'rgba(16, 185, 129, 0.1)' }}
                        />
                        <Bar
                          dataKey="revenue"
                          fill="url(#colorRevenue)"
                          radius={[8, 8, 0, 0]}
                        />
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10B981" stopOpacity={1}/>
                            <stop offset="100%" stopColor="#1A3C34" stopOpacity={0.8}/>
                          </linearGradient>
                        </defs>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* ⚠️ LOW STOCK ALERTS CARD */}
        <div className="bg-gradient-to-br from-white to-red-50/30 p-7 rounded-3xl border-2 border-red-100 shadow-lg flex flex-col">
            <div className="flex items-center gap-2 mb-5">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-red-700">Low Stock Alerts</h3>
            </div>
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[240px] pr-2 custom-scrollbar">
                {(analytics.lowStock || []).length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center py-8">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-3">
                          <span className="text-3xl">✓</span>
                        </div>
                        <p className="text-sm text-gray-500 font-medium">All stock levels are healthy!</p>
                    </div>
                ) : (
                    analytics.lowStock.map((book, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-white rounded-xl border border-red-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                            <div className="flex-1">
                                <p className="font-bold text-[#1A3C34] text-sm font-mono">{book.inventory?.sku || "NO-SKU"}</p>
                                <p className="text-xs text-[#5C756D] truncate max-w-[140px] mt-0.5">{book.title}</p>
                            </div>
                            <span className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg text-xs font-bold shadow-sm">
                                {book.inventory?.stock} Left
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
      </div>

      {/* 3. DETAILS TABLES */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* BEST SELLING BOOKS (With SKU) */}
        <div className="bg-gradient-to-br from-white to-blue-50/20 border-2 border-[#E3E8E5] rounded-3xl shadow-lg p-7">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-[#1A3C34]">Best Selling Books</h3>
              <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                Top {(analytics.topBooks || []).length}
              </div>
            </div>
            <div className="space-y-3">
                {(analytics.topBooks || []).map((book, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-white rounded-xl hover:bg-gradient-to-r hover:from-white hover:to-green-50/50 transition-all duration-200 shadow-sm hover:shadow-md border border-[#E3E8E5]">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-[#1A3C34] to-[#2C5544] text-white font-bold rounded-xl text-sm shadow-md">{i+1}</div>
                            <div>
                                <p className="font-bold text-[#1A3C34] text-sm font-mono">{book.sku || "UNKNOWN"}</p>
                                <p className="text-xs text-[#5C756D] truncate max-w-[200px] mt-0.5">{book.title}</p>
                            </div>
                        </div>
                        <div className="text-right">
                             <span className="block font-bold text-[#1A3C34] text-base">₹{book.revenue.toLocaleString()}</span>
                             <span className="text-xs text-[#5C756D] font-medium">{book.sold} sold</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* PAYMENT & LOCATIONS */}
        <div className="bg-gradient-to-br from-white to-purple-50/20 border-2 border-[#E3E8E5] rounded-3xl shadow-lg p-7 flex flex-col gap-6">

            {/* Payment Pie */}
            <div>
                <h3 className="text-lg font-bold text-[#1A3C34] mb-4">Payment Methods</h3>
                <div className="flex items-center gap-6 bg-white p-4 rounded-2xl border border-[#E3E8E5]">
                    <div className="h-[110px] w-[110px]">
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie data={paymentData} innerRadius={32} outerRadius={50} paddingAngle={3} dataKey="value">
                                    {paymentData.map((_, i) => <Cell key={`cell-${i}`} fill={COLORS[i]} />)}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="space-y-2 text-sm">
                        {paymentData.map((d,i) => (
                            <div key={i} className="flex items-center gap-2.5">
                                <span className="w-3 h-3 rounded-full shadow-sm" style={{background: COLORS[i]}}/>
                                <span className="text-[#5C756D] font-medium">{d.name}: <b className="text-[#1A3C34]">{d.value}</b></span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="border-t-2 border-[#F4F7F5] pt-5">
                <h3 className="text-lg font-bold text-[#1A3C34] mb-4">Top Locations</h3>
                <div className="space-y-3">
                    {(analytics.locations || []).slice(0,3).map((loc, i) => (
                        <div key={i} className="flex justify-between items-center p-3 bg-white rounded-xl border border-[#E3E8E5] hover:shadow-md transition-shadow duration-200">
                            <span className="flex items-center gap-2 text-[#2C3E38] font-semibold text-sm">
                              <div className="p-1.5 bg-green-100 rounded-lg">
                                <MapPin className="w-4 h-4 text-green-700"/>
                              </div>
                              {loc._id}
                            </span>
                            <span className="font-bold text-[#1A3C34] text-base">₹{loc.revenue.toLocaleString()}</span>
                        </div>
                    ))}
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, gradient, bgColor }) {
    return (
        <div className={`p-6 ${bgColor} border-2 border-[#E3E8E5] rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex justify-between items-start group`}>
            <div>
                <p className="text-xs font-bold text-[#5C756D] uppercase tracking-wide">{title}</p>
                <h3 className="text-3xl font-bold text-[#1A3C34] mt-2 group-hover:scale-105 transition-transform duration-200">{value}</h3>
            </div>
            <div className={`p-3 bg-gradient-to-br ${gradient} text-white rounded-xl shadow-md group-hover:scale-110 transition-transform duration-200`}>
                <Icon className="w-6 h-6" />
            </div>
        </div>
    );
}