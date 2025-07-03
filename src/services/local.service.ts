class LocalStorageService {
  ACCESS_TOKEN_KEY = "accessToken";
  REFRESH_TOKEN_KEY = "refreshToken";
  USER_KEY = "userData";
  USER_EMAIL = "userEmail";
  LANGUAGE = "language";
  LANGUAGE_PREVIEW_URL = "imagePreviewUrl";
  CLIENT_VIEW = "clientView";
  PROJECT_ID = "projectId";

  getLanguage() {
    if (typeof window !== "undefined" && window.localStorage) {
      return localStorage.getItem(this.LANGUAGE) || "en";
    }
    return "en";
  }

  setLanguage(data: string) {
    if (window) localStorage.setItem(this.LANGUAGE, data);
  }

  removeLanguage() {
    if (window) localStorage.removeItem(this.LANGUAGE);
  }

  getAccessToken() {
    const token = window ? localStorage.getItem(this.ACCESS_TOKEN_KEY) : null;
    return token ? JSON.parse(token) : token;
  }

  setAccessToken(data: string) {
    if (window) localStorage.setItem(this.ACCESS_TOKEN_KEY, data);
  }

  removeAccessToken() {
    if (window) localStorage.removeItem(this.ACCESS_TOKEN_KEY);
  }

  getRefreshToken() {
    return window ? localStorage.getItem(this.REFRESH_TOKEN_KEY) : null;
  }

  setRefreshToken(data: string) {
    if (window) localStorage.setItem(this.REFRESH_TOKEN_KEY, data);
  }

  removeRefreshToken() {
    if (window) localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  getUser() {
    return localStorage.getItem(this.USER_KEY);
  }

  setUser(data: any) {
    localStorage.setItem(this.USER_KEY, data);
  }

  removeUser() {
    if (window) localStorage.removeItem(this.USER_KEY);
  }

  getEmail() {
    return localStorage.getItem(this.USER_EMAIL);
  }

  setEmail(data: string) {
    localStorage.setItem(this.USER_EMAIL, data);
  }

  removeEmail() {
    localStorage.removeItem(this.USER_EMAIL);
  }

  getUrl() {
    return window ? localStorage.getItem(this.LANGUAGE_PREVIEW_URL) : null;
  }

  setUrl(data: string | undefined) {
    if (window) localStorage.setItem(this.LANGUAGE_PREVIEW_URL, data || "");
  }

  removeUrl() {
    if (window) localStorage.removeItem(this.LANGUAGE_PREVIEW_URL);
  }
  setClientView(data: boolean) {
    const stringData = JSON.stringify(data);
    if (window) localStorage.setItem(this.CLIENT_VIEW, stringData);
  }
  getClientView() {
    return typeof window !== "undefined"
      ? localStorage.getItem(this.CLIENT_VIEW)
      : null;
    // return JSON.parse(data || '');
  }
  removeClientView() {
    if (window) {
      localStorage.removeItem(this.CLIENT_VIEW);
    }
  }
  setProjectId(data: any) {
    const stringData = JSON.stringify(data);
    localStorage.setItem(this.PROJECT_ID, stringData);
  }
  getProjectId() {
    const projectID = window ? localStorage.getItem(this.PROJECT_ID) : null;
    return projectID ? JSON.parse(projectID) : null;
  }
  removeProjectId() {
    localStorage.removeItem(this.PROJECT_ID);
  }
  logoutUSer(){
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.PROJECT_ID);
  }
}

const localStorageService = new LocalStorageService();

export default localStorageService;
