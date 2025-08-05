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
import ListDashBoard from "./components/dashboard/ListDashBoard";
import PublicRoute from "./utils/PublicRoute";
import ProtectedRoute from "./utils/constant/ProtectedRoute";
import RoleBasedRoute from "./utils/constant/RoleBasedRoute";
import ProjectHome from "./pages/Dashboard/project/ProjectHomePage";
import CreateProjectPage from "./pages/Dashboard/project/CreateProjectPage";
import ProjectDetailsPage from "./pages/Dashboard/project/ProjectDetailsPage";
import ContractDetailsPage from "./pages/Dashboard/contractor/ContractDetailsPage";
import ContractListPage from "./pages/Dashboard/contractor/ContractListPage";
import ContractProjectListPage from "./pages/Dashboard/contractor/ContractProjectListPage";
import ContractCreatePage from "./pages/Dashboard/contractor/ContractCreatePage";
import AddRequestPage from "./pages/Dashboard/contractor/AddRequestPage";
import RequestListPage from "./pages/Dashboard/contractor/RequestListPage";
import SelectContractPage from "./pages/Dashboard/contractor/SelectContractPage";

export default function App() {
  const queryClient = new QueryClient();
  return (
    <>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <ToastContainer className="z-100" />
          <Routes>
            {/* Public Routes */}
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

            {/* Project Manager Routes */}
            <Route
              path="/project-home"
              element={
                <RoleBasedRoute allowedRoles={["project_manager"]}>
                  <ProjectHome />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/project-create"
              element={
                <RoleBasedRoute allowedRoles={["project_manager"]}>
                  <CreateProjectPage />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/project-dashboard"
              element={
                <RoleBasedRoute allowedRoles={["project_manager"]}>
                  <ListDashBoard />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/create-project"
              element={
                <RoleBasedRoute allowedRoles={["project_manager"]}>
                  <CreateProjectPage />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/edit-project/:projectId"
              element={
                <RoleBasedRoute allowedRoles={["project_manager"]}>
                  <CreateProjectPage />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/project-details/:projectId"
              element={
                <RoleBasedRoute allowedRoles={["project_manager", "user"]}>
                  <ProjectDetailsPage />
                </RoleBasedRoute>
              }
            />

            {/* Contractor Routes */}
            <Route
              path="/contract-details/:contractId"
              element={
                <RoleBasedRoute allowedRoles={["user", "project_manager"]}>
                  <ContractDetailsPage />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/add-request/:projectId/:contractId"
              element={
                <RoleBasedRoute allowedRoles={["user"]}>
                  <AddRequestPage />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/edit-request/:contractId/:requestId"
              element={
                <RoleBasedRoute allowedRoles={["user"]}>
                  <AddRequestPage />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/contract"
              element={
                <RoleBasedRoute allowedRoles={["user"]}>
                  <ContractListPage />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/create-contract/:projectId"
              element={
                <RoleBasedRoute allowedRoles={["user"]}>
                  <ContractCreatePage />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/edit-contract/:contractId"
              element={
                <RoleBasedRoute allowedRoles={["user"]}>
                  <ContractCreatePage />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/contract-project-list"
              element={
                <RoleBasedRoute allowedRoles={["user"]}>
                  <ContractProjectListPage />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/requests"
              element={
                <RoleBasedRoute allowedRoles={["user"]}>
                  <RequestListPage />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/select-contract"
              element={
                <RoleBasedRoute allowedRoles={["user"]}>
                  <SelectContractPage />
                </RoleBasedRoute>
              }
            />

            {/* User Routes (Regular Users) */}
            <Route
              path="/"
              element={
                <RoleBasedRoute allowedRoles={["project_manager"]}>
                  <Home />
                </RoleBasedRoute>
              }
            />
            
            {/* Default route for users */}
            <Route
              path="/"
              element={
                <RoleBasedRoute allowedRoles={["user"]}>
                  <RequestListPage />
                </RoleBasedRoute>
              }
            />

            <Route
              path="/request-details/:requestId"
              element={
                <RoleBasedRoute allowedRoles={["user", "project_manager"]}>
                  <TestRequestDetails />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/filter-data"
              element={
                <RoleBasedRoute allowedRoles={["user"]}>
                  <TestFilterData />
                </RoleBasedRoute>
              }
            />

            {/* Common Routes (All authenticated users) */}
            <Route
              path="/edit-profile"
              element={
                <ProtectedRoute>
                  <EditProfile />
                </ProtectedRoute>
              }
            />

            {/* Public Routes */}
            <Route path="/help" element={<Help />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </QueryClientProvider>
      </BrowserRouter>
    </>
  );
}
