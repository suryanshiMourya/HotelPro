import { useState } from "react";
import { useNavigate } from "react-router-dom";
import bookingService from "../../services/bookingService";
import { getErrorMessage } from "../../services/api";

const today = new Date().toISOString().slice(0, 10);

export default function BookingForm({ room }) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const submit = async (event) => {
    event.preventDefault(); setError("");
    if (!checkIn || !checkOut || checkOut <= checkIn) { setError("Check-out must be after check-in."); return; }
    if (Number(guests) > room.capacity) { setError(`This room allows up to ${room.capacity} guests.`); return; }
    try {
      setBusy(true);
      const response = await bookingService.create({ roomId: room._id, checkIn, checkOut, guests: Number(guests) });
      navigate(`/payment?bookingId=${response.booking._id}`, { state: { booking: response.booking } });
    } catch (err) { setError(getErrorMessage(err)); }
    finally { setBusy(false); }
  };

  return <form className="booking-form" onSubmit={submit}>
    <h3>Reserve this room</h3>
    <div className="form-grid two-col">
      <label>Check-in<input className="form-control" type="date" min={today} value={checkIn} onChange={e => setCheckIn(e.target.value)} required /></label>
      <label>Check-out<input className="form-control" type="date" min={checkIn || today} value={checkOut} onChange={e => setCheckOut(e.target.value)} required /></label>
      <label className="full-field">Guests<select className="form-select" value={guests} onChange={e => setGuests(e.target.value)}>{Array.from({ length: Math.max(1, room.capacity) }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1} {i === 0 ? "guest" : "guests"}</option>)}</select></label>
    </div>
    {error && <div className="alert alert-danger mt-3">{error}</div>}
    <button className="btn btn-dark w-100 mt-3" disabled={busy}>{busy ? "Creating booking..." : "Continue to payment"}</button>
    <small className="muted-note">A booking is created as pending payment. No money is charged by this college-project mock gateway.</small>
  </form>;
}