import { Link } from "react-router-dom";
import { MapPin, ArrowRight, Wifi } from "lucide-react";

export default function HotelCard({ hotel }) {
  const image = hotel.images?.[0];
  return <article className="hotel-card">
    <div className="hotel-card-image">{image ? <img src={image} alt={hotel.name} /> : <div className="image-placeholder"><span>HOTELPRO</span></div>}</div>
    <div className="hotel-card-body">
      <div className="location-line"><MapPin size={14} /> {hotel.address?.city || "Location unavailable"}{hotel.address?.state ? `, ${hotel.address.state}` : ""}</div>
      <h3>{hotel.name}</h3>
      <p>{hotel.description || "A welcoming place for your next stay."}</p>
      <div className="amenity-line"><Wifi size={14} /> {(hotel.amenities || []).slice(0, 3).join(" · ") || "Comfortable stay"}</div>
      <Link className="text-link" to={`/hotels/${hotel._id}`}>View hotel <ArrowRight size={16} /></Link>
    </div>
  </article>;
}