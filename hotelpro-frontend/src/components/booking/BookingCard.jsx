import { Link } from "react-router-dom";
import { CalendarDays, MapPin, XCircle } from "lucide-react";
import formatCurrency from "../../utils/formatCurrency";
import formatDate from "../../utils/formatDate";

export default function BookingCard({ booking, onCancel, busy = false }) {
  return <article className="data-card">
    <div className="data-card-top"><div><span className="eyebrow-small">BOOKING</span><h3>{booking.hotel?.name || "Hotel"}</h3></div><span className={`pill ${booking.status === "cancelled" ? "pill-muted" : "pill-success"}`}>{booking.status?.replaceAll("_", " ")}</span></div>
    <p className="location-line"><MapPin size={14} /> {booking.hotel?.address?.city || "—"} · Room {booking.room?.roomNumber || "—"} ({booking.room?.roomType || "—"})</p>
    <div className="booking-facts"><span><CalendarDays size={15} /> {formatDate(booking.checkIn)} – {formatDate(booking.checkOut)}</span><span>{booking.nights} night(s) · {booking.guests} guest(s)</span></div>
    <div className="data-card-bottom"><div><strong>{formatCurrency(booking.totalAmount)}</strong><small>Payment: {booking.paymentStatus}</small></div><div className="action-row">{booking.paymentStatus !== "paid" && booking.status !== "cancelled" && <Link className="btn btn-gold btn-sm" to={`/payment?bookingId=${booking._id}`}>Pay now</Link>}{booking.status === "confirmed" && <button className="btn btn-outline-danger btn-sm" disabled={busy} onClick={() => onCancel(booking._id)}><XCircle size={14} /> Cancel</button>}</div></div>
  </article>;
}