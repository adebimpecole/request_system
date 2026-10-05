import React, { useEffect, useRef, useState } from "react";
import { EllipsisVertical } from "lucide-react";

// Small kebab menu used on setup list rows.
const RowMenu = ({ label, items }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const close = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-slate-400 hover:text-navy-900 hover:bg-slate-100 transition-colors"
      >
        <EllipsisVertical className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-9 z-20 min-w-[8rem] rounded-lg bg-white py-1 shadow-lg ring-1 ring-slate-200">
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => { setOpen(false); item.onClick(); }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50 ${item.danger ? "text-red-600" : "text-slate-700"}`}
            >
              {item.icon && <item.icon className="w-4 h-4" />}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default RowMenu;
