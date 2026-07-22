import React, { useEffect, useState } from "react";
import ModalWrapper from "./ModalWrapper";
import { useDispatch, useSelector } from "react-redux";
import { setToogleRequestModal } from "../../reduxtoolkit/features/modal/modalSlice";
import { getDate } from "../../utilis/functions";
import api from "../../utilis/api";
import { v4 as uuidv4 } from "uuid";
import { getId, getCompanyId, getUser } from "../../utilis/storage";

const CreateRequestModal = () => {
  const dispatch = useDispatch();

  const handleToggle = () => {
    dispatch(setToogleRequestModal(false));
  };

  // const id = useSelector((state) => state.user.id);

  const id = getId();
  const user = getUser();

  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "",
    description: "",
    user_id: id,
    company_id: getCompanyId(),
    request_id: "",
    messages: [],
    status: "pending",
    department: user.department || "",
    approval_index: 0,
    proof: "",
    date_created: "",
  });

  const { title, amount, category, description } = formData;

  useEffect(() => {
    let shortId = uuidv4().split("-")[0];
    let date = new Date();

    setFormData((prevFormData) => ({
      ...prevFormData,
      request_id: shortId,
      date_created: date,
    }));
  }, [id]);

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/request/new_request", formData);
      dispatch(setToogleRequestModal(false));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <ModalWrapper>
      <div className="flex overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full">
        <div className="relative p-4 w-full max-w-lg max-h-full">
          <div className="relative bg-white rounded-lg shadow">
            <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t">
              <h3 className="text-lg font-semibold text-gray-900 ">
                Create New Request
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
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                    placeholder="Enter request title"
                    value={title}
                    onChange={onChange}
                    required
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label
                    htmlFor="amount"
                    className="block mb-2 text-sm font-medium text-gray-900 text-left"
                  >
                    Amount
                  </label>
                  <input
                    type="number"
                    name="amount"
                    id="amount"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                    placeholder="$2999"
                    value={amount}
                    onChange={onChange}
                    required
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label
                    htmlFor="category"
                    className="block mb-2 text-sm font-medium text-gray-900 text-left"
                  >
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"
                    value={category}
                    onChange={onChange}
                  >
                    <option defaultValue="">Select category</option>
                    <option value="Management">Equipment</option>
                    <option value="HR">Labour / Services</option>
                    <option value="Administration">Materials</option>
                    <option value="Engineering">Supplies</option>
                    <option value="Engineering">Other Expenses</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label
                    htmlFor="description"
                    className="block mb-2 text-sm font-medium text-gray-900 text-left"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows="4"
                    className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    value={description}
                    onChange={onChange}
                    placeholder="Write request description here"
                  ></textarea>
                </div>
              </div>
              <div className=" justify-between items-center flex">
                <div className="flex">
                  <button
                    type="button"
                    className="text-gray-400 text-left px-3 rounded-full items-center inline-flex -ml-2  -my-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                      className="w-4 mr-2 -ml-1"
                    >
                      <path
                        fillRule="evenodd"
                        d="M15.621 4.379a3 3 0 00-4.242 0l-7 7a3 3 0 004.241 4.243h.001l.497-.5a.75.75 0 011.064 1.057l-.498.501-.002.002a4.5 4.5 0 01-6.364-6.364l7-7a4.5 4.5 0 016.368 6.36l-3.455 3.553A2.625 2.625 0 119.52 9.52l3.45-3.451a.75.75 0 111.061 1.06l-3.45 3.451a1.125 1.125 0 001.587 1.595l3.454-3.553a3 3 0 000-4.242z"
                        clip-rule="evenodd"
                      ></path>
                    </svg>
                    <span className="text-gray-500 italic text-sm">
                      Attach a file
                    </span>
                  </button>
                </div>
                <div className="flex-shrink space-x-3">
                  <button
                    type="submit"
                    className="text-white font-medium shadow-sm text-sm py-2 px-3 bg-gray-700 hover:bg-gray-800 items-center inline-flex rounded-md"
                  >
                    Create
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

export default CreateRequestModal;
