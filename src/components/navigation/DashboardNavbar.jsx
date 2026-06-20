import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { setUserDetails } from "../../reduxtoolkit/features/user/userSlice";
import {
  setToogleDropdown,
  setToogleNotification,
} from "../../reduxtoolkit/features/modal/modalSlice";
import NotificationCard from "../cards/NotificationCard";
import axios from "axios";

const DashboardNavbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [user, setUser] = useState("");

  useEffect(() => {
    const getUser = async () => {
      let userid = localStorage.getItem("id");
      let token = localStorage.getItem("token");

      try {
        const res = await axios.get(
          `http://localhost:5000/api/employee/${userid}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log(res);
        return res;
      } catch (error) {
        console.error("Error fetching the department:", error);
      }
    };

    const getUserData = async () => {
      const userData = await getUser();

      console.log(userData.data.firstname);
      setUser(
        userData?.data.role === "admin"
          ? userData?.data.companyname
          : userData?.data.firstname + " " + userData?.data.lastname
      );
    };

    getUserData();
  }, []);

  const toggleDropdown = useSelector((state) => state.modal.toggleDropdown);
  const toggleNotification = useSelector(
    (state) => state.modal.toggleNotification
  );

  const handleToggleDropdown = () => {
    dispatch(setToogleDropdown(!toggleDropdown));
  };

  const handleToggleNotification = () => {
    dispatch(setToogleNotification(!toggleNotification));
  };

  const Logout = () => {
    localStorage.clear();
    navigate("/login");
  };
  return (
    <div className="lg:px-8 sm:px-6 sm:gap-x-6 shadow-gray-100 px-4 bg-white border-b gap-x-4 border-gray-200 items-center flex-shrink-0 h-16 flex z-40 top-0 sticky">
      <button type="button" className="lg:hidden text-black p-2.5 -m-2.5 ">
        <span className="t">Open sidebar</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          aria-hidden="true"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
          ></path>
        </svg>
      </button>
      <div
        className="lg:hidden bg-primary-50/5 w-px h-6"
        aria-hidden="true"
      ></div>
      <div className="lg:gap-x-6 self-stretch gap-x-4 flex-1 flex">
        <div className="flex-1 flex relative" action="#" method="GET">
          <div className="sm:text-sm text-gray-900 pr-0 pl-8 py-0 border-0 w-full h-full block"></div>
        </div>
        <div className="lg:gap-x-6 gap-x-4 items-center flex">
          <button
            type="button"
            className="text-gray-500 p-2.5 -m-2.5"
            onClick={handleToggleNotification}
          >
            <span className="t">View notifications</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              aria-hidden="true"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
              ></path>
            </svg>
          </button>

          {toggleNotification && <NotificationCard />}

          <div
            className="lg:bg-gray-900/10 lg:w-px lg:h-6 lg:block hidden"
            aria-hidden="true"
          ></div>
          <div className="relative">
            <button
              className="p-1.5 items-center flex -m-1.5 "
              id="headlessui-menu-button-:r1:"
              type="button"
              aria-haspopup="menu"
              aria-expanded="false"
              data-headlessui-state=""
            >
              <span className="t">Open user menu</span>
              <img
                className="bg-primary-50 rounded w-8 h-8"
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&amp;ixid=eyJhcHBfaWQiOjEyMDd9&amp;auto=format&amp;fit=facearea&amp;facepad=2&amp;w=256&amp;h=256&amp;q=80"
                alt=""
              />
              <span className="lg:items-center lg:flex hidden">
                <span
                  className="text-gray-900 leading-6 font-semibold text-sm ml-4 capitalize"
                  aria-hidden="true"
                >
                  {user}
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                  className="h-5 ml-2"
                  onClick={handleToggleDropdown}
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </span>
            </button>
            {toggleDropdown ? (
              <ul className=" flex-col absolute right-0 w-40 bg-white h-32 border rounded-md items-start top-14">
                <li
                  className="w-full px-4 py-2 text-start text-sm cursor-pointer hover:bg-zinc-50"
                  onClick={Logout}
                >
                  Logout
                </li>
              </ul>
            ) : (
              <span></span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardNavbar;
