import React from "react";
import { Link } from "react-router-dom";

const ButtonLink = ({ style, ...rest }) => {
  return (
    <Link
      to={`${rest.link}`}
      className={`font-medium rounded-lg text-sm text-center focus:ring-4 focus:outline-none ${style} ${
        rest.type === "primary"
          ? "text-white bg-gray-700 hover:bg-gray-800"
          : "text-gray-900  border border-gray-300 hover:bg-gray-100"
      }`}
    >
      {rest.content}
    </Link>
  );
};

export default ButtonLink;
