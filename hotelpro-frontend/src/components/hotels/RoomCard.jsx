import { BedDouble, Users, Wifi } from "lucide-react";
import formatCurrency from "../../utils/formatCurrency";

export default function RoomCard({ room, onBook }) {
  return <article className="room-card">
    <div className="room-icon"><BedDouble size={30} /></div>
    <div className="room-main"><div className="room-title-row"><h3>{room.roomType} Room</h3><span className="pill pill-success">Active room</span></div>
      <p>Room {room.roomNumber} · {room.description || "Comfortable room with modern amenities."}</p>
      <div className="amenity-line"><Users size={15} /> Up to {room.capacity} guests <Wifi size={15} /> {(room.amenities || []).slice(0, 3).join(" · ")}</div>
    </div>
    <div className="room-price"><strong>{formatCurrency(room.pricePerNight)}</strong><small>per night</small><button className="btn btn-gold" onClick={() => onBook(room)}>Book this room</button></div>
  </article>;
}