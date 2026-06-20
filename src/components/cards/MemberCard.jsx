import React from "react";

const MemberCard = () => {
  return (
    <div className="w-full max-w-sm bg-white border border-gray-200 rounded-lg shadow">
      <div className="flex justify-end px-4 pt-4">
        <button
          className="inline-block text-gray-500 hover:bg-gray-100 rounded-lg text-sm p-1.5"
          type="button"
        >
          <svg
            aria-hidden="true"
            className="text-gray-400 w-4 h-4 mr-1 mb-1"
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
      <div className="flex flex-col items-center pb-10">
        <img
          className="w-24 h-24 mb-3 rounded-full shadow-lg"
          src="/docs/images/people/profile-picture-3.jpg"
          alt="Bonnie image"
        />
        <h5 className="mb-1 text-xl font-medium text-gray-900">Bonnie Green</h5>
        <div className="text-sm text-gray-500 flex gap-2 items-center">
          <span>Approver</span>
          <svg
            className="w-4 h-4 text-blue-500"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              fillRule="evenodd"
              d="M12 2c-.791 0-1.55.314-2.11.874l-.893.893a.985.985 0 0 1-.696.288H7.04A2.984 2.984 0 0 0 4.055 7.04v1.262a.986.986 0 0 1-.288.696l-.893.893a2.984 2.984 0 0 0 0 4.22l.893.893a.985.985 0 0 1 .288.696v1.262a2.984 2.984 0 0 0 2.984 2.984h1.262c.261 0 .512.104.696.288l.893.893a2.984 2.984 0 0 0 4.22 0l.893-.893a.985.985 0 0 1 .696-.288h1.262a2.984 2.984 0 0 0 2.984-2.984V15.7c0-.261.104-.512.288-.696l.893-.893a2.984 2.984 0 0 0 0-4.22l-.893-.893a.985.985 0 0 1-.288-.696V7.04a2.984 2.984 0 0 0-2.984-2.984h-1.262a.985.985 0 0 1-.696-.288l-.893-.893A2.984 2.984 0 0 0 12 2Zm3.683 7.73a1 1 0 1 0-1.414-1.413l-4.253 4.253-1.277-1.277a1 1 0 0 0-1.415 1.414l1.985 1.984a1 1 0 0 0 1.414 0l4.96-4.96Z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        <span className="text-[0.85rem] text-gray-500 flex gap-2 items-center">
          exmaple@gmail.com
        </span>
        <div className="flex mt-5 md:mt-7 w-10/12 justify-between">
          <a
            href="#"
            className="py-2 px-4 ms-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:border-red-100 hover:bg-red-50 hover:text-red-700 focus:z-10 focus:ring-4 focus:ring-gray-0"
          >
            Delete User
          </a>
          <a
            href="#"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-center text-white bg-gray-700 rounded-lg hover:bg-gray-800"
          >
            Make Approver
          </a>
        </div>
      </div>
    </div>
  );
};

export default MemberCard;
