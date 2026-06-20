import { Suspense, lazy, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";
import { DataProvider } from "./utilis/DataContext";

import LandingPage from "./pages/LandingPage";
import Home from "./pages/dashboard/pages/Home";
import Teams from "./pages/dashboard/pages/Teams";
import Analytics from "./pages/dashboard/pages/Analytics";
import Dashboard from "./pages/dashboard/Dashboard";
import PickUser from "./pages/PickUser";
import LogIn from "./pages/authentication/LogIn";
import SetUp from "./pages/SetUp";
import EmployeeSignUp from "./pages/authentication/signup/EmployeeSignUp";
import BusinessSignUp from "./pages/authentication/signup/BusinessSignUp";
import CreateRequestModal from "./components/modal/CreateRequestModal";
import InviteMember from "./components/modal/InviteMember";

import "./App.css";
import Requests from "./pages/dashboard/pages/Requests";
import RequestDetails from "./pages/dashboard/pages/RequestDetails";
import Alert from "./components/Alert";
import Settings from "./pages/dashboard/pages/Settings";

function App() {
  const dispatch = useDispatch();

  const toggleRequestModal = useSelector(
    (state) => state.modal.toggleRequestModal
  );

  const toggleInviteModal = useSelector(
    (state) => state.modal.toggleInviteModal
  );

  const toggleAlertContainer = useSelector((state) => state.modal.toggleAlert);

  return (
    <DataProvider>
      <>
        <BrowserRouter>
          <div>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/pickuser" element={<PickUser />} />
              <Route path="/login" element={<LogIn />} />

              {/* employee pages */}
              <Route path="/employeesignup" element={<EmployeeSignUp />} />

              {/* business pages */}
              <Route path="/businesssignup" element={<BusinessSignUp />} />
              <Route path="/setup" element={<SetUp />} />

              <Route path="/employeedashboard" element={<Dashboard />}>
                <Route index element={<Home />} />
                <Route path="team" element={<Teams />} />
                <Route path="requests" element={<Requests />} />
                <Route
                  path="request-details/:id"
                  element={<RequestDetails />}
                />
                <Route path="analytics" element={<Analytics />} />
                <Route path="settings" element={<Settings />} />
                {/* <Route path="errorpage" element={<ErrorPage />} /> */}
              </Route>
            </Routes>
          </div>
        </BrowserRouter>
      </>
      {toggleRequestModal && <CreateRequestModal />}
      {toggleInviteModal && <InviteMember />}
      {toggleAlertContainer && <Alert />}
    </DataProvider>
  );
}

export default App;
