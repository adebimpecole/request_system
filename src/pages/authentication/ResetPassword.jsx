import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CircleCheck } from "lucide-react";
import api from "../../utilis/api";
import AuthLayout, { PanelHeading } from "../../components/auth/AuthLayout";
import { ErrorBanner, Field, PasswordInput, SubmitButton } from "../../components/auth/Fields";

const Panel = () => (
  <PanelHeading sub="Make it something you'll remember — you'll need it to sign back in.">
    Choose a new<br />
    <span className="text-brand-300">password</span>
  </PanelHeading>
);

const primaryLink = "w-full h-11 inline-flex items-center justify-center rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-colors";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/reset_password", { token, password, confirm });
      setDone(true);
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      setError(err.response?.data?.message || "Could not reset your password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthLayout panel={<Panel />} backTo="/login" title="Invalid reset link" subtitle="This password reset link is missing its token. Request a new one below.">
        <Link to="/forgot-password" className={primaryLink}>Request a new link</Link>
      </AuthLayout>
    );
  }

  if (done) {
    return (
      <AuthLayout panel={<Panel />} title="Password updated" subtitle="Taking you to sign in...">
        <div className="mb-6 w-12 h-12 rounded-xl bg-emerald-50 ring-1 ring-emerald-200 flex items-center justify-center">
          <CircleCheck className="w-6 h-6 text-emerald-600" />
        </div>
        <Link to="/login" className={primaryLink}>Go to sign in now</Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      panel={<Panel />}
      backTo="/login"
      badge="Password reset"
      badgeTone="brand"
      title="Set a new password"
      subtitle="Choose a new password for your account."
      footer={
        <>
          Remembered it after all?{" "}
          <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">Back to sign in</Link>
        </>
      }
    >
      <ErrorBanner message={error} />

      <form onSubmit={onSubmit} className="space-y-5">
        <Field label="New password" htmlFor="password">
          <PasswordInput
            id="password" name="password" autoComplete="new-password" required
            placeholder="At least 8 characters" value={password} onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        <Field label="Confirm new password" htmlFor="confirm">
          <PasswordInput
            id="confirm" name="confirm" autoComplete="new-password" required
            placeholder="Re-enter your new password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
          />
        </Field>
        <div className="pt-1">
          <SubmitButton loading={loading} loadingText="Updating password...">Reset password</SubmitButton>
        </div>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;
