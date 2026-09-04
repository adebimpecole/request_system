import React from "react";
import { Navigate } from "react-router-dom";
import { getRole } from "../utilis/storage";


const RoleRoute = ({ allow, children }) => {
  const role = getRole();
  if (!allow.includes(role)) {
    return <Navigate to="/employeedashboard" replace />;
  }
  return children;
};

export default RoleRoute;
