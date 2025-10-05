import axios, { AxiosInstance } from "axios";
import localStorageService from "./local.service";

class ApiBaseService {
  guestRequest: AxiosInstance;
  authorizedRequest: AxiosInstance;

  constructor() {
    // for guest api call
    this.guestRequest = axios.create({
      baseURL: "https://exotrack.makuta.cash/api/V1",
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.guestRequest.interceptors.request.use(
      (config) => {
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // for authenticated api call
    this.authorizedRequest = axios.create({
      baseURL: "https://exotrack.makuta.cash/api/V1",
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.authorizedRequest.interceptors.request.use(
      (config) => {
        const accessToken = localStorageService.getAccessToken();

        if (accessToken) {
          // Configure this as per your backend requirements
          config.headers["VAuthorization"] = `Bearer ${accessToken}`;
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle 401/403 errors
    this.authorizedRequest.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        if (
          error.response &&
          (error.response.status === 401 || error.response.status === 403)
        ) {
          // Clear user data from localStorage
          localStorage.removeItem("isLogin");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("userData");
          localStorageService.removeUser();

          // Redirect to login page
          window.location.href = "/sign-in";
        }
        return Promise.reject(error);
      }
    );
  }
}

export default ApiBaseService;
