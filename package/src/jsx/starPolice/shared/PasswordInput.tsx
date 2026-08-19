import { useState } from "react";

type PasswordInputProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  required?: boolean;
  id?: string;
  name?: string;
  autoComplete?: string;
};

export function PasswordInput({
  value,
  onChange,
  className = "form-control",
  placeholder,
  required,
  id,
  name,
  autoComplete,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="spa-password-field">
      <input
        id={id}
        name={name}
        type={visible ? "text" : "password"}
        className={className}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
      />
      <button
        type="button"
        className="spa-password-toggle"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? "Hide password" : "Show password"}
        tabIndex={-1}
      >
        <i className={`bi ${visible ? "bi-eye-slash" : "bi-eye"}`} aria-hidden="true" />
      </button>
    </div>
  );
}
