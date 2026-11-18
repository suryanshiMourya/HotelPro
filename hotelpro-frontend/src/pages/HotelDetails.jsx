import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { MapPin, Wifi, LoaderCircle } from "lucide-react";
import hotelService from "../services/hotelService";
import roomService from "../services/roomService";
import RoomCard from "../components/hotels/RoomCard";
import BookingForm from "../components/booking/BookingForm";
import Loader from "../components/common/Loader";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../services/api";

export default function HotelDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    Promise.all([hotelService.get(id), roomService.list({ hotelId: id })])
      .then(([hotelData, roomData]) => { setHotel(hotelData.hotel); setRooms(roomData.rooms || []); })
      .catch(err => setError(getErrorMessage(err, "Unable to load hotel details.")))
      .finally(() => setLoading(false));
  }, [id]);
  if (loading) return <Loader label="Loading hotel details..." />;
  if (error || !hotel) return <div className="container section-space"><div className="alert alert-danger">{error || "Hotel not found."}</div></div>;
  return <section className="container section-space page-container"><div className="detail-hero"><div className="detail-cover">{hotel.images?.[0] ? <img src={hotel.images[0]} alt={hotel.name} /> : <div className="image-placeholder"><span>HOTELPRO</span></div>}</div><div className="detail-heading"><span className="eyebrow">HOTEL DETAILS</span><h1>{hotel.name}</h1><p className="location-line"><MapPin size={16} /> {hotel.address?.addressLine}, {hotel.address?.city}, {hotel.address?.state}, {hotel.address?.country}</p><p>{hotel.description}</p><div className="amenities-wrap">{(hotel.amenities || []).map(item => <span className="amenity-chip" key={item}><Wifi size={13} /> {item}</span>)}</div></div></div><div className="section-heading mt-5"><div><span className="eyebrow">ROOM INVENTORY</span><h2>Choose your room</h2><p>Select a room and provide your stay dates.</p></div></div>{rooms.length ? <div className="detail-columns"><div className="room-list">{rooms.map(room => <RoomCard key={room._id} room={room} onBook={setSelectedRoom} />)}</div><aside className="booking-aside">{selectedRoom ? user ? <BookingForm room={selectedRoom} /> : <div className="booking-form"><h3>Sign in to book</h3><p>Please log in with your guest account before making a reservation.</p><a className="btn btn-dark w-100" href="/login">Login</a></div> : <div className="booking-form"><h3>Ready to book?</h3><p>Select one of the rooms to see the booking form.</p><LoaderCircle size={24} /></div>}</aside></div> : <div className="empty-panel"><h3>No active rooms listed</h3><p>Please check back later or contact the hotel administrator.</p></div>}</section>;
}