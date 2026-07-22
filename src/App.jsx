import { useSelector } from "react-redux";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import Requests from "./pages/dashboard/pages/Requests";
import RequestDetails from "./pages/dashboard/pages/RequestDetails";
import Alert from "./components/Alert";
import Settings from "./pages/dashboard/pages/Settings";
import PrivateRoute from "./components/PrivateRoute";
import PublicRoute from "./components/PublicRoute";

import "./App.css";

function App() {
  const toggleRequestModal = useSelector((state) => state.modal.toggleRequestModal);
  const toggleInviteModal = useSelector((state) => state.modal.toggleInviteModal);
  const toggleAlertContainer = useSelector((state) => state.modal.toggleAlert);

  return (
    <DataProvider>
      <>
        <BrowserRouter>
          <div>
            <Routes>
              <Route path="/" element={<LandingPage />} />

              {/* Public-only routes — redirect to dashboard if already authenticated */}
              <Route path="/pickuser" element={<PublicRoute><PickUser /></PublicRoute>} />
              <Route path="/login" element={<PublicRoute><LogIn /></PublicRoute>} />
              <Route path="/employeesignup" element={<PublicRoute><EmployeeSignUp /></PublicRoute>} />
              <Route path="/businesssignup" element={<PublicRoute><BusinessSignUp /></PublicRoute>} />
              <Route path="/setup" element={<PublicRoute><SetUp /></PublicRoute>} />

              {/* Protected routes */}
              <Route
                path="/employeedashboard"
                element={<PrivateRoute><Dashboard /></PrivateRoute>}
              >
                <Route index element={<Home />} />
                <Route path="team" element={<Teams />} />
                <Route path="requests" element={<Requests />} />
                <Route path="request-details/:id" element={<RequestDetails />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="settings" element={<Settings />} />
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
