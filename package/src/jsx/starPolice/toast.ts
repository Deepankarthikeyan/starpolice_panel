import { toast, type ToastOptions } from "react-toastify";

const defaultOptions: ToastOptions = {
  position: "top-right",
  autoClose: 4000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
};

export const notify = {
  success(message: string) {
    toast.success(message, defaultOptions);
  },

  error(err: unknown, fallback = "Something went wrong") {
    const message = err instanceof Error ? err.message : fallback;
    toast.error(message, defaultOptions);
  },

  info(message: string) {
    toast.info(message, defaultOptions);
  },
};
