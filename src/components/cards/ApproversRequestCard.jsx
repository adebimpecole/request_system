import React from "react";
import { setToogleRequestCard } from "../../reduxtoolkit/features/card/cardSlice";
import { useDispatch } from "react-redux";
import { getDate } from "../../utilis/functions";

const ApproversRequestCard = ({ data }) => {
  const dispatch = useDispatch();

  const handleToggle = () => {
    dispatch(setToogleRequestCard(false));
  };

  return (
    <div
      className="sm:p-5 shadow p-4 border-gray-200 border bg-white rounded-lg absolute right-0 w-[25rem] top-0"
      style={{
        // bottom: `${data.y_event < 700 ? data.y + 100 : data.y}px`,
        // left: `${data.x > 600 ? 600 : data.x}px`,
        zIndex: 1000,
      }}
    >
      <div className="sm:mb-5 pb-4 border-gray-200 border-b justify-between items-center flex mb-4 w-full">
        <h3 className="text-black font-semibold capitalize">
          {data.title}{" "}
          <span className="font-normal text-xs text-gray-500 italic">
            ({data.status})
          </span>
        </h3>
        <button
          type="button"
          className="text-gray-400 text-sm p-1.5 bg-transparent inline-flex"
          onClick={handleToggle}
        >
          <svg
            aria-hidden="true"
            className="text-gray-400 w-4 h-4 mr-3  "
            fill="currentColor"
            viewBox="0 0 16 16"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            ></path>
          </svg>
        </button>
      </div>
      <dl className="sm:mb-5 mb-4 w-full">
        <dd className="text-gray-500 font-light items-center flex mb-2 w-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            className="text-gray-400 w-4 h-4 mr-3  "
            viewBox="0 0 16 16"
          >
            <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5zm8 0A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5zm-8 8A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5zm8 0A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5z" />
          </svg>
          <span className="text-black font-medium">{data.category}</span>
        </dd>
        <dd className="text-gray-500 font-light items-center flex mb-2 w-full">
          <svg
            className="text-gray-400 w-5 h-5 mr-1.5  "
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              fillRule="evenodd"
              d="M7 6a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-2v-4a3 3 0 0 0-3-3H7V6Z"
              clip-rule="evenodd"
            />
            <path
              fillRule="evenodd"
              d="M2 11a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-7Zm7.5 1a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z"
              clip-rule="evenodd"
            />
            <path d="M10.5 14.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" />
          </svg>

          <span className="text-black font-medium">${data.amount}</span>
        </dd>

        <dd className="sm:mb-5 text-gray-500 font-light items-center flex mb-4 w-full">
          <svg
            className="text-gray-400 w-4.5 h-4 mr-3  "
            aria-hidden="true"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
              clip-rule="evenodd"
            ></path>
          </svg>
          <span className="text-black font-medium">
            {getDate(data.dateCreated)}
          </span>
        </dd>

        <dt className="text-black leading-4 font-semibold mb-2 w-full text-left">
          Details
        </dt>
        <dd className="text-gray-500 font-light w-full text-wrap text-left">
          {data.description}
        </dd>
      </dl>
    </div>
  );
};

export default ApproversRequestCard;
