import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../../../context/ThemeContext";

const PanelHeader = ({ title }: { title: string }) => {
  const { auth, setAuth } = useContext(ThemeContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("AUTH");
    setAuth(null);
    navigate("/login");
  };

  return (
    <div className="d-flex justify-content-between align-items-center mb-3">
      <div>
        <h4 className="mb-0 star-police-title">{title}</h4>
        <small className="text-muted">Signed in as {auth?.name}</small>
      </div>
      <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default PanelHeader;
