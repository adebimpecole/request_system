import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getFormattedDate } from "../../../utilis/functions";
import { setToogleRequestModal } from "../../../reduxtoolkit/features/modal/modalSlice";
import { getCompanyId, getRole, getToken } from "../../../utilis/storage";

const statusBadge = (status) => {
  const s = (status || "pending").toLowerCase();
  const map = {
    approved: "status-approved",
    rejected: "status-rejected",
    pending: "status-pending",
    "in-review": "status-review",
    vetted: "status-review",
  };
  const cls = map[s] || "status-pending";
  return <span className={cls}><span className="w-1.5 h-1.5 rounded-full bg-current inline-block" />{status || "Pending"}</span>;
};

const Requests = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [requestList, setRequestList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const toggleRequestModal = useSelector((state) => state.modal.toggleRequestModal);

  useEffect(() => {
    const fetchRequests = async () => {
      const id = getCompanyId();
      const role = getRole();
      const token = getToken();
      try {
        const res = await axios.get(`http://localhost:5000/api/company/requests/${id}`, {
          params: { role },
          headers: { Authorization: `Bearer ${token}` },
        });
        setRequestList(res.data || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchRequests();
  }, []);

  const filtered = requestList.filter((r) => {
    const matchFilter = filter === "all" || (r.status || "pending").toLowerCase() === filter;
    const matchSearch = !search || r.title?.toLowerCase().includes(search.toLowerCase()) || r.category?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const counts = {
    all: requestList.length,
    approved: requestList.filter(r => r.status?.toLowerCase() === "approved").length,
    pending: requestList.filter(r => !r.status || r.status?.toLowerCase() === "pending").length,
    rejected: requestList.filter(r => r.status?.toLowerCase() === "rejected").length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Requests</h1>
          <p className="text-slate-500 text-sm mt-1">Manage and track all financial requisitions</p>
        </div>
        <button
          onClick={() => dispatch(setToogleRequestModal(!toggleRequestModal))}
          className="btn-primary self-start sm:self-auto"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Request
        </button>
      </div>

      {/* Filter tabs + search */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl flex-shrink-0">
            {Object.entries(counts).map(([key, count]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all duration-150 ${filter === key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                {key} <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${filter === key ? "bg-brand-100 text-brand-700" : "bg-slate-200 text-slate-500"}`}>{count}</span>
              </button>
            ))}
          </div>
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              placeholder="Search requests..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-300 transition-all"
            />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="p-12 text-center">
            <svg className="w-6 h-6 animate-spin text-brand-500 mx-auto" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <p className="font-semibold text-slate-700 mb-1">No requests found</p>
            <p className="text-sm text-slate-400">Try adjusting your search or filter criteria.</p>
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
                  <th className="px-4 py-3.5" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((data, i) => (
                  <tr
                    key={data.requestid || i}
                    onClick={() => navigate(`/employeedashboard/request-details/${data.requestid}`)}
                    className="border-b border-slate-50 hover:bg-slate-50/80 cursor-pointer transition-colors group"
                  >
                    <td className="px-6 py-4 text-slate-400 text-xs font-medium">{i + 1}</td>
                    <td className="px-4 py-4 text-slate-500 text-xs whitespace-nowrap">{getFormattedDate(data.dateCreated)}</td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">{data.category}</span>
                    </td>
                    <td className="px-4 py-4 font-semibold text-slate-800 capitalize group-hover:text-brand-600 transition-colors">{data.title}</td>
                    <td className="px-4 py-4">{statusBadge(data.status)}</td>
                    <td className="px-6 py-4 text-right font-bold text-slate-900">${parseFloat(data.amount || 0).toLocaleString()}</td>
                    <td className="px-4 py-4">
                      <svg className="w-4 h-4 text-slate-300 group-hover:text-brand-500 transition-colors ml-auto" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filtered.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-500">Showing <span className="font-semibold text-slate-700">{filtered.length}</span> of <span className="font-semibold text-slate-700">{requestList.length}</span> requests</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Requests;
