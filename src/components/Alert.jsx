import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { dismissAlert } from "../reduxtoolkit/features/alert/alertSlice";

const AUTO_DISMISS_MS = 4500;

const STYLES = {
  success: {
    wrap: "bg-emerald-50 border-emerald-200",
    icon: "text-emerald-500",
    text: "text-emerald-800",
    path: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  error: {
    wrap: "bg-red-50 border-red-200",
    icon: "text-red-500",
    text: "text-red-800",
    path: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z",
  },
  info: {
    wrap: "bg-slate-50 border-slate-200",
    icon: "text-slate-500",
    text: "text-slate-800",
    path: "M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z",
  },
};

const AlertToast = ({ id, type, message }) => {
  const dispatch = useDispatch();
  const style = STYLES[type] || STYLES.info;

  useEffect(() => {
    const t = setTimeout(() => dispatch(dismissAlert(id)), AUTO_DISMISS_MS);
    return () => clearTimeout(t);
  }, [id, dispatch]);

  return (
    <div className={`flex items-start gap-3 w-80 max-w-[calc(100vw-2rem)] border rounded-xl shadow-lg px-4 py-3 pointer-events-auto animate-fade-in ${style.wrap}`}>
      <svg className={`w-5 h-5 mt-0.5 flex-shrink-0 ${style.icon}`} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d={style.path} />
      </svg>
      <p className={`text-sm flex-1 ${style.text}`}>{message}</p>
      <button
        onClick={() => dispatch(dismissAlert(id))}
        className={`flex-shrink-0 ${style.text} opacity-50 hover:opacity-100 transition-opacity`}
        aria-label="Dismiss"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

const Alert = () => {
  const items = useSelector((state) => state.alert.items);

  if (items.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {items.map((a) => <AlertToast key={a.id} {...a} />)}
    </div>
  );
};

export default Alert;
