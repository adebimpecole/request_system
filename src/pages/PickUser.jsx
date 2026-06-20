import React from "react";
import { Link } from "react-router-dom";

const PickUser = () => {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="font-bold text-lg text-slate-900 tracking-tight">FinReq</span>
          </Link>
          <div className="text-sm font-medium text-slate-600 flex flex-row items-center gap-2">
            <span >
              Already have an account?
            </span>
            <Link to="/login" className="hover:underline text-brand-600">
              Sign in
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-3">Create your account</h1>
          <p className="text-slate-500 text-lg">How will you be using FinReq?</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
          {/* Business Card */}
          <Link
            to="/businesssignup"
            className="group relative bg-white rounded-2xl border-2 border-slate-100 hover:border-brand-400 p-8 shadow-card hover:shadow-card-hover transition-all duration-300 cursor-pointer overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-brand-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Business Account</h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                Set up your organization, define departments, configure approval workflows, and invite team members.
              </p>
              <div className="mt-6 flex items-center gap-1 text-brand-600 text-sm font-semibold group-hover:gap-2 transition-all">
                Get started
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Employee Card */}
          <Link
            to="/employeesignup"
            className="group relative bg-white rounded-2xl border-2 border-slate-100 hover:border-emerald-400 p-8 shadow-card hover:shadow-card-hover transition-all duration-300 cursor-pointer overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Employee Account</h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                Join your company's workspace to submit financial requests, track approvals, and manage your spending history.
              </p>
              <div className="mt-6 flex items-center gap-1 text-emerald-600 text-sm font-semibold group-hover:gap-2 transition-all">
                Join your team
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PickUser;
