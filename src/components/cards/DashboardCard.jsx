import React from "react";

const DashboardCard = ({ title, ...rest }) => {
  return (
    <div className="flex flex-col items-start">
      <div className="flex flex-col px-1 items-start">
        <div className="mt-6 text-lg/6 font-medium sm:text-sm/6 capitalize">
          {title}
        </div>
        <div className="mt-3 text-3xl/8 font-semibold sm:text-2xl/8">
          {rest.value}
        </div>
        <div className="mt-3 text-sm/6 sm:text-xs/6">
          <span className="inline-flex items-center gap-x-1.5 rounded-md px-1.5 py-0.5 text-sm/5 font-medium sm:text-xs/5 forced-colors:outline bg-lime-400/20 text-lime-700 group-data-[hover]:bg-lime-400/30">
            +4.5%
          </span>{" "}
          <span className="text-zinc-500">from last year</span>
        </div>
      </div>
      <hr className={`w-full border-t border-[0.5px] mt-4 ${rest.color}`} />
    </div>
  );
};

export default DashboardCard;
