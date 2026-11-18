import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import hotelService from "../services/hotelService";
import HotelCard from "../components/hotels/HotelCard";
import Loader from "../components/common/Loader";
import { getErrorMessage } from "../services/api";

export default function Hotels() {
  const [city, setCity] = useState("");
  const [query, setQuery] = useState("");
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const fetchHotels = async (search = "") => { setLoading(true); setError(""); try { const data = await hotelService.list(search ? { city: search } : {}); setHotels(data.hotels || []); } catch (err) { setError(getErrorMessage(err)); } finally { setLoading(false); } };
  useEffect(() => { fetchHotels(); }, []);
  const submit = e => { e.preventDefault(); setQuery(city); fetchHotels(city.trim()); };
  return <section className="container section-space page-container"><div className="page-title"><span className="eyebrow">FIND YOUR STAY</span><h1>Explore hotels</h1><p>Search properties by destination and discover your next stay.</p></div><form className="filter-bar" onSubmit={submit}><div className="input-icon flex-grow-1"><Search size={18} /><input className="form-control" placeholder="Search by city, e.g. Indore" value={city} onChange={e => setCity(e.target.value)} /></div><button className="btn btn-dark">Search hotels</button><button type="button" className="btn btn-outline-secondary" onClick={() => { setCity(""); setQuery(""); fetchHotels(); }}>Clear</button></form>{query && <p className="muted-note">Showing results for “{query}”</p>}{loading ? <Loader label="Finding hotels..." /> : error ? <div className="alert alert-danger">{error}</div> : hotels.length ? <div className="hotel-grid">{hotels.map(h => <HotelCard key={h._id} hotel={h} />)}</div> : <div className="empty-panel"><h3>No hotels found</h3><p>Try another city or clear your search.</p></div>}</section>;
}