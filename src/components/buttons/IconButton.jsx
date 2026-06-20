import React from "react";

const IconButton = ({ style, children, ...rest }) => {
  return (
    <button
      type={`${rest.type}`}
      className={`font-medium text-xs rounded-lg items-center inline-flex absolute cursor-pointer ${style}`}
      onClick={rest.Func}
    >
      {children}
    </button>
  );
};

export default IconButton;
