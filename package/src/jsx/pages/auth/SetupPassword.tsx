import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import { PasswordInput } from "../../starPolice/shared/PasswordInput";
import { api } from "../../starPolice/api";
import { notify } from "../../starPolice/toast";
import type { PanelType } from "../../starPolice/types";

type Step = "password" | "otp";

const loginPaths: Record<PanelType, string> = {
  admin: "/admin/login",
  staff: "/staff/login",
  student: "/student/login",
};

const SetupPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("password");
  const [panel, setPanel] = useState<PanelType>("admin");
  const [purpose, setPurpose] = useState<"setup" | "reset">("setup");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [invalid, setInvalid] = useState(false);

  useEffect(() => {
    if (!token) {
      setInvalid(true);
      setValidating(false);
      return;
    }

    api
      .verifySetupToken(token)
      .then((info) => {
        if (!info.valid) {
          setInvalid(true);
          return;
        }
        if (info.panel) setPanel(info.panel);
        if (info.purpose) setPurpose(info.purpose);
        if (info.email) setMaskedEmail(info.email);
      })
      .catch(() => setInvalid(true))
      .finally(() => setValidating(false));
  }, [token]);

  const onRequestOtp = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await api.requestOtp(token, password, confirmPassword);
      setMaskedEmail(result.email);
      setStep("otp");
      notify.success("Verification code sent to your email.");
      if (result.devMode) {
        notify.info("SMTP is not configured. Check the API server console for the verification code.");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send verification code";
      setError(message);
      notify.error(err, "Failed to send verification code");
    } finally {
      setLoading(false);
    }
  };

  const onVerifyOtp = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await api.verifyOtp(token, otp);
      notify.success(result.message);
      navigate(loginPaths[result.panel]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Verification failed";
      setError(message);
      notify.error(err, "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const onResendOtp = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await api.resendOtp(token);
      notify.success("A new verification code has been sent.");
      if (result.devMode) {
        notify.info("SMTP is not configured. Check the API server console for the verification code.");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to resend code";
      setError(message);
      notify.error(err, "Failed to resend code");
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <AuthLayout panel="admin" title="Loading..." subtitle="Validating your secure link.">
        <div className="text-center py-4">Please wait...</div>
      </AuthLayout>
    );
  }

  if (invalid) {
    return (
      <AuthLayout
        panel="admin"
        title="Link Expired"
        subtitle="This password setup link is invalid or has expired."
        footer={
          <p className="text-center mt-3 mb-0">
            <Link to="/admin/login" className="spa-auth-link">Admin login</Link>
            {" · "}
            <Link to="/staff/login" className="spa-auth-link">Staff login</Link>
            {" · "}
            <Link to="/student/login" className="spa-auth-link">Student login</Link>
          </p>
        }
      >
        <div className="alert alert-warning">
          Request a new link from your administrator or use forgot password on the login page.
        </div>
      </AuthLayout>
    );
  }

  const title = purpose === "reset" ? "Reset Password" : "Create Password";
  const subtitle =
    step === "password"
      ? purpose === "reset"
        ? "Enter a new password for your account."
        : "Set your password to activate your panel access."
      : `Enter the 6-digit code sent to ${maskedEmail || "your email"}.`;

  return (
    <AuthLayout panel={panel} title={title} subtitle={subtitle}>
      {error && <div className="alert alert-danger py-2">{error}</div>}

      {step === "password" ? (
        <form onSubmit={onRequestOtp}>
          <div className="mb-3">
            <label className="form-label">New Password</label>
            <PasswordInput
              className="form-control spa-auth-input"
              value={password}
              onChange={setPassword}
              placeholder="At least 8 characters"
              required
              autoComplete="new-password"
            />
          </div>
          <div className="mb-4">
            <label className="form-label">Confirm Password</label>
            <PasswordInput
              className="form-control spa-auth-input"
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="Confirm your password"
              required
              autoComplete="new-password"
            />
          </div>
          <button type="submit" className="btn spa-auth-btn w-100" disabled={loading}>
            {loading ? "Sending code..." : "Continue & Send Verification Code"}
          </button>
        </form>
      ) : (
        <form onSubmit={onVerifyOtp}>
          <div className="mb-4">
            <label className="form-label">Verification Code</label>
            <input
              type="text"
              className="form-control spa-auth-input text-center"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="6-digit code"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              required
            />
          </div>
          <button type="submit" className="btn spa-auth-btn w-100 mb-2" disabled={loading}>
            {loading ? "Verifying..." : purpose === "reset" ? "Reset Password" : "Activate Account"}
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary w-100"
            onClick={onResendOtp}
            disabled={loading}
          >
            Resend Code
          </button>
          <button
            type="button"
            className="btn btn-link w-100 mt-2"
            onClick={() => {
              setStep("password");
              setOtp("");
              setError("");
            }}
          >
            Change password
          </button>
        </form>
      )}
    </AuthLayout>
  );
};

export default SetupPassword;
