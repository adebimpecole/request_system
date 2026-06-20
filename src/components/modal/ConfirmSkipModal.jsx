// import { Fragment, useState } from "react";
import IconButton from "../buttons/IconButton";
import Button from "../buttons/Button";

const ConfirmSkipModal = ({ isOpen, closeModal }) => {
  return (
    <div className={`${isOpen ? "block" : "hidden"}`}>
      <div className="relative z-10" onClose={closeModal}>
        <div>
          <div className="fixed inset-0 bg-black bg-opacity-75 transition-opacity"></div>
        </div>

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div>
              <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-2">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left">
                      <div className="text-base font-semibold leading-6 text-gray-900">
                        Skip Process
                        <IconButton
                          type="button"
                          style="text-gray-400 top-2.5 right-2.5 bg-transparent hover:bg-gray-200 hover:text-gray-900 p-1.5 ml-auto"
                          Func={closeModal}
                        >
                          <svg
                            aria-hidden="true"
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            ></path>
                          </svg>
                          <span className="sr-only">Close modal</span>
                        </IconButton>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Are you sure you want to skip this process? Skipping
                          this process might cause you to loose your saved
                          changes
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 gap-4">
                  <Button
                    style="px-3 py-2 mt-3 w-full shadow-sm sm:w-auto"
                    type="button"
                    type2="primary"
                    content="Skip"
                    Func={closeModal}
                  />
                  <Button
                    style="px-3 py-2 mt-3 w-full shadow-sm sm:w-auto"
                    type="button"
                    type2="secondary"
                    content="Continue"
                    Func={closeModal}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmSkipModal;
