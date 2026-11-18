import { useEffect, useState } from "react";
import { ArrowRight, CalendarDays, MapPin, ShieldCheck, Sparkles, Users } from "lucide-react";
import { Link } from "react-router-dom";
import hotelService from "../services/hotelService";
import HotelCard from "../components/hotels/HotelCard";
import Loader from "../components/common/Loader";
import { getErrorMessage } from "../services/api";

export default function Home() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => { hotelService.list().then(data => setHotels((data.hotels || []).slice(0, 3))).catch(err => setError(getErrorMessage(err, "Unable to load featured hotels."))).finally(() => setLoading(false)); }, []);
  return <>
    <section className="hero-section"><div className="hero-overlay" /><div className="container hero-content"><span className="eyebrow">A BETTER WAY TO STAY</span><h1>Find your perfect<br /><em>place to stay.</em></h1><p>Discover welcoming hotels, comfortable rooms and a simpler booking experience with HotelPro.</p><Link to="/hotels" className="btn btn-gold btn-lg">Explore hotels <ArrowRight size={18} /></Link></div></section>
    <section className="container search-strip"><div className="search-strip-item"><MapPin /><div><strong>Destination</strong><span>Explore available hotels</span></div></div><div className="search-strip-item"><CalendarDays /><div><strong>Flexible stays</strong><span>Choose your dates</span></div></div><div className="search-strip-item"><Users /><div><strong>Guest friendly</strong><span>Rooms for every group</span></div></div><Link className="btn btn-dark" to="/hotels">Find a hotel</Link></section>
    <section className="container section-space"><div className="section-heading"><div><span className="eyebrow">DISCOVER YOUR STAY</span><h2>Featured hotels</h2><p>Explore the properties currently listed on HotelPro.</p></div><Link className="text-link" to="/hotels">View all hotels <ArrowRight size={16} /></Link></div>
      {loading ? <Loader label="Loading hotels..." /> : error ? <div className="alert alert-warning">{error}</div> : hotels.length ? <div className="hotel-grid">{hotels.map(h => <HotelCard key={h._id} hotel={h} />)}</div> : <div className="empty-panel"><h3>Your next stay starts here</h3><p>No hotels have been published yet. Add a hotel from the admin dashboard to display it here.</p><Link to="/hotels" className="btn btn-outline-dark">Browse hotels</Link></div>}
    </section>
    <section className="benefit-section"><div className="container benefit-grid"><div><ShieldCheck /><h3>Secure accounts</h3><p>Protected access for guests and hotel administrators.</p></div><div><CalendarDays /><h3>Simple reservations</h3><p>View booking details and manage your reservations in one place.</p></div><div><Sparkles /><h3>Easy management</h3><p>Manage hotels, rooms, bookings and payment records.</p></div></div></section>
  </>;
}