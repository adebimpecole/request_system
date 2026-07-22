import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "../../../utilis/api";
import { getFormattedDate } from "../../../utilis/functions";
import { setToogleRequestModal } from "../../../reduxtoolkit/features/modal/modalSlice";
import { getId, getCompanyId, getRole } from "../../../utilis/storage";

const STATUS_FILTERS = ["all", "approved", "pending", "rejected"];

const statusBadge = (status) => {
  const s = (status || "pending").toLowerCase();
  const map = {
    approved: "status-approved",
    rejected: "status-rejected",
    pending: "status-pending",
    "in-review": "status-review",
    under_review: "status-review",
    vetted: "status-review",
  };
  const cls = map[s] || "status-pending";
  return (
    <span className={cls}>
      <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" />
      {status || "Pending"}
    </span>
  );
};

const RequestTable = ({ rows, loading, onRowClick }) => {
  if (loading) return (
    <div className="p-12 text-center">
      <svg className="w-6 h-6 animate-spin text-brand-500 mx-auto" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  );

  if (rows.length === 0) return (
    <div className="p-12 text-center">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
        <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
        </svg>
      </div>
      <p className="font-semibold text-slate-700 mb-1">No requests found</p>
      <p className="text-sm text-slate-400">Try adjusting your filter.</p>
    </div>
  );

  return (
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
          {rows.map((data, i) => (
            <tr
              key={data.request_id || i}
              onClick={() => onRowClick(data.request_id)}
              className="border-b border-slate-50 hover:bg-slate-50/80 cursor-pointer transition-colors group"
            >
              <td className="px-6 py-4 text-slate-400 text-xs font-medium">{i + 1}</td>
              <td className="px-4 py-4 text-slate-500 text-xs whitespace-nowrap">{getFormattedDate(data.date_created)}</td>
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
  );
};

const StatusFilterBar = ({ list, activeFilter, onChange }) => {
  const counts = STATUS_FILTERS.reduce((acc, f) => {
    acc[f] = f === "all" ? list.length : list.filter(r => (r.status || "pending").toLowerCase() === f).length;
    return acc;
  }, {});

  return (
    <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl flex-shrink-0">
      {STATUS_FILTERS.map((f) => (
        <button
          key={f}
          onClick={() => onChange(f)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all duration-150 ${activeFilter === f ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
        >
          {f} <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${activeFilter === f ? "bg-brand-100 text-brand-700" : "bg-slate-200 text-slate-500"}`}>{counts[f]}</span>
        </button>
      ))}
    </div>
  );
};

const Requests = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toggleRequestModal = useSelector((state) => state.modal.toggleRequestModal);

  const role = getRole();
  const myId = getId();
  const isApprover = ["approver", "department_head", "admin"].includes(role);

  const [allRequests, setAllRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // For approvers: top-level tab (personal vs others)
  const [view, setView] = useState("personal"); // "personal" | "others"
  // Status sub-filter per view
  const [personalFilter, setPersonalFilter] = useState("all");
  const [othersFilter, setOthersFilter] = useState("all");

  // For plain requesters: single status filter
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        let res;
        if (isApprover) {
          res = await api.get(`/company/requests/${getCompanyId()}`);
        } else {
          res = await api.get(`/employee/requests/${myId}`);
        }
        setAllRequests(res.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const applySearch = (list) =>
    !search
      ? list
      : list.filter(
          (r) =>
            r.title?.toLowerCase().includes(search.toLowerCase()) ||
            r.category?.toLowerCase().includes(search.toLowerCase())
        );

  const applyStatus = (list, statusFilter) =>
    statusFilter === "all"
      ? list
      : list.filter((r) => (r.status || "pending").toLowerCase() === statusFilter);

  // Split for approver view
  const personal = allRequests.filter((r) => String(r.user_id) === myId);
  const others = allRequests.filter((r) => String(r.user_id) !== myId);

  const visiblePersonal = applySearch(applyStatus(personal, personalFilter));
  const visibleOthers = applySearch(applyStatus(others, othersFilter));

  // Plain requester view
  const visibleRequester = applySearch(applyStatus(allRequests, filter));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Requests</h1>
          <p className="text-slate-500 text-sm mt-1">
            {isApprover ? "Your submissions and requests pending your review" : "Track your financial requisitions"}
          </p>
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

      <div className="bg-white rounded-2xl border border-slate-100 shadow-card">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center gap-4 flex-wrap">
          {isApprover ? (
            /* Top-level view switcher for approvers */
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl flex-shrink-0">
              {[
                { key: "personal", label: "Personal", count: personal.length },
                { key: "others", label: "Others", count: others.length },
              ].map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setView(key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all duration-150 ${view === key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                  {label}{" "}
                  <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${view === key ? "bg-brand-100 text-brand-700" : "bg-slate-200 text-slate-500"}`}>{count}</span>
                </button>
              ))}
            </div>
          ) : (
            <StatusFilterBar list={allRequests} activeFilter={filter} onChange={setFilter} />
          )}

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

        {/* Status sub-filters for approver view */}
        {isApprover && (
          <div className="px-6 py-3 border-b border-slate-100">
            <StatusFilterBar
              list={view === "personal" ? personal : others}
              activeFilter={view === "personal" ? personalFilter : othersFilter}
              onChange={view === "personal" ? setPersonalFilter : setOthersFilter}
            />
          </div>
        )}

        <RequestTable
          loading={loading}
          rows={isApprover ? (view === "personal" ? visiblePersonal : visibleOthers) : visibleRequester}
          onRowClick={(id) => navigate(`/employeedashboard/request-details/${id}`)}
        />

        {/* Footer count */}
        {!loading && (
          <div className="px-6 py-4 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              Showing{" "}
              <span className="font-semibold text-slate-700">
                {isApprover ? (view === "personal" ? visiblePersonal.length : visibleOthers.length) : visibleRequester.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-700">
                {isApprover ? (view === "personal" ? personal.length : others.length) : allRequests.length}
              </span>{" "}
              requests
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Requests;
