import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../utilis/api";
import { setSession } from "../../utilis/storage";
import AuthLayout, { PanelHeading } from "../../components/auth/AuthLayout";
import { ErrorBanner, Field, TextInput, PasswordInput, SubmitButton } from "../../components/auth/Fields";

const Panel = () => (
  <>
    <PanelHeading sub="Sign in to manage requisitions, track approvals, and keep your team's finances in order.">
      Welcome back to<br />
      <span className="text-brand-300">your workspace</span>
    </PanelHeading>

    <figure className="mt-10 max-w-md rounded-2xl border border-white/15 bg-white/[0.06] backdrop-blur-sm p-6">
      <blockquote className="text-white/85 text-sm leading-relaxed">
        “Prequisa cut our approval cycle time by 60%. Our finance team can't imagine going back to email chains.”
      </blockquote>
      <figcaption className="mt-5 flex items-center gap-3">
        <span className="w-9 h-9 rounded-full bg-emerald-400 flex items-center justify-center text-navy-950 font-bold text-sm">S</span>
        <span>
          <span className="block text-white font-semibold text-sm">Sarah K.</span>
          <span className="block text-white/50 text-xs">CFO, Techbridge Ltd</span>
        </span>
      </figcaption>
    </figure>
  </>
);

const LogIn = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({ email: "", password: "" });
  const { email, password } = formData;

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/login", formData);
      if (!res.data.token) {
        setError(res.data.message || "Login failed. Please try again.");
        return;
      }
      setSession({ user: res.data.user, token: res.data.token, refreshToken: res.data.refreshToken });
      navigate("/employeedashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      panel={<Panel />}
      backTo="/"
      badge="Welcome back"
      title="Sign in"
      subtitle="Enter your credentials to access your account."
      footer={
        <>
          Don't have an account?{" "}
          <Link to="/pickuser" className="font-semibold text-brand-600 hover:text-brand-700">Create one free</Link>
        </>
      }
    >
      <ErrorBanner message={error} />

      <form onSubmit={onSubmit} className="space-y-5">
        <Field label="Email address" htmlFor="email">
          <TextInput
            id="email" name="email" type="email" autoComplete="email" required
            placeholder="you@company.com" value={email} onChange={onChange}
          />
        </Field>

        <Field
          label="Password"
          htmlFor="password"
          aside={<Link to="/forgot-password" className="text-xs font-semibold text-brand-600 hover:text-brand-700">Forgot password?</Link>}
        >
          <PasswordInput
            id="password" name="password" autoComplete="current-password" required
            placeholder="Enter your password" value={password} onChange={onChange}
          />
        </Field>

        <div className="pt-1">
          <SubmitButton loading={loading} loadingText="Signing in...">Sign in</SubmitButton>
        </div>
      </form>
    </AuthLayout>
  );
};

export default LogIn;
