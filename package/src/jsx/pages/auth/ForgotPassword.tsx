import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import { EmailDeliveryNotice } from "./EmailDeliveryNotice";
import { api } from "../../starPolice/api";
import { notify } from "../../starPolice/toast";
import { validateEmailOrThrow } from "../../starPolice/emailValidation";
import type { PanelType } from "../../starPolice/types";

interface Props {
  panel: PanelType;
}

const panelTitles: Record<PanelType, string> = {
  admin: "Admin Panel",
  staff: "Staff Panel",
  student: "Student Panel",
};

const loginPaths: Record<PanelType, string> = {
  admin: "/admin/login",
  staff: "/staff/login",
  student: "/student/login",
};

const ForgotPassword = ({ panel }: Props) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [setupUrl, setSetupUrl] = useState("");
  const [devMode, setDevMode] = useState(false);
  const [delivered, setDelivered] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    setSetupUrl("");
    setDevMode(false);
    setDelivered(false);

    try {
      validateEmailOrThrow(email);
    } catch (validationError) {
      const message =
        validationError instanceof Error ? validationError.message : "Please enter a valid email address.";
      setError(message);
      notify.error(message);
      setLoading(false);
      return;
    }

    try {
      const result = await api.forgotPassword(email.trim(), panel);
      setSuccess(result.message);
      setSetupUrl(result.setupUrl || "");
      setDevMode(Boolean(result.devMode));
      setDelivered(Boolean(result.delivered));
      if (result.devMode) {
        notify.info("Email is not configured. Use the setup link shown on this page.");
      } else {
        notify.success("Reset link sent to your email.");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send reset link";
      setError(message);
      notify.error(err, "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      panel={panel}
      title="Forgot Password"
      subtitle={`Enter your email to receive a password reset link for the ${panelTitles[panel]}.`}
      footer={
        <p className="text-center mt-3 mb-0">
          <Link to={loginPaths[panel]} className="spa-auth-link">
            Back to sign in
          </Link>
        </p>
      }
    >
      {error && <div className="alert alert-danger py-2">{error}</div>}
      {success && <div className="alert alert-success py-2">{success}</div>}
      {(devMode && setupUrl) && (
        <div className="mb-3">
          <EmailDeliveryNotice devMode={devMode} setupUrl={setupUrl} delivered={delivered} />
        </div>
      )}
      <form onSubmit={onSubmit} noValidate>
        <div className="mb-4">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-control spa-auth-input"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError("");
            }}
            placeholder="your@email.com"
            required
          />
        </div>
        <button type="submit" className="btn spa-auth-btn w-100" disabled={loading}>
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
    </AuthLayout>
  );
};

export default ForgotPassword;
