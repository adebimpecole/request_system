import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getRole } from "../../utilis/storage";
import {
  setToogleRequestModal,
  setToogleInviteModal,
} from "../../reduxtoolkit/features/modal/modalSlice";
import Logo from "../Logo";
import { Link, useLocation } from "react-router-dom";

const SideNav = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  const [role, setRole] = useState(getRole());

  const { hash, pathname, search } = location;

  const toggleRequestModal = useSelector(
    (state) => state.modal.toggleRequestModal
  );
  const toggleInviteModal = useSelector(
    (state) => state.modal.toggleInviteModal
  );

  const handleToggleRequestModal = () => {
    dispatch(setToogleRequestModal(!toggleRequestModal));
  };
  const handleToggleInviteModal = () => {
    dispatch(setToogleInviteModal(!toggleInviteModal));
  };
  const setPage = (page) => {
    dispatch(setPage(page));
  };

  return (
    <div className="pb-4 px-6 bg-gray-700 overflow-y-auto gap-y-5 flex-col flex-grow flex">
      <div className="items-center flex-shrink-0 h-16 flex">
        <Logo style="text-white text-2xl" />
      </div>
      <nav className="flex flex-col flex-1">
        <ul role="list" className="gap-y-8 flex-col flex-1 flex ">
          <li>
            <ul role="list" className="-mx-2">
              <li>
                <Link
                  to="/employeedashboard"
                  className={` leading-6 font-semibold text-sm p-3 rounded-md gap-x-3 flex 
                  ${
                    pathname === "/employeedashboard"
                      ? "bg-gray-800 text-white"
                      : "bg-transparent hover:bg-gray-800/50 text-gray-300"
                  }
                  `}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    aria-hidden="true"
                    className="flex-shrink-0 w-6 h-6 "
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                    ></path>
                  </svg>
                  Dashboard
                </Link>
              </li>

              <li>
                <Link
                  to="/employeedashboard/requests"
                  className={`text-gray-300 leading-6 font-semibold text-sm p-3 rounded-md gap-x-3 flex 
                  ${
                    pathname === "/employeedashboard/requests"
                      ? "bg-gray-800 text-white"
                      : "bg-transparent hover:bg-gray-800/50 text-gray-300"
                  }
                  `}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    aria-hidden="true"
                    className="flex-shrink-0 w-6 h-6 "
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75"
                    ></path>
                  </svg>
                  Requests
                </Link>
              </li>
              {role != "requester" && (
                <>
                  <li>
                    <Link
                      to="/employeedashboard/team"
                      className={`text-gray-300 leading-6 font-semibold text-sm p-3 rounded-md gap-x-3 flex 
                  ${
                    pathname === "/employeedashboard/team"
                      ? "bg-gray-800 text-white"
                      : "bg-transparent hover:bg-gray-800/50 text-gray-300"
                  }
                  `}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        aria-hidden="true"
                        className="flex-shrink-0 w-6 h-6 "
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                        ></path>
                      </svg>
                      Team
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/employeedashboard/analytics"
                      className={`text-gray-300 leading-6 font-semibold text-sm p-3 rounded-md gap-x-3 flex 
                  ${
                    pathname === "/employeedashboard/analytics"
                      ? "bg-gray-800 text-white"
                      : "bg-transparent hover:bg-gray-800/50 text-gray-300"
                  }
                  `}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        aria-hidden="true"
                        className=" flex-shrink-0 w-6 h-6 "
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z"
                        ></path>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z"
                        ></path>
                      </svg>
                      Analytics
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </li>
          <li>
            <div className="text-gray-300 leading-6 font-semibold text-xs text-left">
              Actions
            </div>
            <ul role="list" className="mt-2 -mx-2 ">
              {role === "requester" && (
                <li>
                  <div
                    className="text-gray-300 leading-6 font-semibold text-sm p-2 rounded-xl gap-x-3 flex hover:bg-gray-800/50 cursor-pointer"
                    onClick={handleToggleRequestModal}
                  >
                    <span className="text-gray-300 font-medium border-gray-400 border rounded-lg justify-center items-center w-6 h-6 flex ">
                      C
                    </span>
                    <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                      Create Request
                    </span>
                  </div>
                </li>
              )}
              <li>
                <div
                  className="text-gray-300 leading-6 font-semibold text-sm p-2 rounded-xl gap-x-3 flex hover:bg-gray-800/50 cursor-pointer"
                  onClick={handleToggleInviteModal}
                >
                  <span className="text-gray-300 font-medium border-gray-400 border rounded-lg justify-center items-center w-6 h-6 flex">
                    I
                  </span>
                  <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                    Invite Member
                  </span>
                </div>
              </li>
            </ul>
          </li>
          <li className="mt-auto">
            <Link
              to="/employeedashboard/settings"
              className={`text-gray-300 leading-6 font-semibold text-sm p-3 rounded-md gap-x-3 flex 
                  ${
                    pathname === "/employeedashboard/settings"
                      ? "bg-gray-800 text-white"
                      : "bg-transparent hover:bg-gray-800/50 text-gray-300"
                  }
                  `}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                aria-hidden="true"
                className=" flex-shrink-0 w-6 h-6 "
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
                ></path>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                ></path>
              </svg>
              Settings
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default SideNav;
