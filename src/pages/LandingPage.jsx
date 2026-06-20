import React, { useState } from "react";
import { Link } from "react-router-dom";

const LandingPage = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen font-sans bg-white text-slate-900">

      {/* ── NAVBAR ─────────────────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="font-bold text-[17px] text-slate-900 tracking-tight">FinReq</span>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors px-3 py-2">
              Sign in
            </Link>
            <Link to="/pickuser" className="btn-primary text-sm">
              Get started
            </Link>
          </div>

          <button className="md:hidden p-2 text-slate-600" onClick={() => setMobileOpen(!mobileOpen)}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d={mobileOpen ? "M6 18L18 6M6 6l12 12" : "M3 6h18M3 12h18M3 18h18"} />
            </svg>
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white px-6 py-4 space-y-3">
            <Link to="/login" className="block text-sm font-medium text-slate-700 py-1">Sign in</Link>
            <Link to="/pickuser" className="block btn-primary text-center text-sm">Get started</Link>
          </div>
        )}
      </header>


      {/* ── HERO ───────────────────────────────────────────────── */}
      <section className="pt-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Copy */}
            <div className="">
              <span className="inline-block bg-brand-50 text-brand-700 border border-brand-200 text-xs font-semibold px-3 py-1 rounded-full mb-6 tracking-wide">
                Financial Requisition Platform
              </span>
              <h1 className="text-5xl lg:text-[56px] font-extrabold text-slate-900 leading-[1.1] tracking-tight mb-5">
                Approve requests.<br />
                Control spending.<br />
                <span className="text-brand-600">Stay in control.</span>
              </h1>
              <p className="text-slate-500 text-lg leading-relaxed mb-8 max-w-md">
                A clean, structured system for submitting, reviewing, and approving financial requests — with full visibility at every step.
              </p>
              <div className="flex items-center flex-wrap gap-3">
                <Link to="/pickuser" className="btn-primary">
                  Create your account
                </Link>
                <Link to="/login" className="btn-secondary">
                  Sign in
                </Link>
              </div>
            </div>

            {/* Dashboard mockup */}
            <div className="hidden lg:block">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
                {/* Window bar */}
                <div className="bg-slate-100 border-b border-slate-200 px-4 py-3 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  </div>
                  <div className="flex-1 bg-white border border-slate-200 rounded-md h-6 mx-3 flex items-center px-3">
                    <span className="text-[11px] text-slate-400">app.finreq.io/dashboard</span>
                  </div>
                </div>

                <div className="flex" style={{ height: 340 }}>
                  {/* Sidebar */}
                  <div className="w-44 bg-brand-950 flex flex-col py-4 px-3 gap-1 flex-shrink-0">
                    <div className="flex items-center gap-2 px-2 py-2 mb-3">
                      <div className="w-6 h-6 rounded bg-brand-600 flex-shrink-0" />
                      <span className="text-white text-xs font-bold">FinReq</span>
                    </div>
                    {[
                      { label: "Dashboard", active: true },
                      { label: "Requests", active: false },
                      { label: "Analytics", active: false },
                      { label: "Team", active: false },
                      { label: "Settings", active: false },
                    ].map((item) => (
                      <div key={item.label} className={`flex items-center gap-2 px-2 py-2 rounded-lg ${item.active ? "bg-brand-600" : ""}`}>
                        <div className={`w-3.5 h-3.5 rounded-sm flex-shrink-0 ${item.active ? "bg-white/40" : "bg-white/10"}`} />
                        <span className={`text-[11px] font-medium ${item.active ? "text-white" : "text-white/40"}`}>{item.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Content */}
                  <div className="flex-1 bg-slate-50 p-5 overflow-hidden">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Overview</p>
                    <div className="grid grid-cols-3 gap-2.5 mb-4">
                      {[
                        { label: "Total", val: "148", color: "bg-brand-50 border-brand-100" },
                        { label: "Approved", val: "112", color: "bg-emerald-50 border-emerald-100" },
                        { label: "Pending", val: "36", color: "bg-amber-50 border-amber-100" },
                      ].map((s) => (
                        <div key={s.label} className={`rounded-xl border p-3 ${s.color}`}>
                          <p className="text-[9px] text-slate-500 font-medium mb-1">{s.label}</p>
                          <p className="text-lg font-extrabold text-slate-800">{s.val}</p>
                        </div>
                      ))}
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                      <div className="px-3 py-2.5 border-b border-slate-100">
                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Recent Requests</p>
                      </div>
                      {[
                        { title: "Office Supplies", dept: "Operations", amt: "$840", status: "Approved", sc: "text-emerald-600" },
                        { title: "Q4 Travel Budget", dept: "Sales", amt: "$3,200", status: "Pending", sc: "text-amber-600" },
                        { title: "Software Licences", dept: "IT", amt: "$1,490", status: "Approved", sc: "text-emerald-600" },
                        { title: "Training Materials", dept: "HR", amt: "$560", status: "In Review", sc: "text-brand-600" },
                      ].map((r, i) => (
                        <div key={i} className="flex items-center justify-between px-3 py-2 border-b border-slate-50 last:border-0 hover:bg-slate-50">
                          <div>
                            <p className="text-[10px] font-semibold text-slate-700">{r.title}</p>
                            <p className="text-[9px] text-slate-400">{r.dept}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-bold text-slate-800">{r.amt}</p>
                            <p className={`text-[9px] font-semibold ${r.sc}`}>{r.status}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ── FEATURES ───────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mb-14 flex flex-col items-center">
            <h2 className="text-3xl font-extrabold text-slate-900 m-0 mb-3">Everything your team needs</h2>
            <p className="text-slate-500 text-lg">One platform to handle the full lifecycle of every financial request.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
                  </svg>
                ),
                title: "Structured Requests",
                desc: "Employees submit categorised requests with amount, justification, and supporting details.",
                color: "bg-brand-50 text-brand-600",
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                  </svg>
                ),
                title: "Multi-level Approvals",
                desc: "Define vetting and funding approvers per department. Approvals are tracked and timestamped.",
                color: "bg-emerald-50 text-emerald-600",
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                  </svg>
                ),
                title: "Spending Analytics",
                desc: "Visualise department spend, approval rates, and monthly trends from a single dashboard.",
                color: "bg-violet-50 text-violet-600",
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                ),
                title: "Team Management",
                desc: "Invite employees, assign departments and roles, and manage access from one place.",
                color: "bg-rose-50 text-rose-600",
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                  </svg>
                ),
                title: "Real-time Notifications",
                desc: "Everyone stays informed — submitters, approvers, and admins — at every stage.",
                color: "bg-amber-50 text-amber-600",
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                ),
                title: "Audit Trail",
                desc: "Every action is logged. Full transparency for compliance, reviews, and accountability.",
                color: "bg-sky-50 text-sky-600",
              },
            ].map((f) => (
              <div key={f.title} className="flex flex-col items-center p-6 border border-slate-200 rounded-2xl hover:border-brand-300 hover:shadow-card-hover transition-all duration-200 group">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                  {f.icon}
                </div>
                <h3 className="font-bold text-slate-900 mb-2 text-sm">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed text-center">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ── HOW IT WORKS ───────────────────────────────────────── */}
      <section className="py-24 bg-slate-50 border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="mb-14 flex flex-col items-center">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3">How it works</h2>
            <p className="text-slate-500 text-lg">From submission to disbursement in four clear steps.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { n: "1", title: "Submit", desc: "An employee creates a request — amount, category, and justification." },
              { n: "2", title: "Vet", desc: "A vetting approver reviews the request for accuracy and policy compliance." },
              { n: "3", title: "Approve", desc: "The funding authority confirms or declines the disbursement." },
              { n: "4", title: "Disburse", desc: "Funds are released and all parties receive a notification." },
            ].map((s, i) => (
              <div key={s.n} className="relative">
                {i < 3 && (
                  <div className="hidden lg:block absolute top-5 left-full w-full h-px border-t-2 border-dashed border-slate-300 z-0" style={{ width: "calc(100% - 20px)", left: "60%" }} />
                )}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-10 h-10 rounded-xl bg-brand-600 text-white font-extrabold text-sm flex items-center justify-center mb-4 shadow-sm">
                    {s.n}
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1.5">{s.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed text-center">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ── CTA ────────────────────────────────────────────────── */}
      <section className="py-20 bg-brand-600">
        <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Ready to get started?
          </h2>
          <p className="text-brand-200 text-lg mb-8">
            Set up your organization and start managing financial requests today.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/pickuser" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white text-brand-700 font-bold rounded-xl text-sm hover:bg-brand-50 transition-all shadow-lg">
              Create your account
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <Link to="/login" className="inline-flex items-center justify-center px-7 py-3.5 border border-white/30 hover:border-white/60 text-white font-semibold rounded-xl text-sm transition-all">
              Sign in
            </Link>
          </div>
        </div>
      </section>


      {/* ── FOOTER ─────────────────────────────────────────────── */}
      <footer className="bg-slate-900 py-5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-row justify-center gap-4">
          <p className="text-slate-500 text-xs text-center">© {new Date().getFullYear()} FinReq. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
