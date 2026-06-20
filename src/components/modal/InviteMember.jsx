import React from "react";
import ModalWrapper from "./ModalWrapper";
import { useDispatch } from "react-redux";
import { setToogleInviteModal } from "../../reduxtoolkit/features/modal/modalSlice";

const InviteMember = () => {
  const dispatch = useDispatch();

  const handleToggle = () => {
    dispatch(setToogleInviteModal(false));
  };

  const onSubmit = () => {};
  return (
    <ModalWrapper>
      <div
        id="crud-modal"
        tabIndex="-1"
        aria-hidden="true"
        className="flex overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full"
      >
        <div className="relative p-4 w-full max-w-lg max-h-full">
          <div className="relative bg-white rounded-lg shadow">
            <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t">
              <h3 className="text-lg font-semibold text-gray-900 ">
                Invite Member
              </h3>
              <button
                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center "
                onClick={handleToggle}
              >
                <svg
                  className="w-3 h-3"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 14 14"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                  />
                </svg>
                <span className="sr-only">Close modal</span>
              </button>
            </div>
            <form className="p-4 md:p-5" onSubmit={onSubmit}>
              <div className="grid gap-4 mb-4 grid-cols-2">
                <div className="col-span-2">
                  <label
                    htmlFor="title"
                    className="block mb-2 text-sm font-medium text-gray-900  text-left"
                  >
                    Email
                  </label>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                    placeholder="Enter email of the person you want to invite"
                    // value={title}
                    // onChange={onChange}
                    required
                  />
                </div>
              </div>
              <div className="justify-end items-center flex">
                <div className="flex-shrink space-x-3">
                  <button
                    type="submit"
                    className="text-white font-medium shadow-sm text-sm py-2.5 px-6 bg-gray-700 hover:bg-gray-800 items-center inline-flex rounded-md"
                  >
                    Invite
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
};

export default InviteMember;
