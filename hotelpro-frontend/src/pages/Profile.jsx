import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { UserRound, Mail, ShieldCheck } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  return <section className="container section-space page-container"><div className="page-title"><span className="eyebrow">ACCOUNT SETTINGS</span><h1>My profile</h1><p>Your HotelPro account information.</p></div><div className="profile-card"><div className="profile-avatar"><UserRound size={34} /></div><h2>{user?.name || "HotelPro user"}</h2><p className="muted-note">{user?.role || "guest"} account</p><div className="profile-info"><span><Mail size={17} /> {user?.email}</span><span><ShieldCheck size={17} /> Role: {user?.role}</span></div><div className="profile-links"><Link to="/my-bookings" className="btn btn-dark">My bookings</Link><Link to="/hotels" className="btn btn-outline-dark">Explore hotels</Link></div></div></section>;
}