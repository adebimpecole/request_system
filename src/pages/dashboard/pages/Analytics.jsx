import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, LabelList,
} from "recharts";
import {
  ArrowRight, CalendarDays, ChartColumn, CircleCheck, CircleX, Clock, FileText, Lock,
  PlusCircle, MessageCircleQuestion,
} from "lucide-react";
import api from "../../../utilis/api";
import { getCompanyId, getId, getRole } from "../../../utilis/storage";
import { getSocket } from "../../../utilis/socket";
import { Card, EmptyState, PageHeader, SelectField, Spinner, StatGrid, initials, money, shortRef } from "../../../components/ui/PageKit";

// brand-500, emerald-500, amber-500, sky-500, red-500, navy-800, brand-300, emerald-300
const PALETTE = ["#6366f1", "#10b981", "#f59e0b", "#0ea5e9", "#ef4444", "#1f2566", "#a5b4fc", "#6ee7b7"];
const SERIES = [
  { key: "total", label: "Total", color: "#6366f1" },
  { key: "approved", label: "Approved", color: "#10b981" },
  { key: "pending", label: "Pending", color: "#f59e0b" },
  { key: "rejected", label: "Rejected", color: "#ef4444" },
];
const PERIODS = [
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
  { value: "365", label: "Last 12 months" },
];
const DAY = 86400000;

const amountOf = (r) => parseFloat(r.amount) || 0;
const timeOf = (r) => new Date(r.date_created).getTime();
// Statuses still moving through the chain count as pending
const statusGroup = (status) => {
  const s = (status || "pending").toLowerCase();
  if (s === "approved") return "approved";
  if (s === "rejected" || s === "closed") return "rejected";
  return "pending";
};
const short = (n) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K` : String(Math.round(n)));
const ago = (iso) => {
  const s = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (s < 3600) return `${Math.max(1, Math.floor(s / 60))}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

// Time buckets for the overview chart: days up to a month, weeks for 90 days, months for a year.
const buildBuckets = (days) => {
  const now = new Date();
  if (days === 365) {
    return Array.from({ length: 12 }, (_, i) => {
      const start = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
      const end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
      return { start: start.getTime(), end: end.getTime(), label: start.toLocaleDateString("en-US", { month: "short" }) };
    });
  }
  const size = days > 31 ? 7 : 1;
  const count = Math.ceil(days / size);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() + DAY;
  return Array.from({ length: count }, (_, i) => {
    const end = today - (count - 1 - i) * size * DAY;
    const start = end - size * DAY;
    return { start, end, label: new Date(start).toLocaleDateString("en-US", { month: "short", day: "numeric" }) };
  });
};

const ChartTooltip = ({ active, payload, label }) =>
  active && payload?.length ? (
    <div className="bg-white ring-1 ring-slate-200 rounded-xl shadow-lg px-3 py-2">
      <p className="text-xs font-semibold text-navy-900 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="text-xs text-slate-600 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          {p.name}: <span className="font-semibold text-navy-900">{p.value}</span>
        </p>
      ))}
    </div>
  ) : null;

