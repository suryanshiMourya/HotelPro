import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import bookingService from "../services/bookingService";
import paymentService from "../services/paymentService";
import MockPaymentForm from "../components/payments/MockPaymentForm";
import PaymentStatus from "../components/payments/PaymentStatus";
import Loader from "../components/common/Loader";
import formatCurrency from "../utils/formatCurrency";
import formatDate from "../utils/formatDate";
import { getErrorMessage } from "../services/api";

export default function Payment() {
  const [params] = useSearchParams();
  const bookingId = params.get("bookingId");
  const [booking, setBooking] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  useEffect(() => { bookingService.mine().then(data => setBooking((data.bookings || []).find(b => b._id === bookingId) || null)).catch(err => setError(getErrorMessage(err))).finally(() => setLoading(false)); }, [bookingId]);
  const create = async method => { setBusy(true); setError(""); setNotice(""); try { const data = await paymentService.createMock({ bookingId, paymentMethod: method }); setPayment(data.payment); setNotice(data.message); } catch (err) { setError(getErrorMessage(err)); } finally { setBusy(false); } };
  const complete = async outcome => { setBusy(true); setError(""); setNotice(""); try { const data = await paymentService.completeMock({ paymentId: payment._id, outcome }); setNotice(data.message + (data.note ? ` — ${data.note}` : "")); if (data.paymentStatus === "failed") setPayment(p => ({ ...p, paymentStatus: "failed" })); else { setPayment(p => ({ ...p, paymentStatus: "paid", transactionId: data.payment?.transactionId })); setBooking(b => ({ ...b, paymentStatus: "paid" })); } } catch (err) { setError(getErrorMessage(err)); } finally { setBusy(false); } };
  if (loading) return <Loader label="Loading booking..." />;
  if (!booking) return <section className="container section-space"><div className="empty-panel"><h3>Booking not found</h3><p>Open this page from one of your bookings.</p><Link to="/my-bookings" className="btn btn-dark">My bookings</Link></div></section>;
  return <section className="container section-space payment-page"><div className="page-title"><span className="eyebrow">SECURE CHECKOUT DEMO</span><h1>Payment</h1><p>Complete the simulated payment for your HotelPro reservation.</p></div><div className="payment-layout"><div className="payment-summary"><h2>Booking summary</h2><div className="summary-row"><span>Hotel</span><strong>{booking.hotel?.name}</strong></div><div className="summary-row"><span>Room</span><strong>{booking.room?.roomNumber} · {booking.room?.roomType}</strong></div><div className="summary-row"><span>Stay</span><strong>{formatDate(booking.checkIn)} – {formatDate(booking.checkOut)}</strong></div><div className="summary-row"><span>Guests / nights</span><strong>{booking.guests} / {booking.nights}</strong></div><div className="summary-total"><span>Total</span><strong>{formatCurrency(booking.totalAmount)}</strong></div><div className="summary-row"><span>Booking payment status</span><PaymentStatus status={booking.paymentStatus} /></div></div><div className="payment-action"><h2>Payment method</h2>{error && <div className="alert alert-danger">{error}</div>}{notice && <div className="alert alert-info">{notice}</div>}{booking.paymentStatus === "paid" ? <div className="success-panel"><PaymentStatus status="paid" /><h3>Payment completed</h3><p>Your booking is marked as paid. This was a simulated college-project transaction.</p><Link to="/my-bookings" className="btn btn-dark">View bookings</Link></div> : !payment || payment.paymentStatus === "failed" ? <MockPaymentForm onCreate={create} busy={busy} /> : <div className="mock-checkout"><PaymentStatus status={payment.paymentStatus} /><p>Payment reference: <strong>{payment.mockReference}</strong></p><h3>{formatCurrency(payment.amount)}</h3><p>Choose an outcome to demonstrate the payment workflow.</p><button className="btn btn-success w-100 mb-2" disabled={busy} onClick={() => complete("success")}>{busy ? "Processing..." : "Simulate successful payment"}</button><button className="btn btn-outline-danger w-100" disabled={busy} onClick={() => complete("failure")}>Simulate failed payment</button><small className="muted-note">These controls do not charge money. They only update your local project database.</small></div>}</div></div></section>;
}