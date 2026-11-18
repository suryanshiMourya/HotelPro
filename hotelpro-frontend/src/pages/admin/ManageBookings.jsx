import { useEffect, useState } from "react";
import bookingService from "../../services/bookingService";
import Loader from "../../components/common/Loader";
import formatCurrency from "../../utils/formatCurrency";
import formatDate from "../../utils/formatDate";
import { getErrorMessage } from "../../services/api";

export default function ManageBookings() {
  const [bookings, setBookings] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  useEffect(() => { bookingService.all().then(d => setBookings(d.bookings || [])).catch(e => setError(getErrorMessage(e))).finally(() => setLoading(false)); }, []);
  if (loading) return <Loader />;
  return <section className="container section-space page-container"><div className="page-title"><span className="eyebrow">ADMINISTRATION</span><h1>Manage bookings</h1><p>Review reservations made by HotelPro guests.</p></div>{error && <div className="alert alert-danger">{error}</div>}<div className="table-panel"><div className="table-responsive"><table className="table align-middle"><thead><tr><th>Guest</th><th>Hotel / Room</th><th>Stay</th><th>Amount</th><th>Booking</th><th>Payment</th></tr></thead><tbody>{bookings.map(b => <tr key={b._id}><td>{b.guest?.name || "—"}<small className="d-block text-muted">{b.guest?.email || ""}</small></td><td>{b.hotel?.name || "—"}<small className="d-block text-muted">Room {b.room?.roomNumber || "—"}</small></td><td>{formatDate(b.checkIn)} – {formatDate(b.checkOut)}</td><td>{formatCurrency(b.totalAmount)}</td><td>{b.status}</td><td>{b.paymentStatus}</td></tr>)}</tbody></table></div>{!bookings.length && <p className="muted-note">No bookings found.</p>}</div></section>;
}