interface EmailDeliveryNoticeProps {
  devMode?: boolean;
  setupUrl?: string;
  delivered?: boolean;
  variant?: "info" | "warning";
}

export function EmailDeliveryNotice({
  devMode,
  setupUrl,
  delivered,
  variant = "warning",
}: EmailDeliveryNoticeProps) {
  if (delivered) {
    return (
      <div className="alert alert-success py-2 small mb-0">
        Email sent successfully. Check your inbox (and spam folder).
      </div>
    );
  }

  if (!setupUrl) {
    return null;
  }

  return (
    <div className={`alert alert-${variant} py-2 small mb-0`}>
      <strong>
        {devMode
          ? "Email delivery is not configured on this server."
          : "Email could not be delivered."}
      </strong>
      <p className="mb-2 mt-1">
        Share this link with the user so they can set their password and complete verification:
      </p>
      <a href={setupUrl} className="spa-auth-link d-block" target="_blank" rel="noreferrer">
        {setupUrl}
      </a>
    </div>
  );
}
