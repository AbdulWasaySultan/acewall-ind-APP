import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { GlobalProvider } from "./Context/GlobalProvider";
import ScrollToTop from "./lib/scrolltop";
import { CourseProvider } from "./Context/CoursesProvider";
import { Toaster } from "./components/ui/sonner";
import { GoogleOAuthProvider } from "@react-oauth/google";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CSS_CLIENT_ID || "";

createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <GlobalProvider>
      <CourseProvider>
        <BrowserRouter>
          <ScrollToTop />
          <App />
          <Toaster richColors />
        </BrowserRouter>
      </CourseProvider>
    </GlobalProvider>
  </GoogleOAuthProvider>
);
