import { useAuth } from "../../context/AuthContext";
import ListDashBoard from "../../components/dashboard/ListDashBoard";
import RequestListPage from "./contractor/RequestListPage";

const Home = () => {
  const { user } = useAuth();

  // For project managers, show the project dashboard (ListDashBoard already includes AppLayout)
  if (user?.type === "project_manager") {
    return <ListDashBoard />;
  }

  // For regular users (contractors), show the request list page
  return <RequestListPage />;
};

export default Home;
