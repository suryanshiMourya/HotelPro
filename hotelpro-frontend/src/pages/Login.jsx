import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LockKeyhole, Mail } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../services/api";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const update = e => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = async e => {
    e.preventDefault(); setError(""); setBusy(true);
    try {
      const response = await login(form);
      const destination = location.state?.from?.pathname || (response.user?.role === "admin" ? "/admin" : "/");
      navigate(destination, { replace: true });
    } catch (err) { setError(getErrorMessage(err, "Login failed.")); }
    finally { setBusy(false); }
  };
  return <div className="auth-page"><div className="auth-card"><span className="eyebrow">WELCOME BACK</span><h1>Sign in to HotelPro</h1><p>Access your bookings and manage your stay.</p><form onSubmit={submit}><label>Email address<div className="input-icon"><Mail size={17} /><input type="email" name="email" className="form-control" placeholder="you@example.com" value={form.email} onChange={update} required /></div></label><label>Password<div className="input-icon"><LockKeyhole size={17} /><input type="password" name="password" className="form-control" placeholder="Enter your password" value={form.password} onChange={update} required /></div></label>{error && <div className="alert alert-danger">{error}</div>}<button className="btn btn-dark w-100" disabled={busy}>{busy ? "Signing in..." : "Login"}</button></form><p className="auth-switch">New to HotelPro? <Link to="/register">Create an account</Link></p></div></div>;
}