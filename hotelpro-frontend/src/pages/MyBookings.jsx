import { useEffect, useState } from "react";
import bookingService from "../services/bookingService";
import BookingCard from "../components/booking/BookingCard";
import Loader from "../components/common/Loader";
import { getErrorMessage } from "../services/api";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const load = async () => { try { const data = await bookingService.mine(); setBookings(data.bookings || []); } catch (err) { setError(getErrorMessage(err)); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);
  const cancel = async id => { if (!window.confirm("Are you sure you want to cancel this booking?")) return; setBusyId(id); setError(""); try { await bookingService.cancel(id); await load(); } catch (err) { setError(getErrorMessage(err)); } finally { setBusyId(""); } };
  return <section className="container section-space page-container"><div className="page-title"><span className="eyebrow">YOUR ACCOUNT</span><h1>My bookings</h1><p>Review your reservations, payment status and stay details.</p></div>{error && <div className="alert alert-danger">{error}</div>}{loading ? <Loader label="Loading your bookings..." /> : bookings.length ? <div className="stack-list">{bookings.map(b => <BookingCard key={b._id} booking={b} onCancel={cancel} busy={busyId === b._id} />)}</div> : <div className="empty-panel"><h3>No bookings yet</h3><p>Once you reserve a room, your booking details will appear here.</p><a href="/hotels" className="btn btn-gold">Explore hotels</a></div>}</section>;
}