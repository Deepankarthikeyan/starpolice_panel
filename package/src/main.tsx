import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { AppContextProvider } from "./context/ThemeContext.tsx";
import App from "./App.tsx";
import "./assets/css/style.css";
import "./assets/css/star-police-brand.css";
import "./assets/css/spa-sidebar.css";
import "./assets/css/spa-responsive.css";
import "react-datepicker/dist/react-datepicker.css";
import "react-toastify/dist/ReactToastify.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppContextProvider>
      <BrowserRouter>
        <App />
        <ToastContainer
          position="top-right"
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          theme="colored"
        />
      </BrowserRouter>
    </AppContextProvider>
  </StrictMode>
);
