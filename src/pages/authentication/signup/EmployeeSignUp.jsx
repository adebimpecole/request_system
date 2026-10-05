import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CircleCheck } from "lucide-react";
import api from "../../../utilis/api";
import { setSession } from "../../../utilis/storage";
import AuthLayout, { PanelChecklist, PanelHeading } from "../../../components/auth/AuthLayout";
import { ErrorBanner, Field, TextInput, PasswordInput, SubmitButton } from "../../../components/auth/Fields";


const Panel = () => (
  <>
    <PanelHeading sub="You'll need your company code to get started.">
      Join your<br />organization
    </PanelHeading>
    <PanelChecklist items={["Submit financial requests", "Track approval status", "View spending history", "Get instant notifications"]} />
  </>
);

const EmployeeSignUp = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get("invite");

  const [departmentList, setDepartmentList] = useState([]);
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [codeVerified, setCodeVerified] = useState(false);

  const [inviteChecked, setInviteChecked] = useState(!inviteToken);
  const [inviteError, setInviteError] = useState("");
  const [inviteLocked, setInviteLocked] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "", lastName: "", department: "",
    email: "", password: "", confirm: "", companyCode: "", role: "requester",
  });

  const { firstName, lastName, companyCode, department, email, password, confirm } = formData;

  // Resolve the invite token (if present) and lock the fields it provides
  useEffect(() => {
    if (!inviteToken) return;
    const resolveInvite = async () => {
      try {
        const res = await api.get(`/employee/invite/${inviteToken}`);
        setFormData((prev) => ({
          ...prev,
          email: res.data.email,
          department: res.data.department || prev.department,
          companyCode: res.data.company_code,
        }));
        setCompanyName(res.data.company_name || "");
        setCodeVerified(true);
        setInviteLocked(true);
      } catch (err) {
        setInviteError(err.response?.data?.message || "This invite link is invalid or has expired.");
      } finally {
        setInviteChecked(true);
      }
    };
    resolveInvite();
  }, [inviteToken]);

  useEffect(() => {
    if (inviteToken) return; // invite already resolved company code/departments
    if (companyCode.length < 6) { setDepartmentList([]); setCompanyName(""); setCodeVerified(false); return; }
    const fetch = async () => {
      try {
        const deptRes = await api.get(`/department/get_department/${companyCode}`);
        setDepartmentList(deptRes?.data || []);
        setCodeVerified(true);
      } catch { setCodeVerified(false); setDepartmentList([]); setCompanyName(""); }
    };
    fetch();
  }, [companyCode, inviteToken]);

  // Load departments for the invited company too, once the code is known
  useEffect(() => {
    if (!inviteLocked || !companyCode) return;
    const fetch = async () => {
      try {
        const deptRes = await api.get(`/department/get_department/${companyCode}`);
        setDepartmentList(deptRes?.data || []);
      } catch { setDepartmentList([]); }
    };
    fetch();
  }, [inviteLocked, companyCode]);

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setLoading(true); setError("");
    try {
      const payload = inviteToken ? { ...formData, inviteToken } : formData;
      const res = await api.post("/auth/employee_register", payload);
      setSession({ user: res.data.user, token: res.data.token, refreshToken: res.data.refreshToken });
      navigate("/employeedashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally { setLoading(false); }
  };

  if (inviteToken && !inviteChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <svg className="w-6 h-6 animate-spin text-brand-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (inviteToken && inviteError) {
    return (
      <AuthLayout panel={<Panel />} backTo="/pickuser" title="Invite link unavailable" subtitle={inviteError}>
        <Link to="/pickuser" className="w-full h-11 inline-flex items-center justify-center rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-colors">
          Go back
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      panel={<Panel />}
      backTo="/pickuser"
      badge="Employee Account"
      badgeTone="brand"
      title="Join an organization"
      subtitle="You'll need your company code to get started."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">Sign in</Link>
        </>
      }
    >
      <ErrorBanner message={error} />

      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Company code" htmlFor="companyCode">
          <TextInput
            id="companyCode" name="companyCode" type="text" required disabled={inviteLocked}
            placeholder="Enter 6-digit code" value={companyCode} onChange={onChange}
            trailing={codeVerified ? <CircleCheck className="w-4 h-4 text-emerald-500" /> : null}
          />
          {codeVerified && companyName && (
            <p className="mt-1.5 text-xs text-emerald-600 font-medium">
              Connected to <span className="capitalize">{companyName}</span>
            </p>
          )}
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="First name" htmlFor="firstName">
            <TextInput id="firstName" name="firstName" type="text" required placeholder="Jane" value={firstName} onChange={onChange} />
          </Field>
          <Field label="Last name" htmlFor="lastName">
            <TextInput id="lastName" name="lastName" type="text" required placeholder="Doe" value={lastName} onChange={onChange} />
          </Field>
        </div>

        <Field label="Department" htmlFor="department">
          {departmentList.length > 0 ? (
            <TextInput as="select" id="department" name="department" required value={department} onChange={onChange}>
              <option value="">Select a department</option>
              {departmentList.map((d) => <option key={d.name} value={d.name}>{d.name}</option>)}
            </TextInput>
          ) : (
            <TextInput id="department" type="text" disabled placeholder="Enter company code to load departments" />
          )}
        </Field>

        <Field label="Work email" htmlFor="email">
          <TextInput
            id="email" name="email" type="email" required disabled={inviteLocked}
            placeholder="jane@company.com" value={email} onChange={onChange}
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Password" htmlFor="password">
            <PasswordInput id="password" name="password" autoComplete="new-password" required placeholder="Min 8 chars" value={password} onChange={onChange} />
          </Field>
          <Field label="Confirm password" htmlFor="confirm">
            <PasswordInput id="confirm" name="confirm" autoComplete="new-password" required placeholder="Repeat" value={confirm} onChange={onChange} />
          </Field>
        </div>

        <div className="pt-2">
          <SubmitButton loading={loading} loadingText="Creating account...">Create employee account</SubmitButton>
        </div>
      </form>
    </AuthLayout>
  );
};

export default EmployeeSignUp;
