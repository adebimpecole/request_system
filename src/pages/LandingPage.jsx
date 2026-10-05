import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity, ArrowRight, BadgeCheck, Bell, ChartColumn, Check, ChevronDown,
  FileText, GitBranch, Menu, MessageCircleQuestion, Receipt, ScrollText, ShieldCheck,
  Sparkles, User, UserCheck, Users, Wallet, X,
} from "lucide-react";
import BrandLogo from "../components/BrandLogo";

const navLinks = [
  ["#features", "Features"],
  ["#how", "How it works"],
  ["#workflow", "Approval chain"],
  ["#faq", "FAQ"],
];

const steps = [
  { n: "01", title: "Submit request", desc: "Raise a request with the amount, category, description and department.", icon: FileText },
  { n: "02", title: "Approval chain", desc: "It routes to the department head, or straight to the funding approver if there isn't one.", icon: UserCheck },
  { n: "03", title: "Fund & verify", desc: "Proof of funds and proof of use are attached and confirmed on the request.", icon: Wallet },
  { n: "04", title: "Audit trail", desc: "Every action is timestamped and attributed for full visibility and compliance.", icon: ScrollText },
];

const chain = [
  { title: "Requester", desc: "Submits the request with amount, category and details.", icon: User, tone: "bg-brand-100 text-brand-600" },
  { title: "Department head", desc: "Reviews it for their department, then confirms proof of use.", icon: Users, tone: "bg-emerald-100 text-emerald-600" },
  { title: "Funding approver", desc: "Checks remaining budget and attaches proof of funds.", icon: Wallet, tone: "bg-sky-100 text-sky-600" },
  { title: "Verification approver", desc: "Confirms the proof of use and closes the request.", icon: BadgeCheck, tone: "bg-amber-100 text-amber-600" },
];

const features = [
  { title: "Budget-aware approvals", desc: "Checked at submission and again at funding", icon: Wallet },
  { title: "Department routing", desc: "Requests go to the right head automatically", icon: GitBranch },
  { title: "Clarification threads", desc: "Ask questions without rejecting", icon: MessageCircleQuestion },
  { title: "Real-time notifications", desc: "Know the moment a request needs you", icon: Bell },
  { title: "Full audit trail", desc: "Every action timestamped and attributed", icon: ScrollText },
  { title: "Invite-based onboarding", desc: "Bring your team in with a company code", icon: Users },
];

const faqs = [
  { q: "What counts as a financial request?", a: "Any request for company funds — a purchase, reimbursement or similar — submitted with an amount, category and description under a department." },
  { q: "Who approves a request?", a: "Normally the department head first, then the funding approver, who attaches proof of delegated funds, then the department head again for proof of use, then the verification approver. If a department has no head, it goes straight to the funding approver." },
  { q: "What happens when an approver asks for clarification?", a: "The request pauses with the question recorded on its thread. Once the requester (or department head, if the question came from verification) answers, it resumes at the same stage rather than starting over." },
  { q: "How is the budget enforced?", a: "At two points: a request that already exceeds the organisation's total budget is rejected on submission, and one that would exceed what's left after already-approved requests is blocked when the funding approver tries to act on it." },
  { q: "Can a rejected request be resubmitted?", a: "The rejection and its record stay in the audit trail, and the requester can submit a new request." },
  { q: "Who can see what?", a: "Requesters see their own requests. Department heads and approvers see what's waiting on their action. Admins see organisation-wide analytics, the full audit trail, and organisation settings." },
];

const SectionIntro = ({ title, desc, link }) => (
  <div>
    <h2 className="text-2xl lg:text-[28px] font-extrabold text-navy-900 tracking-tight mb-3">{title}</h2>
    <p className="text-slate-500 text-sm leading-relaxed mb-4 max-w-xs">{desc}</p>
    {link && (
      <a href={link[0]} className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700">
        {link[1]} <ArrowRight className="w-4 h-4" />
      </a>
    )}
  </div>
);

