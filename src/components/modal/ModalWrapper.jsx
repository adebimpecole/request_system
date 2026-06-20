import React from "react";

const ModalWrapper = ({ isOpen, children }) => {
  return (
    <div>
      <div className="block">
        <div className="relative z-50">
          <div>
            <div className="fixed inset-0 bg-zinc-900 bg-opacity-65 transition-opacity"></div>
          </div>
          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalWrapper;
