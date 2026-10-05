import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Building2, Check, User } from "lucide-react";
import BrandLogo from "../components/BrandLogo";

const accountTypes = [
  {
    key: "business",
    to: "/businesssignup",
    title: "Business Account",
    desc: "Set up your organization, define departments, configure approval workflows, and invite team members.",
    perks: ["Manage multiple departments", "Custom approval workflows", "Team collaboration", "Full financial visibility"],
    cta: "Get started",
    icon: Building2,
    iconBg: "from-brand-500 to-brand-700 shadow-brand-600/30",
    check: "text-brand-500",
    base: "border-brand-500 shadow-brand-600/10",
    bg: "bg-brand-500",
    button: "bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-600/25",
    buttonHover: "hover:bg-brand-700 hover:text-white",
    buttonText: "text-brand-600",
    buttonBorder: "border-brand-500",
  },
  {
    key: "employee",
    to: "/employeesignup",
    title: "Employee Account",
    desc: "Join your company's workspace to submit financial requests, track approvals, and manage your spending history.",
    perks: ["Submit requests", "Track approval status", "View spending history", "Personal dashboard"],
    cta: "Join your team",
    icon: User,
    iconBg: "from-emerald-400 to-emerald-600 shadow-emerald-600/30",
    check: "text-emerald-500",
    base: "border-emerald-500 shadow-emerald-600/10",
    bg: "bg-emerald-500",
    button: "bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-600/25",
    buttonHover: "hover:bg-emerald-700 hover:text-white",
    buttonText: "text-emerald-600",
    buttonBorder: "border-emerald-500",
  },
];

const PickUser = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState("business");

  return (
    <div className="min-h-screen flex flex-col font-sans relative overflow-hidden">
      {/* Soft background waves */}
      <svg className="pointer-events-none absolute bottom-0 left-0 w-full h-64 text-brand-100/30" viewBox="0 0 1440 260" preserveAspectRatio="none" aria-hidden="true">
        <path fill="currentColor" d="M0 160c240-60 480-60 720 0s480 60 720 0v100H0z" />
        <path fill="currentColor" opacity=".5" d="M0 200c260-50 520-30 760 10s440 30 680-20v70H0z" />
      </svg>

      <nav className="relative border-b border-slate-100 bg-white/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <BrandLogo />
          <p className="text-sm text-slate-600">
            <span className="hidden sm:inline">Already have an account? </span>
            <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">Sign in</Link>
          </p>
        </div>
      </nav>

      <main className="relative flex-1 flex flex-col items-center justify-center px-4 py-14">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-900 tracking-tight mb-3 text-center">Create your account</h1>
        <p className="text-slate-500 text-lg mb-12 text-center">How will you be using Prequisa?</p>

        <div role="radiogroup" aria-label="Account type" className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
          {accountTypes.map((t) => {
            const active = selected === t.key;
            const Icon = t.icon;
            return (
              <div
                key={t.key}
                role="radio"
                aria-checked={active}
                tabIndex={0}
                onClick={() => setSelected(t.key)}
                onKeyDown={(e) => {
                  if (e.key === " ") { e.preventDefault(); setSelected(t.key); }
                  if (e.key === "Enter") navigate(t.to);
                }}
                className={`relative flex flex-col rounded-2xl bg-white p-8 cursor-pointer transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                  active
                    ? `border-2 shadow-xl ${t.base}`
                    : "border-2 border-slate-100 shadow-card hover:border-slate-200 hover:shadow-card-hover"
                }`}
              >
                {active && (
                  <span className={`absolute top-5 right-5 w-6 h-6 rounded-full ${t.bg} flex items-center justify-center`}>
                    <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                  </span>
                )}

                <span className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${t.iconBg} shadow-lg flex items-center justify-center mb-6`}>
                  <Icon className="w-7 h-7 text-white" strokeWidth={1.75} />
                </span>

                <h2 className="text-xl font-bold text-navy-900 mb-2">{t.title}</h2>
                <p className="text-sm text-slate-500 leading-relaxed mb-6">{t.desc}</p>

                <ul className="space-y-2.5 mb-8">
                  {t.perks.map((p) => (
                    <li key={p} className="flex items-center gap-2.5 text-sm text-slate-600">
                      <Check className={`w-4 h-4 flex-shrink-0 ${t.check}`} strokeWidth={2.5} />
                      {p}
                    </li>
                  ))}
                </ul>

                <Link
                  to={t.to}
                  onClick={(e) => e.stopPropagation()}
                  className={`mt-auto h-11 inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-colors ${
                    active
                      ? t.button
                      : `border border-slate-200 ${t.buttonText} ${t.buttonHover}`
                  }`}
                >
                  {t.cta}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            );
          })}
        </div>

        <p className="hidden lg:block absolute right-16 bottom-16 font-hand text-2xl text-brand-400 -rotate-6 leading-tight text-right">
          Better spending.<br />Stronger teams.
          <svg className="block ml-auto mt-1 w-28 h-3 text-brand-300" viewBox="0 0 120 12" fill="none" aria-hidden="true">
            <path d="M2 9C40 3 80 2 118 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </p>
      </main>
    </div>
  );
};

export default PickUser;