// Hero illustration: a request card with its approval timeline, plus floating stat and audit cards.
const HeroMock = () => (
  <div className="relative mx-auto w-full max-w-xl lg:max-w-none pt-10 pb-6 lg:pr-24">
    <div className="absolute top-0 right-0 z-20 hidden sm:block rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 px-5 py-3.5 text-white shadow-xl shadow-brand-700/30">
      <p className="text-[11px] text-white/70">Total requests</p>
      <p className="flex items-end gap-3">
        <span className="text-2xl font-bold">24</span>
        <span className="text-[11px] text-emerald-300 font-semibold mb-1">↑ 12%</span>
      </p>
    </div>

    <div className="relative z-10 rounded-2xl bg-white shadow-2xl shadow-brand-900/10 ring-1 ring-slate-100 p-6">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center"><Receipt className="w-4 h-4" /></span>
          <div>
            <p className="text-xs font-semibold text-navy-900">Financial request</p>
            <p className="text-[11px] text-slate-400 font-mono">#REQ-2418</p>
          </div>
        </div>
        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 ring-1 ring-emerald-200 rounded-full px-2.5 py-1">Approved</span>
      </div>

      <p className="font-bold text-navy-900">Marketing campaign supplies</p>
      <p className="text-xs text-slate-500 mb-5">Office supplies for the Q3 marketing campaign</p>

      <div className="grid grid-cols-3 gap-4 mb-5">
        {[["Amount", "$2,500"], ["Department", "Marketing"], ["Request date", "Aug 12"]].map(([k, v]) => (
          <div key={k}>
            <p className="text-[11px] text-slate-400 mb-0.5">{k}</p>
            <p className="text-sm font-bold text-navy-900">{v}</p>
          </div>
        ))}
      </div>

      <div className="mb-6">
        <div className="flex justify-between text-[11px] text-slate-500 mb-1.5">
          <span>Budget used</span><span className="font-semibold text-navy-900">62%</span>
        </div>
        <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
          <div className="h-full w-[62%] rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500" />
        </div>
      </div>

      <p className="text-xs font-semibold text-navy-900 mb-3">Approval timeline</p>
      <ol className="space-y-3">
        {[
          ["Submitted by Tunde A.", "Aug 12 · 10:24 AM"],
          ["Approved by department head", "Aug 12 · 2:15 PM"],
          ["Funds released by funding approver", "Aug 13 · 9:47 AM"],
          ["Proof of use verified", "Aug 14 · 11:32 AM"],
        ].map(([t, s]) => (
          <li key={t} className="flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Check className="w-3 h-3 text-white" strokeWidth={3} />
            </span>
            <span>
              <span className="block text-xs font-semibold text-navy-900">{t}</span>
              <span className="block text-[11px] text-slate-400">{s}</span>
            </span>
          </li>
        ))}
      </ol>
    </div>

    <div className="absolute right-0 bottom-0 z-20 hidden md:block w-48 rounded-xl bg-white shadow-xl shadow-brand-900/10 ring-1 ring-slate-100 p-4">
      <p className="text-xs font-semibold text-navy-900 mb-3">Audit trail</p>
      <ol className="relative space-y-3 before:absolute before:left-[4px] before:top-1 before:bottom-1 before:w-px before:bg-slate-200">
        {[
          ["Request created", "Tunde A. · Marketing"],
          ["Amount updated", "Tunde A. · Marketing"],
          ["Budget check", "Prequisa"],
          ["Approved", "Department head"],
          ["Funds released", "Funding approver"],
        ].map(([t, s]) => (
          <li key={t} className="relative pl-5">
            <span className="absolute left-0 top-1 w-[9px] h-[9px] rounded-full bg-white ring-2 ring-emerald-500" />
            <span className="block text-[11px] font-semibold text-navy-900">{t}</span>
            <span className="block text-[10px] text-slate-400">{s}</span>
          </li>
        ))}
      </ol>
    </div>
  </div>
);

