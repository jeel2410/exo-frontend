import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AppWrapper } from "./components/common/PageMeta.tsx";
import "./i18n/config";
import { AuthProvider } from "./context/AuthContext.tsx";
import { checkAppVersion } from "./utils/versionManager";
import "./utils/devUtils";

// Check app version before initializing the app
checkAppVersion();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppWrapper>
      <AuthProvider>
        <App />
      </AuthProvider>
    </AppWrapper>
  </StrictMode>
);
