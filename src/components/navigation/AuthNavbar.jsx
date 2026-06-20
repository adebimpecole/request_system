import React from "react";
import Logo from "../Logo";

const AuthNavbar = () => {
  return (
    <nav className="bg-white fixed border-gray-200">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <a
          href="https://flowbite.com/"
          className="flex items-center space-x-3 rtl:space-x-reverse"
        >
          <Logo style="text-gray-800 text-3xl" />
        </a>
      </div>
    </nav>
  );
};

export default AuthNavbar;
