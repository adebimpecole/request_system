import React from "react";
import requestIcon from "../../assets/icons/new-request.svg";
import fundIcon from "../../assets/icons/fund-request.svg";
import completedIcon from "../../assets/icons/completed-request.svg";

const NotificationCard = () => {
  return (
    <div
      className="shadow-lg text-base bg-white rounded overflow-hidden list-none max-w-96 block my-4 z-50 right-8 top-16"
      id="notification-dropdown"
      data-popper-placement="bottom"
      style={{
        position: "absolute",
        // inset: "0px auto auto 0px",
        margin: "0px",
      }}
    >
      <div className="text-gray-700 font-medium text-base text-center py-2 px-4 bg-gray-50 block">
        Notifications
      </div>
      <div>
        {/* request notification */}
        <div
          className="py-3 px-4 border-b flex border-gray-200 pr-16"
          data-type="request"
          data-status="opened"
        >
          <div className=" flex-shrink-0 bg-blue-100 rounded-full h-fit p-3">
            <img className="w-6 h-6 " src={requestIcon} alt="Jese image" />
          </div>
          <div className="pl-3 w-full">
            <div className="text-gray-500 font-normal text-sm mb-1.5 text-left">
              New request from{" "}
              <span className="text-gray-900 font-semibold ">Bonnie Green</span>{" "}
              <br />
              Title:{" "}
              <span className="text-gray-900 font-semibold ">
                "Funeral Arrangements"
              </span>
            </div>
            <div className="text-blue-600 font-medium text-xs text-left">
              a few moments ago
            </div>
          </div>
        </div>
        {/* request needs funding - opened */}
        <div
          className="py-3 px-4 border-b flex border-gray-200 "
          data-type="fund"
          data-status="opened"
        >
          <div className=" flex-shrink-0 bg-yellow-100 rounded-full h-fit p-3">
            <img className="w-6 h-6 " src={fundIcon} alt="Jese image" />
          </div>
          <div className="pl-3 w-full">
            <div className="text-gray-500 font-normal text-sm mb-1.5 text-left">
              Your request has been funded!
            </div>
            <div className="text-blue-600 font-medium text-xs text-left">
              a few moments ago
            </div>
          </div>
        </div>
        {/* request is completed - unopened */}
        <div
          className="py-3 px-4 border-b flex border-gray-200 "
          data-type="complete"
          data-status="unopened"
        >
          <div className=" flex-shrink-0 bg-green-100 rounded-full h-fit p-3">
            <img className="w-6 h-6 " src={completedIcon} alt="Jese image" />
          </div>
          <div className="pl-3 w-full">
            <div className="text-gray-900 font-medium text-sm mb-1.5 text-left">
              Your request is completed!
            </div>
            <div className="text-blue-600 font-medium text-xs text-left">
              a few moments ago
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCard;
