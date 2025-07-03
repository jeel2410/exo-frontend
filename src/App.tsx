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

export default function App() {
  const queryClient = new QueryClient();
  return (
    <>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <ToastContainer className="z-100" />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/sign-up" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/otp-verification" element={<OtpVerification />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/edit-profile" element={<EditProfile />} />
            <Route path="/add-request" element={<AddRequest />} />
            <Route path="/list-project" element={<ListDashBoard />} />
            <Route path="/project-details/:projectId" element={<ProjectDetails />} />
            <Route path="/request-details/:requestId" element={<TestRequestDetails />} />
            <Route path="/filter-data" element={<TestFilterData />} />

            <Route path="/help" element={<Help />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </QueryClientProvider>
      </BrowserRouter>
    </>
  );
}
