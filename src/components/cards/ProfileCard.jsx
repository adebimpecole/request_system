import React, { useEffect, useState } from "react";
import Button from "../buttons/Button";
import axios from "axios";
import Spinner from "../Spinner";
import { getId, getToken, getRole } from "../../utilis/storage";

const ProfileCard = () => {
  let role = getRole();
  let [user, setUser] = useState({});

  useEffect(() => {
    const getUser = async () => {
      let userid = getId();
      let token = getToken();

      try {
        if (role == "admin") {
          const res = await axios.get(
            `http://localhost:5000/api/employee/${userid}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          return res;
        } else {
          const res = await axios.get(
            `http://localhost:5000/api/company/get_company/${userid}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          return res;
        }
      } catch (error) {
        console.error("Error fetching the department:", error);
      }
    };

    const getUserData = async () => {
      const userData = await getUser();
      console.log(userData);
      setUser(userData.data);
    };

    getUserData();
  }, []);

  return (
    <div className="w-full max-w-xs h-fit bg-white border border-gray-200 rounded-lg shadow">
      {Object.keys(user).length === 0 ? (
        <Spinner />
      ) : (
        <div className="flex flex-col items-center pt-10">
          {role == "admin" ? (
            <svg
              className="w-12 h-12 text-gray-500 group-hover:text-gray-800 lg:w-12 lg:h-12"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                fillRule="evenodd"
                d="M4 4a1 1 0 0 1 1-1h14a1 1 0 1 1 0 2v14a1 1 0 1 1 0 2H5a1 1 0 1 1 0-2V5a1 1 0 0 1-1-1Zm5 2a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1H9Zm5 0a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1h-1Zm-5 4a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1a1 1 0 0 0-1-1H9Zm5 0a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1a1 1 0 0 0-1-1h-1Zm-3 4a2 2 0 0 0-2 2v3h2v-3h2v3h2v-3a2 2 0 0 0-2-2h-2Z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <img
              className="w-24 h-24 mb-4 rounded-full shadow-lg bg-gray-100"
              src="/icons/user.svg"
              alt="Bonnie image"
            />
          )}
          <h5 className="mb-1.5 text-xl font-medium text-gray-900 capitalize">
            {user.firstname} {user.lastname}
          </h5>
          <span className="text-sm text-gray-500 mb-1.5">
            {user.department}
          </span>
          <span className="text-sm text-gray-500 mb-1.5 capitalize">
            {role}
          </span>
          <div className="flex mt-4 md:mt-6 border-t w-full justify-center">
            <Button
              style="py-4 text-right text-primary-600 w-full font-normal"
              type="button"
              type2="mix"
              content="Upload Picture"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileCard;