const LandingPage = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen font-sans bg-white text-navy-900">

      <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/85 backdrop-blur-md border-b border-slate-100 shadow-sm" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
          <BrandLogo />

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map(([href, label]) => (
              <a key={href} href={href} className="text-sm text-slate-600 hover:text-navy-900 transition-colors">{label}</a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-5">
            <Link to="/login" className="text-sm font-medium text-slate-700 hover:text-navy-900">Sign in</Link>
            <Link to="/pickuser" className="text-sm font-semibold bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg shadow-md shadow-brand-600/25 transition-colors">
              Get started
            </Link>
          </div>

          <button className="md:hidden p-2 text-navy-900" aria-label="Toggle menu" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white px-6 py-4 space-y-1 shadow-lg">
            {navLinks.map(([href, label]) => (
              <a key={href} href={href} onClick={() => setMobileOpen(false)} className="block text-sm text-slate-600 py-2">{label}</a>
            ))}
            <div className="grid grid-cols-2 gap-3 pt-3">
              <Link to="/login" className="text-center text-sm font-semibold border border-slate-200 text-navy-900 px-4 py-2.5 rounded-lg">Sign in</Link>
              <Link to="/pickuser" className="text-center text-sm font-semibold bg-brand-600 text-white px-4 py-2.5 rounded-lg">Get started</Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden pt-16 bg-gradient-to-b from-brand-50 via-brand-50/60 to-white">
        <div className="absolute top-24 right-[-10%] w-[46rem] h-[46rem] rounded-full bg-brand-300/30 blur-3xl" aria-hidden="true" />
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-brand-200/40 blur-3xl" aria-hidden="true" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-14 pb-20 lg:pt-20 lg:pb-24 grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 bg-white/70 ring-1 ring-brand-200 text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <Sparkles className="w-3.5 h-3.5" /> Smarter financial requests. Greater control.
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-[46px] font-extrabold leading-[1.1] tracking-tight mb-5">
              Manage every purchase, reimbursement and financial request through one approval chain.
            </h1>
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed mb-8 max-w-xl">
              Prequisa brings your spending, approvals and financial records together in one simple, secure platform. Reduce manual work, improve visibility and stay compliant — from request to reimbursement.
            </p>
            <div className="flex flex-wrap items-center gap-3 mb-10">
              <Link to="/pickuser" className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg text-sm shadow-lg shadow-brand-600/30 transition-colors">
                Get started free <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="#how" className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-slate-50 text-navy-900 font-semibold rounded-lg text-sm ring-1 ring-slate-200 shadow-sm transition-colors">
                See how it works
              </a>
            </div>
            <div className="inline-flex items-center gap-3 rounded-xl bg-white/80 ring-1 ring-slate-100 shadow-sm px-4 py-3">
              <span className="w-9 h-9 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center"><ChartColumn className="w-5 h-5" /></span>
              <span className="text-xs leading-snug">
                <span className="block font-semibold text-navy-900">More control</span>
                <span className="block text-slate-500">Less manual work</span>
              </span>
            </div>
          </div>

          <HeroMock />
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-20 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-[18rem_1fr] gap-12">
          <SectionIntro
            title="How it works"
            desc="From request to reimbursement, Prequisa keeps everything moving with complete transparency."
            link={["#workflow", "Learn more"]}
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={s.n} className="relative">
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white ring-1 ring-brand-200 text-xs font-bold text-brand-600 mb-3">{s.n}</span>
                  <span className="w-12 h-12 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </span>
                  {i < steps.length - 1 && (
                    <ArrowRight className="hidden lg:block absolute top-[4.25rem] -right-6 w-4 h-4 text-slate-300" />
                  )}
                  <h3 className="font-bold text-sm mb-1.5">{s.title}</h3>
                  <p className="text-[13px] text-slate-500 leading-relaxed">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Approval chain */}
      <section id="workflow" className="py-20 bg-slate-50/70 border-y border-slate-100 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-[18rem_1fr] gap-12 items-center">
          <SectionIntro
            title="The approval chain"
            desc="A request advances only when the current stage is satisfied. Rejections and clarification requests are recorded with a reason."
            link={["#faq", "Explore approval rules"]}
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {chain.map((c, i) => {
              const Icon = c.icon;
              return (
                <div key={c.title} className="relative">
                  <div className="h-full rounded-xl bg-white ring-1 ring-slate-100 shadow-card p-5">
                    <span className={`w-9 h-9 rounded-full ${c.tone} flex items-center justify-center mb-4`}><Icon className="w-4 h-4" /></span>
                    <p className="font-bold text-sm mb-1.5">{c.title}</p>
                    <p className="text-[13px] text-slate-500 leading-relaxed">{c.desc}</p>
                  </div>
                  {i < chain.length - 1 && (
                    <ArrowRight className="hidden lg:block absolute top-1/2 -right-5 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-br from-brand-50 to-white ring-1 ring-brand-100 p-6 sm:p-10 grid lg:grid-cols-[1fr_20rem] gap-8 items-stretch">
            <div>
              <h2 className="text-2xl lg:text-[28px] font-extrabold tracking-tight mb-2">Built for how approvals actually happen</h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-8 max-w-lg">
                Everything you need to manage spending, reduce manual work, and stay compliant — all in one place.
              </p>
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {features.map((f) => {
                  const Icon = f.icon;
                  return (
                    <div key={f.title} className="flex items-start gap-3 rounded-xl bg-white ring-1 ring-slate-100 shadow-sm p-4">
                      <span className="w-9 h-9 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0"><Icon className="w-4 h-4" /></span>
                      <span>
                        <span className="block text-sm font-semibold leading-snug">{f.title}</span>
                        <span className="block text-xs text-slate-500 mt-0.5">{f.desc}</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-navy-gradient p-6 text-white min-h-[16rem] flex flex-col">
              <div className="flex items-start justify-between">
                <p className="font-semibold leading-snug">Greater control<br />of your finances</p>
                <span className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center"><Activity className="w-4 h-4" /></span>
              </div>
              <svg className="mt-auto w-full h-32" viewBox="0 0 280 120" fill="none" aria-hidden="true">
                <defs>
                  <linearGradient id="fr-area" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#818cf8" stopOpacity=".45" />
                    <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0 95 C30 90 45 70 70 76 S110 92 135 70 S175 40 200 52 S245 30 280 14 V120 H0Z" fill="url(#fr-area)" />
                <path d="M0 95 C30 90 45 70 70 76 S110 92 135 70 S175 40 200 52 S245 30 280 14" stroke="#a5b4fc" strokeWidth="2" />
                {[[196, 70], [220, 56], [244, 40], [268, 24]].map(([x, y], i) => (
                  <rect key={x} x={x} y={y} width="14" height={120 - y} rx="3" fill={i === 3 ? "#6366f1" : "#4f46e5"} opacity={0.55 + i * 0.15} />
                ))}
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="pb-20 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-[18rem_1fr] gap-12">
          <SectionIntro title="Questions" desc="Everything you need to know about Prequisa." />
          <div className="divide-y divide-slate-100 rounded-xl ring-1 ring-slate-100 bg-white">
            {faqs.map((f, i) => {
              const open = openFaq === i;
              return (
                <div key={f.q} className="px-5">
                  <button
                    onClick={() => setOpenFaq(open ? -1 : i)}
                    aria-expanded={open}
                    className="w-full flex items-center justify-between gap-5 py-4 text-left text-sm font-semibold text-navy-900"
                  >
                    {f.q}
                    <ChevronDown className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
                  </button>
                  {open && <p className="text-sm text-slate-500 leading-relaxed pb-4 pr-8">{f.a}</p>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 lg:px-8 pb-12">
        <div className="max-w-7xl mx-auto rounded-2xl bg-gradient-to-r from-brand-700 via-brand-600 to-brand-700 px-6 sm:px-10 py-7 flex flex-col sm:flex-row sm:items-center gap-5 shadow-xl shadow-brand-700/20">
          <span className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0"><ShieldCheck className="w-6 h-6 text-white" /></span>
          <div className="flex-1">
            <p className="text-white font-bold text-lg">Ready to simplify your financial requests?</p>
            <p className="text-brand-100 text-sm">Join teams that spend less time on paperwork and more time on what matters.</p>
          </div>
          <Link to="/pickuser" className="inline-flex items-center justify-center gap-2 bg-white hover:bg-brand-50 text-brand-700 text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors">
            Get started free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6 flex flex-wrap items-center justify-between gap-4">
          <BrandLogo size="sm" />
          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-500">
            <span>© {new Date().getFullYear()} Prequisa. All rights reserved.</span>
            <Link to="/login" className="hover:text-navy-900">Sign in</Link>
            <Link to="/pickuser" className="hover:text-navy-900">Create account</Link>
            <a href="#faq" className="hover:text-navy-900">FAQ</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