const CardTitle = ({ title, sub, aside }) => (
  <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
    <div>
      <h2 className="font-bold text-navy-900 text-[15px]">{title}</h2>
      {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
    </div>
    {aside}
  </div>
);

const KPI_TONES = {
  total: { icon: FileText, cls: "bg-brand-50 text-brand-600" },
  approved: { icon: CircleCheck, cls: "bg-emerald-50 text-emerald-600" },
  pending: { icon: Clock, cls: "bg-amber-50 text-amber-600" },
  rejected: { icon: CircleX, cls: "bg-red-50 text-red-600" },
};

const AUDIT_TONES = {
  "request.created": { icon: PlusCircle, cls: "bg-brand-50 text-brand-600" },
  "request.approved": { icon: CircleCheck, cls: "bg-emerald-50 text-emerald-600" },
  "request.rejected": { icon: CircleX, cls: "bg-red-50 text-red-600" },
  "request.clarification_requested": { icon: MessageCircleQuestion, cls: "bg-amber-50 text-amber-600" },
};

const Analytics = () => {
  const role = getRole();
  const companyId = getCompanyId();
  const myId = getId();

  const [requests, setRequests] = useState([]);
  const [company, setCompany] = useState({});
  const [audit, setAudit] = useState(null); // admin-only feed; null when unavailable
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30");

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
        setCompany(companyRes.data || {});
      } catch (e) {
        console.error(e);
      } finally {
        if (isInitial) setLoading(false);
      }
      if (role === "admin") {
        api.get(`/audit/company/${companyId}`)
          .then((res) => setAudit(res.data?.entries || []))
          .catch(() => setAudit(null));
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
      <Card>
        <EmptyState icon={Lock} title="Analytics isn't available for your role" desc="Ask a department head or admin for spending reports." />
      </Card>
    );
  }

  if (loading) return <div className="flex items-center justify-center h-72"><Spinner className="w-8 h-8" /></div>;

  const days = Number(period);
  const periodLabel = days === 365 ? "12 months" : `${days} days`;
  const now = Date.now();
  const start = now - days * DAY;
  const inPeriod = requests.filter((r) => timeOf(r) >= start);
  const previous = requests.filter((r) => timeOf(r) >= start - days * DAY && timeOf(r) < start);

  const countBy = (list, key) => (key === "total" ? list.length : list.filter((r) => statusGroup(r.status) === key).length);
  const change = (key) => {
    const prev = countBy(previous, key);
    return prev === 0 ? null : Math.round(((countBy(inPeriod, key) - prev) / prev) * 100);
  };

  // Overview chart
  const overview = buildBuckets(days).map((b) => {
    const list = requests.filter((r) => timeOf(r) >= b.start && timeOf(r) < b.end);
    return { label: b.label, ...Object.fromEntries(SERIES.map((s) => [s.key, countBy(list, s.key)])) };
  });

  // Requests by department
  const deptCounts = {};
  inPeriod.forEach((r) => { const d = r.department || "Unassigned"; deptCounts[d] = (deptCounts[d] || 0) + 1; });
  const deptData = Object.entries(deptCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value], i) => ({ name, value, color: PALETTE[i % PALETTE.length] }));

  // Approved spending by category
  const approved = inPeriod.filter((r) => statusGroup(r.status) === "approved");
  const catTotals = {};
  approved.forEach((r) => { const c = r.category || "Uncategorized"; catTotals[c] = (catTotals[c] || 0) + amountOf(r); });
  const catData = Object.entries(catTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value], i) => ({ name, value, color: PALETTE[i % PALETTE.length] }));

  // Budget (all-time approved spend against the organization's total budget)
  const budget = company?.company?.budget || 0;
  const disbursed = requests.filter((r) => statusGroup(r.status) === "approved").reduce((s, r) => s + amountOf(r), 0);
  const utilization = budget > 0 ? Math.min(100, (disbursed / budget) * 100) : 0;

  // Top requesters
  const nameById = Object.fromEntries((company.employees || []).map((e) => [String(e._id), e.name]));
  const byUser = {};
  inPeriod.forEach((r) => { const u = String(r.user_id); byUser[u] = (byUser[u] || 0) + 1; });
  const topRequesters = Object.entries(byUser)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, count]) => ({ id, count, name: id === myId ? "You" : nameById[id] || "Former member" }));

  // Recent activity: the audit feed for admins, otherwise the latest requests
  const activity = audit
    ? audit.slice(0, 5).map((e) => {
        const t = AUDIT_TONES[e.action] || { icon: FileText, cls: "bg-slate-100 text-slate-500" };
        return { key: e._id, icon: t.icon, cls: t.cls, title: e.message, sub: e.actor_name || "System", time: e.createdAt, raw: true };
      })
    : [...requests].sort((a, b) => timeOf(b) - timeOf(a)).slice(0, 5).map((r) => {
        const g = statusGroup(r.status);
        const t = KPI_TONES[g];
        return { key: r.request_id, icon: t.icon, cls: t.cls, title: `${shortRef(r.request_id)} · ${r.title}`, sub: `${r.department || "—"} · ${g}`, time: r.date_created };
      });

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        eyebrow="Analytics"
        title="Analytics"
        desc="Get real-time insights into your financial requests, spending and team performance."
        action={<SelectField label="Period" icon={CalendarDays} value={period} onChange={setPeriod} options={PERIODS} className="w-44" />}
      />

      {requests.length === 0 ? (
        <Card><EmptyState icon={ChartColumn} title="No requests yet" desc="Analytics will populate once requests start coming in." /></Card>
      ) : (
        <>
          <StatGrid
            items={SERIES.map((s) => ({
              label: s.key === "total" ? "Total requests" : s.label,
              value: countBy(inPeriod, s.key),
              trend: change(s.key),
              invert: s.key === "rejected",
              sub: `vs. previous ${periodLabel}`,
              icon: KPI_TONES[s.key].icon,
              tone: { total: "brand", approved: "emerald", pending: "amber", rejected: "red" }[s.key],
            }))}
          />

          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_20rem] gap-6 items-stretch">
          {/* Overview */}
          <Card className="p-5 sm:p-6 min-w-0">
            <CardTitle
              title="Requests overview"
              sub="Track the volume and status of financial requests over time."
              aside={
                <div className="flex flex-wrap items-center gap-4">
                  {SERIES.map((s) => (
                    <span key={s.key} className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />{s.label}
                    </span>
                  ))}
                </div>
              }
            />
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={overview} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    {SERIES.map((s) => (
                      <linearGradient key={s.key} id={`fill-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={s.color} stopOpacity={0.18} />
                        <stop offset="100%" stopColor={s.color} stopOpacity={0} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} interval="preserveStartEnd" minTickGap={24} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  {SERIES.map((s) => (
                    <Area key={s.key} type="monotone" dataKey={s.key} name={s.label} stroke={s.color} strokeWidth={2} fill={`url(#fill-${s.key})`} />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Budget */}
          <Card className="p-5 sm:p-6 flex flex-col">
            <CardTitle title="Budget" sub="Approved spending against your total budget." />
            {budget > 0 ? (
              <>
                <p className="text-xs text-slate-500">Remaining</p>
                <p className="text-3xl font-bold tracking-tight text-navy-900 tabular-nums">{money(Math.max(budget - disbursed, 0))}</p>
                <div className="mt-4 h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className={`h-full rounded-full ${utilization > 90 ? "bg-red-500" : utilization > 75 ? "bg-amber-500" : "bg-brand-500"}`} style={{ width: `${utilization}%` }} />
                </div>
                <p className="mt-1.5 text-xs text-slate-500">{utilization.toFixed(1)}% of the budget used</p>
                <dl className="mt-auto pt-5 space-y-2.5 text-sm">
                  {[
                    ["Total budget", money(budget)],
                    ["Approved spending", money(disbursed)],
                    [`Approved, ${periodLabel === "12 months" ? "last 12 months" : `last ${periodLabel}`}`, money(approved.reduce((t, r) => t + amountOf(r), 0))],
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between gap-3 border-t border-slate-100 pt-2.5">
                      <dt className="text-slate-500">{k}</dt>
                      <dd className="font-semibold text-navy-900 tabular-nums">{v}</dd>
                    </div>
                  ))}
                </dl>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                <p className="text-sm font-semibold text-navy-900">No budget set</p>
                <p className="text-xs text-slate-500 mt-1">
                  {role === "admin" ? <>Set one in <Link to="/employeedashboard/settings" className="text-brand-600 font-semibold">Settings → Organization</Link>.</> : "An admin can set one in Settings."}
                </p>
              </div>
            )}
          </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* By department */}
            <Card className="p-5 sm:p-6 flex flex-col">
              <CardTitle title="Requests by department" sub="Which departments are making the most requests?" />
              {deptData.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-16">No requests in this period.</p>
              ) : (
                <div className="flex-1 flex flex-col sm:flex-row items-center gap-6">
                  <div className="relative w-44 h-44 flex-shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={deptData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={84} paddingAngle={2} stroke="none">
                          {deptData.map((d) => <Cell key={d.name} fill={d.color} />)}
                        </Pie>
                        <Tooltip formatter={(v, n) => [`${v} request${v === 1 ? "" : "s"}`, n]} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-2xl font-extrabold text-navy-900">{inPeriod.length}</span>
                      <span className="text-[11px] text-slate-400">Total requests</span>
                    </div>
                  </div>
                  <ul className="flex-1 w-full space-y-2.5">
                    {deptData.slice(0, 6).map((d) => (
                      <li key={d.name} className="flex items-center gap-2.5 text-xs">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                        <span className="flex-1 text-slate-600 capitalize truncate">{d.name}</span>
                        <span className="font-semibold text-navy-900 w-6 text-right">{d.value}</span>
                        <span className="text-slate-400 w-9 text-right">{Math.round((d.value / inPeriod.length) * 100)}%</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>

            {/* Spending by category */}
            <Card className="p-5 sm:p-6">
              <CardTitle
                title="Spending by category"
                sub="Breakdown of total approved spending."
              />
              {catData.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-16">No approved spending in this period.</p>
              ) : (
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={catData} margin={{ top: 18, right: 5, left: -15, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} interval={0} />
                      <YAxis tickFormatter={short} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                      <Tooltip formatter={(v) => [money(v), "Approved"]} cursor={{ fill: "#f8fafc" }} />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={44}>
                        {catData.map((c) => <Cell key={c.name} fill={c.color} />)}
                        <LabelList dataKey="value" position="top" formatter={short} style={{ fontSize: 11, fontWeight: 600, fill: "#161b52" }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>

            {/* Recent activity */}
            <Card className="p-5 sm:p-6 flex flex-col">
              <CardTitle title="Recent activity" sub={audit ? "Latest actions across your organization." : "Latest requests across your organization."} />
              {activity.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-10">Nothing yet.</p>
              ) : (
                <ul className="space-y-3.5 flex-1">
                  {activity.map((a) => (
                    <li key={a.key} className="flex items-start gap-3">
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${a.cls}`}><a.icon className="w-4 h-4" /></span>
                      <span className="flex-1 min-w-0">
                        <span className={`block text-xs font-semibold text-navy-900 truncate ${a.raw ? "" : "capitalize"}`}>{a.title}</span>
                        <span className="block text-[11px] text-slate-400 truncate capitalize">{a.sub}</span>
                      </span>
                      <span className="text-[11px] text-slate-400 whitespace-nowrap">{ago(a.time)}</span>
                    </li>
                  ))}
                </ul>
              )}
              <Link to={audit ? "/employeedashboard/activity" : "/employeedashboard/requests"} className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700">
                {audit ? "View all activity" : "View all requests"} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Card>

            {/* Top requesters */}
            <Card className="p-5 sm:p-6 flex flex-col">
              <CardTitle title="Top requesters" sub="Team members who have submitted the most requests." />
              {topRequesters.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-10">No requests in this period.</p>
              ) : (
                <ol className="space-y-3 flex-1">
                  {topRequesters.map((u, i) => (
                    <li key={u.id} className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                      <span className="w-8 h-8 rounded-full bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center">{initials(u.name)}</span>
                      <span className="flex-1 text-sm text-navy-900 capitalize truncate">{u.name}</span>
                      <span className="text-sm font-bold text-navy-900">{u.count}</span>
                    </li>
                  ))}
                </ol>
              )}
              <Link to="/employeedashboard/team" className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700">
                View team <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;
