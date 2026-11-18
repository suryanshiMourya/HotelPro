import { Link, NavLink, useNavigate } from "react-router-dom";
import { BedDouble, Menu, UserRound, LogOut, LayoutDashboard } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate("/"); };
  return (
    <nav className="site-nav navbar navbar-expand-lg">
      <div className="container">
        <Link className="navbar-brand brand" to="/"><BedDouble size={25} /><span>Hotel<span className="brand-gold">Pro</span></span></Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#hotelNav" aria-controls="hotelNav" aria-expanded="false" aria-label="Toggle navigation"><Menu /></button>
        <div className="collapse navbar-collapse" id="hotelNav">
          <div className="navbar-nav mx-auto nav-center">
            <NavLink className="nav-link" to="/">Home</NavLink>
            <NavLink className="nav-link" to="/hotels">Explore Hotels</NavLink>
            {user && <NavLink className="nav-link" to="/my-bookings">My Bookings</NavLink>}
            {user?.role === "admin" && <NavLink className="nav-link" to="/admin">Admin</NavLink>}
          </div>
          <div className="nav-account">
            {user ? <>
              <Link className="nav-user" to="/profile"><UserRound size={17} /> {user.name || "Account"}</Link>
              <button className="btn btn-outline-dark btn-sm" onClick={handleLogout}><LogOut size={15} /> Logout</button>
            </> : <>
              <Link className="nav-login" to="/login">Login</Link>
              <Link className="btn btn-gold btn-sm" to="/register">Sign Up</Link>
            </>}
          </div>
        </div>
      </div>
    </nav>
  );
}