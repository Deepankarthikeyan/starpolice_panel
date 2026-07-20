import "react-datepicker/dist/react-datepicker.css";
import "nouislider/distribute/nouislider.css";
import "ckeditor5/ckeditor5.css";
import "./assets/css/style.css";

import { Fragment, Suspense, useContext, useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";

import Index from "./jsx/Index";
import Login from "./jsx/pages/Login";
import { ThemeContext } from "./context/ThemeContext";
import type { AuthUser } from "./jsx/starPolice/types";

function App() {
  const { auth, setAuth } = useContext(ThemeContext);
  const navigate = useNavigate();

  function resizeHandler() {
    if (window.innerWidth <= 775) {
      document.body.setAttribute("data-sidebar-style", "overlay");
    } else if (window.innerWidth >= 1024) {
      document.body.setAttribute("data-sidebar-style", "full");
    } else {
      document.body.setAttribute("data-sidebar-style", "mini");
    }
  }

  useEffect(() => {
    setTimeout(() => {
      resizeHandler();
    }, 100);
    window.addEventListener("resize", resizeHandler);
    return () => {
      window.removeEventListener("resize", resizeHandler);
    };
  }, []);

  useEffect(() => {
    const data = localStorage.getItem("AUTH");
    if (data) {
      const parsedData = JSON.parse(data) as AuthUser;
      setAuth(parsedData);
    } else {
      navigate("/login");
    }
  }, [navigate, setAuth]);

  if (auth?.email && auth?.password && auth?.role) {
    return (
      <Fragment>
        <Suspense
          fallback={
            <div id="preloader">
              <div className="sk-three-bounce">
                <div className="sk-child sk-bounce1"></div>
                <div className="sk-child sk-bounce2"></div>
                <div className="sk-child sk-bounce3"></div>
              </div>
            </div>
          }
        >
          <Index />
        </Suspense>
      </Fragment>
    );
  }

  return (
    <Fragment>
      <div className="vh-100">
        <Suspense
          fallback={
            <div id="preloader">
              <div className="sk-three-bounce">
                <div className="sk-child sk-bounce1"></div>
                <div className="sk-child sk-bounce2"></div>
                <div className="sk-child sk-bounce3"></div>
              </div>
            </div>
          }
        >
          <Routes>
            <Route path="/login" element={<Login setAuth={setAuth} />} />
          </Routes>
        </Suspense>
      </div>
    </Fragment>
  );
}

export default App;
