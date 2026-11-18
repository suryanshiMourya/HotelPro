import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  BedDouble,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  CreditCard,
  Hotel,
  IndianRupee,
  RefreshCw,
  TrendingUp,
  Users,
  Wallet,
  XCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import hotelService from "../../services/hotelService";
import roomService from "../../services/roomService";
import bookingService from "../../services/bookingService";
import paymentService from "../../services/paymentService";
import Loader from "../../components/common/Loader";
import formatCurrency from "../../utils/formatCurrency";
import formatDate from "../../utils/formatDate";
import { getErrorMessage } from "../../services/api";

const EMPTY_DATA = { hotels: [], rooms: [], bookings: [], payments: [] };

function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function toDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function StatCard({ label, value, hint, icon: Icon, tone = "gold" }) {
  return (
    <article className={`hp-stat-card hp-stat-${tone}`}>
      <div className="hp-stat-top">
        <span>{label}</span>
        <span className="hp-stat-icon"><Icon size={19} /></span>
      </div>
      <strong>{value}</strong>
      <small>{hint}</small>
    </article>
  );
}

function BarChart({ title, subtitle, data, valueKey, formatter, color = "gold" }) {
  const maxValue = Math.max(1, ...data.map((item) => Number(item[valueKey]) || 0));

  return (
    <section className="hp-panel">
      <div className="hp-panel-heading">
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        <span className="hp-chart-period">Last 6 months</span>
      </div>
      {data.every((item) => !Number(item[valueKey])) ? (
        <div className="hp-chart-empty">No data available for this period yet.</div>
      ) : (
        <div className="hp-bar-chart" role="img" aria-label={`${title}, last six months`}>
          {data.map((item) => {
            const value = Number(item[valueKey]) || 0;
            const height = value ? Math.max(5, (value / maxValue) * 100) : 0;
            return (
              <div className="hp-bar-column" key={item.key}>
                <span className="hp-bar-value">{formatter(value)}</span>
                <div className="hp-bar-track">
                  <div
                    className={`hp-bar-fill hp-bar-${color}`}
                    style={{ height: `${height}%` }}
                    title={`${item.label}: ${formatter(value)}`}
                  />
                </div>
                <span className="hp-bar-label">{item.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function StatusRow({ label, count, total, color }) {
  const percent = total ? Math.round((count / total) * 100) : 0;
  return (
    <div className="hp-status-row">
      <div className="hp-status-label">
        <span><i style={{ background: color }} />{label}</span>
        <strong>{count} <small>({percent}%)</small></strong>
      </div>
      <div className="hp-status-track">
        <div style={{ width: `${percent}%`, background: color }} />
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState(EMPTY_DATA);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadDashboard = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError("");

    const requests = await Promise.allSettled([
      hotelService.list(),
      roomService.list(),
      bookingService.all(),
      paymentService.all()
    ]);

    const nextData = { ...EMPTY_DATA };
    const errors = [];
    const keys = ["hotels", "rooms", "bookings", "payments"];

    requests.forEach((result, index) => {
      if (result.status === "fulfilled") {
        nextData[keys[index]] = result.value[keys[index]] || [];
      } else {
        errors.push(`${keys[index]}: ${getErrorMessage(result.reason)}`);
      }
    });

    setData(nextData);
    setError(errors.join(" | "));
    setLastUpdated(new Date());
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const analytics = useMemo(() => {
    const activeHotels = data.hotels.filter((hotel) => hotel.isActive !== false);
    const activeRooms = data.rooms.filter((room) => room.isActive !== false);
    const paidPayments = data.payments.filter((payment) => payment.paymentStatus === "paid");
    const pendingPayments = data.payments.filter((payment) => payment.paymentStatus === "pending");
    const revenue = paidPayments.reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0);
    const pendingAmount = pendingPayments.reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0);
    const averagePayment = paidPayments.length ? revenue / paidPayments.length : 0;

    const now = new Date();
    const occupiedRoomIds = new Set(
      data.bookings
        .filter((booking) => {
          if (!["confirmed", "checked_in"].includes(booking.status)) return false;
          const checkIn = toDate(booking.checkIn);
          const checkOut = toDate(booking.checkOut);
          return checkIn && checkOut && checkIn <= now && checkOut > now;
        })
        .map((booking) => booking.room?._id || booking.room)
        .filter(Boolean)
        .map(String)
    );
    const occupancy = activeRooms.length
      ? Math.min(100, Math.round((occupiedRoomIds.size / activeRooms.length) * 100))
      : 0;

    const monthlyData = Array.from({ length: 6 }, (_, index) => {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
      const key = monthKey(monthDate);
      return {
        key,
        label: monthDate.toLocaleDateString("en-IN", { month: "short" }),
        bookings: 0,
        revenue: 0
      };
    });
    const monthlyIndex = new Map(monthlyData.map((item) => [item.key, item]));

    data.bookings.forEach((booking) => {
      const created = toDate(booking.createdAt);
      if (!created) return;
      const bucket = monthlyIndex.get(monthKey(created));
      if (bucket) bucket.bookings += 1;
    });

    paidPayments.forEach((payment) => {
      const created = toDate(payment.createdAt);
      if (!created) return;
      const bucket = monthlyIndex.get(monthKey(created));
      if (bucket) bucket.revenue += Number(payment.amount) || 0;
    });

    const bookingStatuses = [
      { key: "confirmed", label: "Confirmed", color: "#247a56" },
      { key: "checked_in", label: "Checked in", color: "#3976bd" },
      { key: "checked_out", label: "Checked out", color: "#8b7ac8" },
      { key: "cancelled", label: "Cancelled", color: "#c65353" }
    ].map((status) => ({
      ...status,
      count: data.bookings.filter((booking) => booking.status === status.key).length
    }));

    const paymentStatuses = [
      { key: "paid", label: "Paid", color: "#247a56" },
      { key: "pending", label: "Pending", color: "#d49a32" },
      { key: "failed", label: "Failed", color: "#c65353" },
      { key: "refunded", label: "Refunded", color: "#3976bd" }
    ].map((status) => ({
      ...status,
      count: data.payments.filter((payment) => payment.paymentStatus === status.key).length
    }));

    const hotelMap = new Map();
    data.bookings.forEach((booking) => {
      const hotelId = booking.hotel?._id || booking.hotel || "unknown";
      const hotelName = booking.hotel?.name || "Unknown hotel";
      const key = String(hotelId);
      const current = hotelMap.get(key) || { key, name: hotelName, bookings: 0, revenue: 0 };
      current.bookings += 1;
      hotelMap.set(key, current);
    });
    data.payments.filter((payment) => payment.paymentStatus === "paid").forEach((payment) => {
      const hotel = payment.booking?.hotel;
      if (!hotel) return;
      const key = String(hotel._id || hotel);
      const current = hotelMap.get(key) || { key, name: hotel.name || "Unknown hotel", bookings: 0, revenue: 0 };
      current.revenue += Number(payment.amount) || 0;
      hotelMap.set(key, current);
    });

    const topHotels = [...hotelMap.values()]
      .sort((a, b) => b.bookings - a.bookings || b.revenue - a.revenue)
      .slice(0, 5);

    const cancellationCount = bookingStatuses.find((item) => item.key === "cancelled")?.count || 0;
    const cancellationRate = data.bookings.length
      ? Math.round((cancellationCount / data.bookings.length) * 100)
      : 0;
    const paymentSuccessRate = data.payments.length
      ? Math.round((paidPayments.length / data.payments.length) * 100)
      : 0;

    return {
      activeHotels,
      activeRooms,
      paidPayments,
      pendingPayments,
      revenue,
      pendingAmount,
      averagePayment,
      occupancy,
      occupiedRooms: occupiedRoomIds.size,
      monthlyData,
      bookingStatuses,
      paymentStatuses,
      topHotels,
      cancellationRate,
      paymentSuccessRate
    };
  }, [data]);

  if (loading) return <Loader label="Loading hotel analytics..." />;

  return (
    <section className="container section-space page-container hp-dashboard">
      <div className="hp-dashboard-heading">
        <div className="page-title">
          <span className="eyebrow">HOTELPRO CONTROL CENTER</span>
          <h1>Analytics dashboard</h1>
          <p>Monitor reservations, room occupancy, collections and hotel performance.</p>
          {lastUpdated && (
            <span className="hp-updated">Last updated: {lastUpdated.toLocaleString("en-IN")}</span>
          )}
        </div>
        <button className="btn btn-outline-dark hp-refresh" onClick={() => loadDashboard(true)} disabled={refreshing}>
          <RefreshCw size={15} className={refreshing ? "hp-spin" : ""} />
          {refreshing ? "Refreshing..." : "Refresh data"}
        </button>
      </div>

      {error && (
        <div className="alert alert-warning" role="alert">
          Some analytics data could not be loaded: {error}. Sign in with an admin account and check that all backend endpoints are running.
        </div>
      )}

      <div className="hp-section-caption">
        <span>BUSINESS OVERVIEW</span>
        <small>Based on records currently returned by HotelPro APIs</small>
      </div>
      <div className="hp-analytics-stats">
        <StatCard label="Revenue collected" value={formatCurrency(analytics.revenue)} hint={`${analytics.paidPayments.length} paid payment(s)`} icon={IndianRupee} tone="green" />
        <StatCard label="Total bookings" value={data.bookings.length} hint={`${analytics.cancellationRate}% cancellation rate`} icon={CalendarCheck} tone="blue" />
        <StatCard label="Room occupancy today" value={`${analytics.occupancy}%`} hint={`${analytics.occupiedRooms} of ${analytics.activeRooms.length} active rooms`} icon={BedDouble} tone="purple" />
        <StatCard label="Pending collection" value={formatCurrency(analytics.pendingAmount)} hint={`${analytics.pendingPayments.length} pending payment(s)`} icon={Wallet} tone="amber" />
        <StatCard label="Active hotels" value={analytics.activeHotels.length} hint={`${data.hotels.length} hotel record(s) total`} icon={Hotel} tone="gold" />
        <StatCard label="Active rooms" value={analytics.activeRooms.length} hint={`${data.rooms.length} room record(s) total`} icon={Users} tone="teal" />
      </div>

      <div className="hp-analytics-grid hp-analytics-grid-two">
        <BarChart
          title="Booking trend"
          subtitle="Number of bookings created each month"
          data={analytics.monthlyData}
          valueKey="bookings"
          formatter={(value) => String(value)}
          color="green"
        />
        <BarChart
          title="Revenue trend"
          subtitle="Successfully paid amounts by payment creation month"
          data={analytics.monthlyData}
          valueKey="revenue"
          formatter={(value) => formatCurrency(value)}
          color="gold"
        />
      </div>

      <div className="hp-analytics-grid hp-analytics-grid-two hp-mid-grid">
        <section className="hp-panel">
          <div className="hp-panel-heading">
            <div>
              <h2>Booking status</h2>
              <p>Reservation lifecycle breakdown</p>
            </div>
            <CalendarCheck size={19} />
          </div>
          <div className="hp-status-list">
            {analytics.bookingStatuses.map((status) => (
              <StatusRow key={status.key} label={status.label} count={status.count} total={data.bookings.length} color={status.color} />
            ))}
          </div>
          <div className="hp-insight-line"><Activity size={16} /> Cancellation rate: <strong>{analytics.cancellationRate}%</strong></div>
        </section>

        <section className="hp-panel">
          <div className="hp-panel-heading">
            <div>
              <h2>Payment status</h2>
              <p>Payment records by current status</p>
            </div>
            <CreditCard size={19} />
          </div>
          <div className="hp-status-list">
            {analytics.paymentStatuses.map((status) => (
              <StatusRow key={status.key} label={status.label} count={status.count} total={data.payments.length} color={status.color} />
            ))}
          </div>
          <div className="hp-insight-line"><CheckCircle2 size={16} /> Payment success rate: <strong>{analytics.paymentSuccessRate}%</strong></div>
        </section>
      </div>

      <div className="hp-analytics-grid hp-analytics-grid-two hp-bottom-grid">
        <section className="hp-panel">
          <div className="hp-panel-heading">
            <div>
              <h2>Top performing hotels</h2>
              <p>Ranked by number of reservations</p>
            </div>
            <TrendingUp size={19} />
          </div>
          {analytics.topHotels.length ? (
            <div className="hp-top-hotels">
              {analytics.topHotels.map((hotel, index) => (
                <div className="hp-hotel-rank" key={hotel.key}>
                  <span className="hp-rank-number">{index + 1}</span>
                  <div className="hp-hotel-rank-main">
                    <strong>{hotel.name}</strong>
                    <small>{hotel.bookings} booking(s)</small>
                  </div>
                  <b>{formatCurrency(hotel.revenue)}</b>
                </div>
              ))}
            </div>
          ) : (
            <div className="hp-chart-empty">Hotel performance will appear after bookings are created.</div>
          )}
        </section>

        <section className="hp-panel hp-health-panel">
          <div className="hp-panel-heading">
            <div>
              <h2>Operations snapshot</h2>
              <p>Quick operational indicators</p>
            </div>
            <Activity size={19} />
          </div>
          <div className="hp-operation-item">
            <span><BedDouble size={17} /> Rooms currently occupied</span>
            <strong>{analytics.occupiedRooms} / {analytics.activeRooms.length}</strong>
          </div>
          <div className="hp-operation-item">
            <span><Clock3 size={17} /> Pending payments</span>
            <strong>{analytics.pendingPayments.length}</strong>
          </div>
          <div className="hp-operation-item">
            <span><Wallet size={17} /> Average paid payment</span>
            <strong>{formatCurrency(analytics.averagePayment)}</strong>
          </div>
          <div className="hp-operation-item">
            <span><XCircle size={17} /> Cancelled bookings</span>
            <strong>{analytics.bookingStatuses.find((item) => item.key === "cancelled")?.count || 0}</strong>
          </div>
          <div className="hp-operation-item">
            <span><CheckCircle2 size={17} /> Paid payment records</span>
            <strong>{analytics.paidPayments.length}</strong>
          </div>
        </section>
      </div>

      <section className="hp-panel hp-recent-panel">
        <div className="hp-panel-heading">
          <div>
            <h2>Recent bookings</h2>
            <p>Latest reservations across your hotels</p>
          </div>
          <Link to="/admin/bookings" className="hp-view-link">View all bookings</Link>
        </div>
        {data.bookings.length ? (
          <div className="table-responsive">
            <table className="table align-middle hp-analytics-table">
              <thead>
                <tr><th>Hotel / Room</th><th>Guest</th><th>Check-in</th><th>Amount</th><th>Booking</th><th>Payment</th></tr>
              </thead>
              <tbody>
                {[...data.bookings].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 8).map((booking) => (
                  <tr key={booking._id}>
                    <td><strong>{booking.hotel?.name || "—"}</strong><small className="d-block text-muted">Room {booking.room?.roomNumber || "—"}</small></td>
                    <td>{booking.guest?.name || "Guest"}</td>
                    <td>{formatDate(booking.checkIn)}</td>
                    <td>{formatCurrency(booking.totalAmount)}</td>
                    <td><span className="hp-table-status">{booking.status?.replaceAll("_", " ") || "—"}</span></td>
                    <td><span className={`hp-payment-status hp-payment-${booking.paymentStatus || "pending"}`}>{booking.paymentStatus || "pending"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="hp-chart-empty">No bookings available yet. New reservations will appear here.</div>
        )}
      </section>

      <div className="hp-dashboard-footnote">
        <span><CheckCircle2 size={14} /> Analytics are calculated from current HotelPro database records.</span>
        <span>Revenue includes only payments with status “paid”. Mock payments are simulated, not real transactions.</span>
      </div>

      <div className="admin-shortcuts hp-admin-shortcuts">
        <Link to="/admin/hotels"><Hotel /> Manage hotels</Link>
        <Link to="/admin/rooms"><BedDouble /> Manage rooms</Link>
        <Link to="/admin/bookings"><CalendarCheck /> Manage bookings</Link>
        <Link to="/admin/payments"><CreditCard /> Manage payments</Link>
      </div>
    </section>
  );
}
