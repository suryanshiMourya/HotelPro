import { useEffect, useMemo, useState } from "react";
import { getCities } from "../services/locationService";

/**
 * Props:
 * - value: selected city string
 * - onChange: callback receiving (city, state)
 * - label: optional label text
 * - name: optional input name
 *
 * Uses the local HotelPro city directory API. This is a city selector,
 * not a guarantee that HotelPro has bookable hotels in every listed city.
 */
export default function CitySelect({
  value = "",
  onChange,
  label = "Destination",
  name = "city"
}) {
  const [cities, setCities] = useState([]);
  const [query, setQuery] = useState(value);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadCities = async () => {
      try {
        const results = await getCities();
        if (active) {
          setCities(results);
          setError("");
        }
      } catch (err) {
        if (active) setError("Could not load destinations. Check the backend server.");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadCities();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  const options = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return cities;
    return cities.filter((item) =>
      `${item.city} ${item.state}`.toLowerCase().includes(normalized)
    );
  }, [cities, query]);

  const handleChange = (event) => {
    const selectedValue = event.target.value;
    setQuery(selectedValue);
    const selected = cities.find(
      (item) => `${item.city}, ${item.state}` === selectedValue
    );
    onChange?.(selected ? selected.city : selectedValue, selected?.state || "");
  };

  const listId = `${name}-city-options`;

  return (
    <div className="city-select-field">
      <label htmlFor={`${name}-input`}>{label}</label>
      <input
        id={`${name}-input`}
        name={name}
        list={listId}
        value={query}
        onChange={handleChange}
        placeholder={loading ? "Loading destinations..." : "Search city or state"}
        autoComplete="off"
        aria-describedby={error ? `${name}-error` : undefined}
      />
      <datalist id={listId}>
        {options.map((item) => (
          <option
            key={`${item.city}-${item.state}`}
            value={`${item.city}, ${item.state}`}
          />
        ))}
      </datalist>
      {error && <small id={`${name}-error`} role="alert">{error}</small>}
    </div>
  );
}
