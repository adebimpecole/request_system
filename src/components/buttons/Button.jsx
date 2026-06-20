import React from "react";

const Button = ({ style, ...rest }) => {
  return (
    <button
      type={`${rest.type}`}
      className={` relative isolate flex items-center justify-center gap-x-2 rounded-lg border text-base/6 font-semibold sm:text-sm/6 cursor-pointer ${style} ${
        rest.type2 === "primary"
          ? "text-white bg-gray-700 hover:bg-gray-800 border-transparent"
          : "text-gray-900 border-gray-300 hover:bg-gray-100"
      }`}
      onClick={rest.Func}
    >
      {rest.content}
    </button>
  );
};

export default Button;
