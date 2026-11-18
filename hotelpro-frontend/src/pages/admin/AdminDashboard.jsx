import { useEffect, useState } from "react";
import { BedDouble, CalendarCheck, IndianRupee, CreditCard, Hotel } from "lucide-react";
import { Link } from "react-router-dom";
import hotelService from "../../services/hotelService";
import bookingService from "../../services/bookingService";
import paymentService from "../../services/paymentService";
import Loader from "../../components/common/Loader";
import formatCurrency from "../../utils/formatCurrency";
import formatDate from "../../utils/formatDate";
import { getErrorMessage } from "../../services/api";

export default function AdminDashboard() {
  const [data, setData] = useState({ hotels: [], bookings: [], payments: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => { Promise.all([hotelService.list(), bookingService.all(), paymentService.all()]).then(([h, b, p]) => setData({ hotels: h.hotels || [], bookings: b.bookings || [], payments: p.payments || [] })).catch(err => setError(getErrorMessage(err))).finally(() => setLoading(false)); }, []);
  if (loading) return <Loader label="Loading admin dashboard..." />;
  const revenue = data.payments.filter(p => p.paymentStatus === "paid").reduce((sum, p) => sum + (p.amount || 0), 0);
  const stats = [{ label: "Active hotels", value: data.hotels.length, icon: Hotel }, { label: "Total bookings", value: data.bookings.length, icon: CalendarCheck }, { label: "Payment records", value: data.payments.length, icon: CreditCard }, { label: "Recorded revenue", value: formatCurrency(revenue), icon: IndianRupee }];
  return <section className="container section-space page-container"><div className="page-title"><span className="eyebrow">HOTELPRO CONTROL CENTER</span><h1>Admin dashboard</h1><p>Overview of hotels, reservations and payment records.</p></div>{error && <div className="alert alert-danger">{error} Make sure you are signed in with an admin account.</div>}<div className="stats-grid">{stats.map(({ label, value, icon: Icon }) => <div className="stat-card" key={label}><Icon /><span>{label}</span><strong>{value}</strong></div>)}</div><div className="admin-shortcuts"><Link to="/admin/hotels"><Hotel /> Manage hotels</Link><Link to="/admin/rooms"><BedDouble /> Manage rooms</Link><Link to="/admin/bookings"><CalendarCheck /> Manage bookings</Link><Link to="/admin/payments"><CreditCard /> Manage payments</Link></div><div className="table-panel"><div className="table-heading"><h2>Recent bookings</h2><Link to="/admin/bookings">View all</Link></div>{data.bookings.length ? <div className="table-responsive"><table className="table align-middle"><thead><tr><th>Hotel</th><th>Guest</th><th>Check-in</th><th>Amount</th><th>Status</th></tr></thead><tbody>{data.bookings.slice(0, 6).map(b => <tr key={b._id}><td>{b.hotel?.name || "—"}</td><td>{b.guest?.name || "Guest"}</td><td>{formatDate(b.checkIn)}</td><td>{formatCurrency(b.totalAmount)}</td><td>{b.paymentStatus}</td></tr>)}</tbody></table></div> : <p className="muted-note">No bookings available.</p>}</div></section>;
}