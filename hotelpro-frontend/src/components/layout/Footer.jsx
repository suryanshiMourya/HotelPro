import { BedDouble, Mail, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return <footer className="site-footer">
    <div className="container footer-grid">
      <div><Link to="/" className="brand footer-brand"><BedDouble /><span>Hotel<span className="brand-gold">Pro</span></span></Link><p>Comfortable stays, simple bookings and better hospitality management.</p></div>
      <div><h6>Explore</h6><Link to="/hotels">Hotels</Link><Link to="/my-bookings">My Bookings</Link></div>
      <div><h6>Contact</h6><span><Mail size={15} /> support@hotelpro.local</span><span><MapPin size={15} /> Indore, Madhya Pradesh</span></div>
    </div>
    <div className="footer-bottom">© {new Date().getFullYear()} HotelPro. College project demonstration.</div>
  </footer>;
}