import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import BrandLogo from "../BrandLogo";

const badgeTones = {
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  brand: "bg-brand-50 text-brand-700 ring-brand-200",
};

const AuthLayout = ({ panel, backTo, badge, badgeTone = "emerald", title, subtitle, children, footer }) => (
  <div className="min-h-screen flex font-sans bg-white">
    <aside className="hidden lg:flex lg:w-[42%] xl:w-5/12 lg:sticky lg:top-0 lg:h-screen flex-shrink-0 bg-navy-gradient flex-col justify-between p-12 relative overflow-hidden">
      {/* Decorative glow and arcs */}
      <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-brand-500/25 blur-3xl" />
      <div className="absolute -bottom-32 -left-20 w-96 h-96 rounded-full bg-brand-400/15 blur-3xl" />
      <div className="absolute -right-40 top-1/3 w-[28rem] h-[28rem] rounded-full border border-white/5" />
      <div className="absolute -right-24 top-1/2 w-[22rem] h-[22rem] rounded-full border border-white/5" />

      <div className="relative">
        <BrandLogo light />
      </div>
      <div className="relative">{panel}</div>
      <p className="relative text-white/40 text-xs">© {new Date().getFullYear()} Prequisa</p>
    </aside>

    <main className="flex-1 min-w-0 relative flex flex-col px-6 py-8 sm:px-12 lg:px-16 bg-gradient-to-b from-white via-white to-brand-50/60">
      <div className="lg:hidden mb-8">
        <BrandLogo />
      </div>

      {backTo && (
        <Link
          to={backTo}
          aria-label="Go back"
          className="w-9 h-9 -ml-2 mb-4 lg:mb-0 inline-flex items-center justify-center rounded-lg text-slate-500 hover:text-navy-900 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
      )}

      <div className="flex-1 flex flex-col justify-center">
        <div className="w-full max-w-xl mx-auto py-6 flex flex-col justify-center">
          {badge && (
            <div className="flex justify-center mb-5">
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${badgeTones[badgeTone]}`}>
                {badge}
              </span>
            </div>
          )}
          <h1 className={`text-[28px] font-extrabold text-navy-900 tracking-tight text-center ${subtitle ? "mb-1.5" : "mb-7"}`}>{title}</h1>
          {subtitle && <p className="text-slate-500 text-sm mb-8 text-center">{subtitle}</p>}
          {children}
          {footer && <div className="mt-8 text-center text-sm text-slate-500">{footer}</div>}
        </div>
      </div>
    </main>
  </div>
);

// Left-panel building blocks
export const PanelHeading = ({ children, sub }) => (
  <>
    <h2 className="text-4xl xl:text-[42px] font-extrabold text-white leading-[1.12] tracking-tight mb-4">{children}</h2>
    {sub && <p className="text-white/65 text-base leading-relaxed max-w-md">{sub}</p>}
  </>
);

export const PanelChecklist = ({ items }) => (
  <ul className="mt-8 space-y-3.5">
    {items.map((t) => (
      <li key={t} className="flex items-center gap-3">
        <span className="w-5 h-5 rounded-full bg-transparent flex items-center justify-center flex-shrink-0">
          <Check className="w-3 h-3 text-white" strokeWidth={3} />
        </span>
        <span className="text-white/85 text-sm font-medium">{t}</span>
      </li>
    ))}
  </ul>
);

export default AuthLayout;
