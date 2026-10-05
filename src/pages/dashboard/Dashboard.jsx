import React, { useEffect, useState } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ChartColumn, FileText, House, List, ListChecks, LogOut, Menu, Plus, Search, Settings, UserPlus, Users,
} from "lucide-react";
import { setToogleInviteModal } from "../../reduxtoolkit/features/modal/modalSlice";
import InviteMember from "../../components/modal/InviteMember";
import { getDisplayName, getRole, getEmail, getCompanyId, getRefreshToken, clearSession } from "../../utilis/storage";
import { disconnectSocket } from "../../utilis/socket";
import NotificationBell from "../../components/NotificationBell";
import BrandLogo from "../../components/BrandLogo";
import api from "../../utilis/api";
import { NON_REQUESTER_ROLES, canCreateRequests } from "../../utilis/roles";
import { getApproverDesignation } from "../../utilis/functions";

const navItems = [
  { to: "/employeedashboard", end: true, label: "Dashboard", icon: House },
  { to: "/employeedashboard/requests", label: "Requests", icon: FileText },
  { to: "/employeedashboard/analytics", label: "Analytics", roles: NON_REQUESTER_ROLES, icon: ChartColumn },
  { to: "/employeedashboard/team", label: "Team", roles: NON_REQUESTER_ROLES, icon: Users },
  { to: "/employeedashboard/activity", label: "Activity Log", roles: ["admin"], icon: List },
  { to: "/employeedashboard/settings", label: "Settings", icon: Settings },
];

// App shell shared by the dashboard pages and the setup wizard: a fixed sidebar,
// a top bar, and a main area that scrolls on its own.
const Dashboard = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const toggleInviteModal = useSelector((state) => state.modal.toggleInviteModal);

  const user = getDisplayName() || "User";
  const role = getRole();
  const visibleNavItems = navItems.filter((item) => !item.roles || item.roles.includes(role));

  // Admins keep a way back into setup until it's finished or skipped
  // (SetUp stores its progress under "setupStage" and clears it on exit).
  const onSetup = location.pathname === "/setup";
  const showSetup = role === "admin" && (onSetup || localStorage.getItem("setupStage") !== null);

  const [approversDoc, setApproversDoc] = useState(null);
  useEffect(() => {
    if (role === "requester") return; // only approvers can hold a funding/verification seat
    api.get(`/company/get_company/${getCompanyId()}`)
      .then((res) => setApproversDoc(res.data?.approvers || null))
      .catch(() => {});
  }, [role]);
  const approverLabel = getApproverDesignation(getEmail(), approversDoc);

  const handleLogout = async () => {
    const refreshToken = getRefreshToken();
    try {
      if (refreshToken) await api.post("/auth/logout", { refreshToken });
    } catch (e) { console.error(e); }
    finally {
      disconnectSocket();
      clearSession();
      navigate("/login");
    }
  };

  const initials = user.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  // Top-bar search opens the Requests page filtered by the query
  const [query, setQuery] = useState("");
  const onSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/employeedashboard/requests?q=${encodeURIComponent(q)}` : "/employeedashboard/requests");
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      isActive ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
    }`;

  const sidebar = (
    <div className="relative flex flex-col h-full overflow-hidden">
      <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-brand-500/20 blur-3xl pointer-events-none" aria-hidden="true" />

      {/* Logo */}
      <div className="relative px-5 py-6">
        <BrandLogo light to="/employeedashboard" />
      </div>

      {/* Navigation */}
      <nav className="relative flex-1 px-3 space-y-1 overflow-y-auto">
        <p className="text-white/30 text-[11px] font-semibold uppercase tracking-widest px-3 mb-2">Menu</p>
        {showSetup && (
          <NavLink to="/setup" onClick={() => setMobileOpen(false)} className={linkClass}>
            <ListChecks className="w-[18px] h-[18px]" />
            Setup
            {!onSetup && <span className="ml-auto w-2 h-2 rounded-full bg-amber-400" title="Setup not finished" />}
          </NavLink>
        )}
        {visibleNavItems.map(({ to, end, label, icon: Icon }) => (
          <NavLink key={to} to={to} end={end} onClick={() => setMobileOpen(false)} className={linkClass}>
            <Icon className="w-[18px] h-[18px]" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Create request / invite CTAs */}
      <div className="relative px-3 pb-3 pt-4 space-y-2">
        {canCreateRequests(role) && <button
          onClick={() => { navigate("/employeedashboard/requests/new"); setMobileOpen(false); }}
          className="w-full flex items-center justify-center gap-2 h-10 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-sm font-semibold transition-colors shadow-lg shadow-navy-950/40"
        >
          <Plus className="w-4 h-4" />
          New Request
        </button>}
        <button
          onClick={() => { dispatch(setToogleInviteModal(true)); setMobileOpen(false); }}
          className="w-full flex items-center justify-center gap-2 h-10 bg-white/10 hover:bg-white/15 text-white rounded-lg text-sm font-semibold transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Invite Member
        </button>
      </div>

      {/* User */}
      <div className="relative m-3 mt-1 flex items-center gap-3 rounded-xl bg-white/5 ring-1 ring-white/10 px-3 py-3">
        <span className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
          {initials}
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-white text-xs font-semibold truncate capitalize">{user}</span>
          <span className="block text-white/50 text-[11px] truncate capitalize">{approverLabel || role}</span>
        </span>
        <button onClick={handleLogout} className="text-white/40 hover:text-red-400 transition-colors" title="Sign out" aria-label="Sign out">
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen font-sans overflow-hidden bg-white">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:flex-shrink-0 bg-navy-gradient">
        {sidebar}
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-navy-950/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-64 h-full bg-navy-gradient shadow-2xl">
            {sidebar}
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-200/70 flex-shrink-0">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <button className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100" onClick={() => setMobileOpen(true)} aria-label="Open menu">
              <Menu className="w-5 h-5" />
            </button>
            <form onSubmit={onSearch} role="search" className="flex-1 max-w-md mx-3 lg:mx-0">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="search"
                  aria-label="Search requests"
                  placeholder="Search requests, departments..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="block w-full h-10 rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-navy-900 placeholder:text-slate-400 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </form>
            <div className="flex items-center gap-3">
              <NotificationBell />
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold">
                  {initials}
                </span>
                <span className="hidden sm:block text-sm font-medium text-slate-700 capitalize">{user}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content — scrolls independently of the sidebar */}
        <main className="flex-1 overflow-y-auto">
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            <Outlet />
          </div>
        </main>
      </div>

      {toggleInviteModal && <InviteMember />}
    </div>
  );
};

export default Dashboard;
