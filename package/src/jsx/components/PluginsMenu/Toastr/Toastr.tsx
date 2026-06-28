import React from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Define the type for the button click events
type NotifyFunction = () => void;

const Toastr: React.FC = () => {
  const notifyTopRight: NotifyFunction = () => {
    toast.success("✔️ Top Right !", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const notifyBottomRight: NotifyFunction = () => {
    toast.warn("✔️ Bottom Right !", {
      position: "bottom-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const notifyBottomLeft: NotifyFunction = () => {
    toast.success("✔️ Bottom Left !", {
      position: "bottom-left",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  const notifyTopLeft: NotifyFunction = () => {
    toast.warn("✔️ Top Left !", {
      position: "top-left",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  const notifyTopFullWidth: NotifyFunction = () => {
    toast.warn("✔️ Top Full Width !", {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  const notifyBottomFullWidth: NotifyFunction = () => {
    toast.warn("✔️ Bottom Full Width !", {
      position: "bottom-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  const notifyTopCenter: NotifyFunction = () => {
    toast.warn("✔️ Top Center !", {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  const notifyBottomCenter: NotifyFunction = () => {
    toast.warn("✔️ Bottom Center !", {
      position: "bottom-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  const notifyInfo: NotifyFunction = () => {
    toast.info("❓ Info Notify !", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  const notifyWarning: NotifyFunction = () => {
    toast.warn("❗ Warning Notify !", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  const notifyError: NotifyFunction = () => {
    toast.error("❌ Error Notify !", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  return (
    <div className="h-80">
      <ToastContainer />
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">Toastr</h4>
            </div>
            <div className="card-body">
              <button
                onClick={notifyTopRight}
                type="button"
                className="btn btn-dark mb-2 me-2"
                id="toastr-success-top-right"
              >
                Top Right
              </button>
              <button
                onClick={notifyBottomRight}
                type="button"
                className="btn btn-dark mb-2  me-2"
                id="toastr-success-bottom-right"
              >
                Bottom Right
              </button>
              <button
                onClick={notifyBottomLeft}
                type="button"
                className="btn btn-dark mb-2  me-2"
                id="toastr-success-bottom-left"
              >
                Bottom Left
              </button>
              <button
                onClick={notifyTopLeft}
                type="button"
                className="btn btn-dark mb-2  me-2"
                id="toastr-success-top-left"
              >
                Top Left
              </button>
              <button
                onClick={notifyTopFullWidth}
                type="button"
                className="btn btn-dark mb-2  me-2"
                id="toastr-success-top-full-width"
              >
                Top Full Width
              </button>
              <button
                onClick={notifyBottomFullWidth}
                type="button"
                className="btn btn-dark mb-2  me-2"
                id="toastr-success-bottom-full-width"
              >
                Bottom Full Width
              </button>
              <button
                onClick={notifyTopCenter}
                type="button"
                className="btn btn-dark mb-2  me-2"
                id="toastr-success-top-center"
              >
                Top Center
              </button>
              <button
                onClick={notifyBottomCenter}
                type="button"
                className="btn btn-dark mb-2  me-2"
                id="toastr-success-bottom-center"
              >
                Bottom Center
              </button>
              <button
                onClick={notifyInfo}
                type="button"
                className="btn btn-info mb-2  me-2"
                id="toastr-info-top-right"
              >
                Info
              </button>
              <button
                onClick={notifyWarning}
                type="button"
                className="btn btn-warning mb-2  me-2"
                id="toastr-warning-top-right"
              >
                Warning
              </button>
              <button
                onClick={notifyError}
                type="button"
                className="btn btn-danger mb-2  me-2"
                id="toastr-danger-top-right"
              >
                Error
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toastr;
