import React from "react";

const TeamsTable = ({ children }) => {
  return (
    <table className="min-w-full text-left text-sm/6 text-zinc-950">
      <thead className="text-zinc-500">
        <tr className="">
          <th className="border-b border-b-zinc-950/10 px-4 py-2 font-medium first:pl-[var(--gutter,theme(spacing.2))] last:pr-[var(--gutter,theme(spacing.2))] sm:first:pl-1 sm:last:pr-1">
            Employee id
          </th>
          <th className="border-b border-b-zinc-950/10 px-4 py-2 font-medium first:pl-[var(--gutter,theme(spacing.2))] last:pr-[var(--gutter,theme(spacing.2))] sm:first:pl-1 sm:last:pr-1">
            First name
          </th>
          <th className="border-b border-b-zinc-950/10 px-4 py-2 font-medium first:pl-[var(--gutter,theme(spacing.2))] last:pr-[var(--gutter,theme(spacing.2))] sm:first:pl-1 sm:last:pr-1">
            Last name
          </th>
          <th className="border-b border-b-zinc-950/10 px-4 py-2 font-medium first:pl-[var(--gutter,theme(spacing.2))] last:pr-[var(--gutter,theme(spacing.2))]  sm:first:pl-1 sm:last:pr-1">
            Email
          </th>
          <th className="text-right border-b border-b-zinc-950/10 px-4 py-2 font-medium first:pl-[var(--gutter,theme(spacing.2))] last:pr-[var(--gutter,theme(spacing.2))] sm:first:pl-1 sm:last:pr-1">
            Role
          </th>
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
};

export default TeamsTable;
