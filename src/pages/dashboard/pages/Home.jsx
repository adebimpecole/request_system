import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getFormattedDate } from "../../../utilis/functions";
import { getId, getToken, getDisplayName } from "../../../utilis/storage";

const StatCard = ({ title, value, icon, colorClass, change, up }) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6 flex flex-col gap-4 hover:shadow-card-hover transition-shadow duration-200">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{title}</p>
        <p className="text-3xl font-extrabold text-slate-900">{value}</p>
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClass}`}>
        {icon}
      </div>
    </div>
    {change && (
      <div className={`flex items-center gap-1 text-xs font-medium ${up ? "text-emerald-600" : "text-red-500"}`}>
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d={up ? "M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" : "M2.25 6L9 12.75l4.306-4.306a11.95 11.95 0 015.814 5.519l2.74 1.22m0 0l-5.94 2.28m5.94-2.28l-2.28-5.941"} />
        </svg>
        {change} vs last month
      </div>
    )}
  </div>
);

const statusBadge = (status) => {
  const map = {
    approved: "status-approved",
    rejected: "status-rejected",
    pending: "status-pending",
    "in-review": "status-review",
    vetted: "status-review",
  };
  const cls = map[(status || "").toLowerCase()] || "status-pending";
  return <span className={cls}><span className="w-1.5 h-1.5 rounded-full bg-current inline-block" />{status || "Pending"}</span>;
};

const Home = () => {
  const navigate = useNavigate();
  const [requestList, setRequestList] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = getDisplayName() || "User";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  useEffect(() => {
    const fetchRequests = async () => {
      const id = getId();
      const token = getToken();
      try {
        const res = await axios.get(`http://localhost:5000/api/employee/requests/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRequestList(res.data || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchRequests();
  }, []);

  const total = requestList.length;
  const approved = requestList.filter(r => r.status?.toLowerCase() === "approved").length;
  const pending = requestList.filter(r => !r.status || r.status?.toLowerCase() === "pending").length;
  const totalAmount = requestList.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">{greeting}, <span className="capitalize">{user.split(" ")[0]}</span></h1>
        <p className="text-slate-500 mt-1">Here's what's happening with your requests today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard
          title="Total Requests"
          value={total}
          colorClass="bg-brand-50 text-brand-600"
          change="+12%"
          up={true}
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" /></svg>}
        />
        <StatCard
          title="Approved"
          value={approved}
          colorClass="bg-emerald-50 text-emerald-600"
          change="+5%"
          up={true}
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard
          title="Pending"
          value={pending}
          colorClass="bg-amber-50 text-amber-600"
          change="-3%"
          up={false}
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard
          title="Total Disbursed"
          value={`$${totalAmount.toLocaleString()}`}
          colorClass="bg-violet-50 text-violet-600"
          change="+8%"
          up={true}
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
      </div>

      {/* Recent Requests */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-900">Recent Requests</h2>
            <p className="text-xs text-slate-500 mt-0.5">Your latest requisition submissions</p>
          </div>
          <button onClick={() => navigate("/employeedashboard/requests")} className="text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 transition-colors">
            View all
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <svg className="w-6 h-6 animate-spin text-brand-500 mx-auto" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : requestList.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <p className="font-semibold text-slate-700 mb-1">No requests yet</p>
            <p className="text-sm text-slate-400">Your recent requests will appear here once you create them.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">#</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Category</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Title</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="text-right px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Amount</th>
                </tr>
              </thead>
              <tbody>
                {requestList.slice(0, 8).map((data, i) => (
                  <tr
                    key={data.requestid || i}
                    onClick={() => navigate(`/employeedashboard/request-details/${data.requestid}`)}
                    className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors group"
                  >
                    <td className="px-6 py-4 text-slate-400 text-xs">{i + 1}</td>
                    <td className="px-4 py-4 text-slate-500 text-xs whitespace-nowrap">{getFormattedDate(data.dateCreated)}</td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">{data.category}</span>
                    </td>
                    <td className="px-4 py-4 font-medium text-slate-800 capitalize group-hover:text-brand-600 transition-colors">{data.title}</td>
                    <td className="px-4 py-4">{statusBadge(data.status)}</td>
                    <td className="px-6 py-4 text-right font-bold text-slate-900">${parseFloat(data.amount || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
