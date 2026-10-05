import React from "react";

const Button = ({ style, ...rest }) => {
  return (
    <button
      type={`${rest.type}`}
      className={` relative isolate flex items-center justify-center gap-x-2 rounded-lg border text-base/6 font-semibold sm:text-sm/6 cursor-pointer ${style} ${
        rest.type2 === "primary"
          ? "text-white bg-brand-600 hover:bg-brand-700 border-transparent"
          : "text-navy-900 border-slate-300 hover:bg-slate-100"
      }`}
      onClick={rest.Func}
    >
      {rest.content}
    </button>
  );
};

export default Button;
