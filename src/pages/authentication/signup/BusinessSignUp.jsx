import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Info } from "lucide-react";
import api from "../../../utilis/api";
import { generateRandomCode } from "../../../utilis/functions";
import { setSession } from "../../../utilis/storage";
import AuthLayout, { PanelChecklist, PanelHeading } from "../../../components/auth/AuthLayout";
import { ErrorBanner, Field, TextInput, PasswordInput, SubmitButton } from "../../../components/auth/Fields";

const Panel = () => (
  <>
    <PanelHeading sub="Create your business account, configure approval workflows, and start managing financial requests today.">
      Set up your<br />
      <span className="text-brand-300">organization</span> in minutes
    </PanelHeading>
    <PanelChecklist items={["Manage multiple departments", "Custom approval workflows", "Team collaboration", "Full financial visibility"]} />
  </>
);

const BusinessSignUp = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    company_name: "", email: "", password: "", confirm: "", company_code: "",
  });

  const { company_name, email, password, confirm } = formData;
  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setLoading(true);
    setError("");
    try {
      const updatedFormData = { ...formData, company_code: generateRandomCode(6) };
      const res = await api.post("/auth/company_register", updatedFormData);
      setSession({ user: res.data.user, token: res.data.token, refreshToken: res.data.refreshToken });
      navigate("/setup");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      panel={<Panel />}
      backTo="/pickuser"
      badge="Business Account"
      badgeTone="brand"
      title="Create your organization"
      subtitle="Set up your company workspace and start managing requisitions."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">Sign in</Link>
        </>
      }
    >
      <ErrorBanner message={error} />

      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Company name" htmlFor="company_name">
          <TextInput id="company_name" name="company_name" type="text" required placeholder="Acme Corporation" value={company_name} onChange={onChange} />
        </Field>

        <Field label="Work email" htmlFor="email">
          <TextInput id="email" name="email" type="email" autoComplete="email" required placeholder="admin@company.com" value={email} onChange={onChange} />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Password" htmlFor="password">
            <PasswordInput id="password" name="password" autoComplete="new-password" required placeholder="Min 8 characters" value={password} onChange={onChange} />
          </Field>
          <Field label="Confirm password" htmlFor="confirm">
            <PasswordInput id="confirm" name="confirm" autoComplete="new-password" required placeholder="Repeat" value={confirm} onChange={onChange} />
          </Field>
        </div>

        <div className="flex items-start gap-2.5 rounded-lg bg-brand-50 ring-1 ring-brand-100 px-3.5 py-3">
          <Info className="w-4 h-4 text-brand-600 flex-shrink-0 mt-px" />
          <p className="text-xs text-brand-800 leading-relaxed">
            A unique company code will be generated automatically. Share it with employees to invite them to your workspace.
          </p>
        </div>

        <div className="pt-2">
          <SubmitButton loading={loading} loadingText="Creating account...">Create business account</SubmitButton>
        </div>
      </form>
    </AuthLayout>
  );
};

export default BusinessSignUp;
