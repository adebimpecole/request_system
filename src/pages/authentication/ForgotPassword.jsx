import React, { useState } from "react";
import { Link } from "react-router-dom";
import { MailCheck } from "lucide-react";
import api from "../../utilis/api";
import AuthLayout, { PanelHeading } from "../../components/auth/AuthLayout";
import { ErrorBanner, Field, TextInput, SubmitButton } from "../../components/auth/Fields";

const Panel = () => (
  <PanelHeading sub="Enter the email on your account and we'll send you a link to choose a new password.">
    Locked out?<br />
    <span className="text-brand-300">We'll get you back in.</span>
  </PanelHeading>
);

const backToSignIn = (
  <>
    Remembered your password?{" "}
    <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">Back to sign in</Link>
  </>
);

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/forgot_password", { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthLayout panel={<Panel />} backTo="/login" title="Check your email">
        <div className="mb-6 w-12 h-12 rounded-xl bg-emerald-50 ring-1 ring-emerald-200 flex items-center justify-center">
          <MailCheck className="w-6 h-6 text-emerald-600" />
        </div>
        <p className="text-slate-500 text-sm mb-8">
          If an account exists for <span className="font-semibold text-navy-900">{email}</span>, we've sent a link to reset your password. It expires in 1 hour.
        </p>
        <Link to="/login" className="w-full h-11 inline-flex items-center justify-center rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-colors">
          Back to sign in
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      panel={<Panel />}
      backTo="/login"
      badge="Password reset"
      badgeTone="brand"
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a link to reset it."
      footer={backToSignIn}
    >
      <ErrorBanner message={error} />

      <form onSubmit={onSubmit} className="space-y-5">
        <Field label="Email address" htmlFor="email">
          <TextInput
            id="email" name="email" type="email" autoComplete="email" required
            placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <div className="pt-1">
          <SubmitButton loading={loading} loadingText="Sending link...">Send reset link</SubmitButton>
        </div>
      </form>
    </AuthLayout>
  );
};

export default ForgotPassword;
