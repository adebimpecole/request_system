import React, { useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

const areaData = [
  { month: "Jan", requests: 8, amount: 12400 },
  { month: "Feb", requests: 15, amount: 24800 },
  { month: "Mar", requests: 11, amount: 18600 },
  { month: "Apr", requests: 22, amount: 35200 },
  { month: "May", requests: 18, amount: 29400 },
  { month: "Jun", requests: 28, amount: 47600 },
  { month: "Jul", requests: 24, amount: 41200 },
  { month: "Aug", requests: 32, amount: 56800 },
  { month: "Sep", requests: 27, amount: 48100 },
  { month: "Oct", requests: 35, amount: 62400 },
  { month: "Nov", requests: 30, amount: 53200 },
  { month: "Dec", requests: 42, amount: 76800 },
];

const pieData = [
  { name: "Operations", value: 35, color: "#6366f1" },
  { name: "IT & Equipment", value: 28, color: "#10b981" },
  { name: "Travel", value: 18, color: "#f59e0b" },
  { name: "Training", value: 12, color: "#3b82f6" },
  { name: "Other", value: 7, color: "#8b5cf6" },
];

const topDepts = [
  { dept: "Operations", requests: 42, amount: 68400, color: "#6366f1" },
  { dept: "IT & Equipment", requests: 35, amount: 54200, color: "#10b981" },
  { dept: "Sales", requests: 28, amount: 41800, color: "#f59e0b" },
  { dept: "HR", requests: 18, amount: 26400, color: "#3b82f6" },
  { dept: "Finance", requests: 12, amount: 19600, color: "#8b5cf6" },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3">
        <p className="font-semibold text-slate-800 mb-1">{label}</p>
        {payload.map((p) => (
          <p key={p.name} className="text-sm text-slate-600">
            <span className="font-medium" style={{ color: p.color }}>{p.name}: </span>
            {p.name === "amount" ? `$${p.value.toLocaleString()}` : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const Analytics = () => {
  const [year, setYear] = useState("2024");

  const stats = [
    { label: "Total Budget", value: "$500,000", icon: "💰", color: "bg-brand-50 text-brand-600", change: "" },
    { label: "Disbursed", value: "$192,400", icon: "📤", color: "bg-red-50 text-red-600", change: "38.5%" },
    { label: "Remaining", value: "$307,600", icon: "🏦", color: "bg-emerald-50 text-emerald-600", change: "61.5%" },
    { label: "Requests This Year", value: "290", icon: "📋", color: "bg-violet-50 text-violet-600", change: "+28% YoY" },
  ];

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
          {["2024", "2023", "2022", "2021"].map((y) => <option key={y}>{y}</option>)}
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
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.color} text-xl`}>
                {s.icon}
              </div>
          </div>
        ))}
      </div>

      {/* Budget progress */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-slate-900">Budget Utilization</h2>
          <span className="text-sm font-semibold text-slate-500">38.5% used</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
          <div className="h-4 rounded-full bg-gradient-to-r from-brand-500 to-brand-400 transition-all duration-500" style={{ width: "38.5%" }} />
        </div>
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-brand-500" />
            <span className="text-xs text-slate-500">Disbursed: $192,400</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-slate-200" />
            <span className="text-xs text-slate-500">Available: $307,600</span>
          </div>
        </div>
      </div>

      {/* Area Chart */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-bold text-slate-900">Requests Per Month</h2>
            <p className="text-xs text-slate-500 mt-0.5">Volume and amount disbursed over {year}</p>
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
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
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
        </div>

        {/* Top departments */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
          <h2 className="font-bold text-slate-900 mb-6">Top Departments by Spend</h2>
          <div className="space-y-4">
            {topDepts.map((d, i) => (
              <div key={d.dept}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: d.color }}>{i + 1}</span>
                    <span className="text-sm font-medium text-slate-700">{d.dept}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">${d.amount.toLocaleString()}</p>
                    <p className="text-xs text-slate-400">{d.requests} requests</p>
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div className="h-1.5 rounded-full transition-all" style={{ width: `${(d.amount / 68400) * 100}%`, backgroundColor: d.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
