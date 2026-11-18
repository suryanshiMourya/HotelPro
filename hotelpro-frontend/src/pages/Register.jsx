import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserRound, Mail, LockKeyhole } from "lucide-react";
import authService from "../services/authService";
import { getErrorMessage } from "../services/api";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const update = e => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = async e => {
    e.preventDefault(); setError(""); setSuccess(""); setBusy(true);
    try {
      await authService.register(form);
      setSuccess("Account created. Please log in to continue.");
      setTimeout(() => navigate("/login", { replace: true, state: { email: form.email } }), 700);
    } catch (err) { setError(getErrorMessage(err, "Registration failed.")); }
    finally { setBusy(false); }
  };
  return <div className="auth-page"><div className="auth-card"><span className="eyebrow">JOIN HOTELPRO</span><h1>Create your account</h1><p>Register as a guest to explore and book rooms.</p><form onSubmit={submit}><label>Full name<div className="input-icon"><UserRound size={17} /><input className="form-control" name="name" value={form.name} onChange={update} placeholder="Your name" required /></div></label><label>Email address<div className="input-icon"><Mail size={17} /><input className="form-control" type="email" name="email" value={form.email} onChange={update} placeholder="you@example.com" required /></div></label><label>Password<div className="input-icon"><LockKeyhole size={17} /><input className="form-control" type="password" name="password" value={form.password} onChange={update} minLength={6} placeholder="At least 6 characters" required /></div></label>{error && <div className="alert alert-danger">{error}</div>}{success && <div className="alert alert-success">{success}</div>}<button className="btn btn-dark w-100" disabled={busy}>{busy ? "Creating account..." : "Create account"}</button></form><p className="auth-switch">Already registered? <Link to="/login">Login</Link></p><small className="muted-note">Public registration creates a guest account. Admin access is assigned separately.</small></div></div>;
}