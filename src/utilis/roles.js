export const NON_REQUESTER_ROLES = ["admin", "department_head", "approver"];

// The admin account can't create requests — it only reviews and approves.
export const REQUEST_CREATOR_ROLES = ["requester", "department_head", "approver"];
export const canCreateRequests = (role) => REQUEST_CREATOR_ROLES.includes(role);
