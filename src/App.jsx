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
import ForgotPassword from "./pages/authentication/ForgotPassword";
import ResetPassword from "./pages/authentication/ResetPassword";
import SetUp from "./pages/SetUp";
import EmployeeSignUp from "./pages/authentication/signup/EmployeeSignUp";
import BusinessSignUp from "./pages/authentication/signup/BusinessSignUp";
import CreateRequestModal from "./components/modal/CreateRequestModal";
import Requests from "./pages/dashboard/pages/Requests";
import RequestDetails from "./pages/dashboard/pages/RequestDetails";
import Alert from "./components/Alert";
import Settings from "./pages/dashboard/pages/Settings";
import AuditLog from "./pages/dashboard/pages/AuditLog";
import PrivateRoute from "./components/PrivateRoute";
import PublicRoute from "./components/PublicRoute";
import RoleRoute from "./components/RoleRoute";
import { NON_REQUESTER_ROLES } from "./utilis/roles";

import "./App.css";

function App() {
  const toggleRequestModal = useSelector((state) => state.modal.toggleRequestModal);

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
              <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
              <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
              <Route path="/employeesignup" element={<PublicRoute><EmployeeSignUp /></PublicRoute>} />
              <Route path="/businesssignup" element={<PublicRoute><BusinessSignUp /></PublicRoute>} />
              <Route path="/setup" element={<PublicRoute><SetUp /></PublicRoute>} />

              {/* Protected routes */}
              <Route
                path="/employeedashboard"
                element={<PrivateRoute><Dashboard /></PrivateRoute>}
              >
                <Route index element={<Home />} />
                <Route path="team" element={<RoleRoute allow={NON_REQUESTER_ROLES}><Teams /></RoleRoute>} />
                <Route path="requests" element={<Requests />} />
                <Route path="request-details/:id" element={<RequestDetails />} />
                <Route path="analytics" element={<RoleRoute allow={NON_REQUESTER_ROLES}><Analytics /></RoleRoute>} />
                <Route path="activity" element={<RoleRoute allow={["admin"]}><AuditLog /></RoleRoute>} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Routes>
          </div>
        </BrowserRouter>
      </>
      {toggleRequestModal && <CreateRequestModal />}
      <Alert />
    </DataProvider>
  );
}

export default App;
