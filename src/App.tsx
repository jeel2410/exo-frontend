import { Routes, Route, BrowserRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import NotFound from "./pages/OtherPage/NotFound";

import Home from "./pages/Dashboard/Home";
import SignIn from "./pages/Auth/SignIn";
import SignUp from "./pages/Auth/SignUp";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import OtpVerification from "./pages/Auth/OtpVerification";
import ResetPassword from "./pages/Auth/ResetPassword";
import EditProfile from "./pages/user/EditProfile";
import Help from "./pages/OtherPage/Help";
import TestRequestDetails from "./pages/OtherPage/TestRequestDetails";
import TestFilterData from "./pages/OtherPage/TestFilterData";
import AddRequest from "./components/dashboard/AddRequest";
import ProjectDetails from "./components/dashboard/ProjectDetails";
import ListDashBoard from "./components/dashboard/ListDashBoard";
import PublicRoute from "./utils/PublicRoute";
import ProtectedRoute from "./utils/constant/ProtectedRoute";
import CreateProject from "./pages/Dashboard/CreateProject";

export default function App() {
  const queryClient = new QueryClient();
  return (
    <>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <ToastContainer className="z-100" />
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create-project"
              element={
                <ProtectedRoute>
                  <CreateProject />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-project/:projectId"
              element={<CreateProject />}
            />
            <Route
              path="/sign-in"
              element={
                <PublicRoute>
                  <SignIn />
                </PublicRoute>
              }
            />
            <Route
              path="/sign-up"
              element={
                <PublicRoute>
                  <SignUp />
                </PublicRoute>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <PublicRoute>
                  <ForgotPassword />
                </PublicRoute>
              }
            />
            <Route
              path="/otp-verification"
              element={
                <PublicRoute>
                  <OtpVerification />
                </PublicRoute>
              }
            />
            <Route
              path="/reset-password"
              element={
                <PublicRoute>
                  <ResetPassword />
                </PublicRoute>
              }
            />
            <Route
              path="/edit-profile"
              element={
                <ProtectedRoute>
                  <EditProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/add-request/:projectId"
              element={
                <ProtectedRoute>
                  <AddRequest />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-request/:requestId"
              element={
                <ProtectedRoute>
                  <AddRequest />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <ListDashBoard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/project-details/:projectId"
              element={
                <ProtectedRoute>
                  <ProjectDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/request-details/:requestId"
              element={
                <ProtectedRoute>
                  <TestRequestDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/filter-data"
              element={
                <ProtectedRoute>
                  <TestFilterData />
                </ProtectedRoute>
              }
            />

            <Route path="/help" element={<Help />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </QueryClientProvider>
      </BrowserRouter>
    </>
  );
}
