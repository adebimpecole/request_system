import React, { useEffect, useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import api from "../../../utilis/api";
import { getCompanyId, getRole } from "../../../utilis/storage";
import { getSocket } from "../../../utilis/socket";
import {
  LockClosedIcon, ChartBarIcon, CurrencyDollarIcon, ArrowUpRightIcon, BuildingLibraryIcon, ClipboardDocumentListIcon,
} from "../../../components/icons";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const PALETTE = ["#6366f1", "#10b981", "#f59e0b", "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"];

const amountOf = (r) => parseFloat(r.amount) || 0;
const yearOf = (r) => new Date(r.date_created).getFullYear();
const fmtMoney = (n) => `$${Math.round(n || 0).toLocaleString()}`;

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3">
        <p className="font-semibold text-slate-800 mb-1">{label}</p>
        {payload.map((p) => (
          <p key={p.name} className="text-sm text-slate-600">
            <span className="font-medium" style={{ color: p.color }}>{p.name}: </span>
            {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const Spinner = () => (
  <div className="flex items-center justify-center h-72 animate-fade-in">
    <svg className="w-8 h-8 animate-spin text-brand-500" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  </div>
);

const EmptyPanel = ({ icon, title, subtitle }) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-10 text-center animate-fade-in">
    <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">{icon}</div>
    <p className="font-semibold text-slate-700 mb-1">{title}</p>
    <p className="text-sm text-slate-400">{subtitle}</p>
  </div>
);

const Analytics = () => {
  const role = getRole();
  const companyId = getCompanyId();

  const [requests, setRequests] = useState([]);
  const [budget, setBudget] = useState(0);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(String(new Date().getFullYear()));

  useEffect(() => {
    if (role === "requester") {
      setLoading(false);
      return;
    }

    const load = async (isInitial) => {
      if (isInitial) setLoading(true);
      try {
        const [requestsRes, companyRes] = await Promise.all([
          api.get(`/company/requests/${companyId}`).catch((e) =>
            e.response?.status === 404 ? { data: [] } : Promise.reject(e)
          ),
          api.get(`/company/get_company/${companyId}`),
        ]);
        setRequests(requestsRes.data || []);
        setBudget(companyRes.data?.company?.budget || 0);
      } catch (e) {
        console.error(e);
      } finally {
        if (isInitial) setLoading(false);
      }
    };
    load(true);
    
    const socket = getSocket();
    if (!socket) return;
    const onNotification = (payload) => {
      if (payload?.type === "new_request" || payload?.type === "request_update") load(false);
    };
    socket.on("notification", onNotification);
    return () => socket.off("notification", onNotification);
  }, [companyId, role]);

  if (role === "requester") {
    return (
      <EmptyPanel
        icon={<LockClosedIcon className="w-6 h-6 text-slate-400" />}
        title="Analytics isn't available for your role"
        subtitle="Ask a department head or admin for spending reports."
      />
    );
  }

  if (loading) return <Spinner />;

  if (requests.length === 0) {
    return (
      <EmptyPanel
        icon={<ChartBarIcon className="w-6 h-6 text-slate-400" />}
        title="No requests yet"
        subtitle="Analytics will populate once requests start coming in."
      />
    );
  }

  const years = Array.from(new Set(requests.map(yearOf).filter((y) => !Number.isNaN(y))));
  const currentYear = new Date().getFullYear();
  if (!years.includes(currentYear)) years.push(currentYear);
  years.sort((a, b) => b - a);

  const yearRequests = requests.filter((r) => yearOf(r) === Number(year));
  const disbursed = yearRequests.filter((r) => r.status === "approved").reduce((s, r) => s + amountOf(r), 0);
  const remaining = Math.max(budget - disbursed, 0);
  const utilizationPct = budget > 0 ? Math.min(100, (disbursed / budget) * 100) : 0;

  const prevYearCount = requests.filter((r) => yearOf(r) === Number(year) - 1).length;
  const yoyChange = prevYearCount > 0 ? Math.round(((yearRequests.length - prevYearCount) / prevYearCount) * 100) : null;

  const stats = [
    { label: "Total Budget", value: fmtMoney(budget), icon: <CurrencyDollarIcon className="w-5 h-5" />, color: "bg-brand-50 text-brand-600", change: "" },
    { label: "Disbursed", value: fmtMoney(disbursed), icon: <ArrowUpRightIcon className="w-5 h-5" />, color: "bg-red-50 text-red-600", change: budget > 0 ? `${utilizationPct.toFixed(1)}%` : "" },
    { label: "Remaining", value: fmtMoney(remaining), icon: <BuildingLibraryIcon className="w-5 h-5" />, color: "bg-emerald-50 text-emerald-600", change: budget > 0 ? `${(100 - utilizationPct).toFixed(1)}%` : "" },
    { label: "Requests This Year", value: String(yearRequests.length), icon: <ClipboardDocumentListIcon className="w-5 h-5" />, color: "bg-violet-50 text-violet-600", change: yoyChange !== null ? `${yoyChange >= 0 ? "+" : ""}${yoyChange}% YoY` : "" },
  ];

  const areaData = MONTHS.map((month, i) => ({
    month,
    requests: yearRequests.filter((r) => new Date(r.date_created).getMonth() === i).length,
  }));

  const categoryCounts = {};
  yearRequests.forEach((r) => {
    const cat = r.category || "Uncategorized";
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });
  const pieData = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count], i) => ({
      name,
      value: Math.round((count / yearRequests.length) * 100),
      color: PALETTE[i % PALETTE.length],
    }));

  const deptTotals = {};
  yearRequests.forEach((r) => {
    const dept = r.department || "Unassigned";
    if (!deptTotals[dept]) deptTotals[dept] = { requests: 0, amount: 0 };
    deptTotals[dept].requests += 1;
    deptTotals[dept].amount += amountOf(r);
  });
  const topDepts = Object.entries(deptTotals)
    .map(([dept, v]) => ({ dept, ...v }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)
    .map((d, i) => ({ ...d, color: PALETTE[i % PALETTE.length] }));
  const maxDeptAmount = Math.max(1, ...topDepts.map((d) => d.amount));

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Analytics</h1>
          <p className="text-slate-500 text-sm mt-1">Financial overview and spending patterns</p>
        </div>
        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="input-field w-auto text-sm py-2 px-3 self-start sm:self-auto"
        >
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{s.label}</p>
            <div className="flex items-center gap-1 mb-3">
              <p className="text-2xl font-extrabold text-slate-900 mb-1">{s.value}</p>
              {s.change && (
                <span className="text-[11px] font-semibold text-slate-500 rounded-full">{s.change}</span>
              )}
            </div>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.color}`}>
                {s.icon}
              </div>
          </div>
        ))}
      </div>

      {/* Budget progress */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-slate-900">Budget Utilization</h2>
          <span className="text-sm font-semibold text-slate-500">{budget > 0 ? `${utilizationPct.toFixed(1)}% used` : "No budget set"}</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
          <div className="h-4 rounded-full bg-gradient-to-r from-brand-500 to-brand-400 transition-all duration-500" style={{ width: `${utilizationPct}%` }} />
        </div>
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-brand-500" />
            <span className="text-xs text-slate-500">Disbursed: {fmtMoney(disbursed)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-slate-200" />
            <span className="text-xs text-slate-500">Available: {fmtMoney(remaining)}</span>
          </div>
        </div>
      </div>

      {/* Area Chart */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-bold text-slate-900">Requests Per Month</h2>
            <p className="text-xs text-slate-500 mt-0.5">Volume over {year}</p>
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={areaData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="requests" stroke="#6366f1" strokeWidth={2} fill="url(#colorRequests)" name="requests" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie + table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie chart */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
          <h2 className="font-bold text-slate-900 mb-6">Requests by Category</h2>
          {pieData.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-16">No requests in {year} yet.</p>
          ) : (
            <>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" paddingAngle={3}>
                      {pieData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(val) => `${val}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {pieData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-slate-600 truncate">{item.name}</span>
                    <span className="text-xs font-bold text-slate-800 ml-auto">{item.value}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Top departments */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
          <h2 className="font-bold text-slate-900 mb-6">Top Departments by Spend</h2>
          {topDepts.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-16">No requests in {year} yet.</p>
          ) : (
            <div className="space-y-4">
              {topDepts.map((d, i) => (
                <div key={d.dept}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: d.color }}>{i + 1}</span>
                      <span className="text-sm font-medium text-slate-700">{d.dept}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">{fmtMoney(d.amount)}</p>
                      <p className="text-xs text-slate-400">{d.requests} requests</p>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full transition-all" style={{ width: `${(d.amount / maxDeptAmount) * 100}%`, backgroundColor: d.color }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
