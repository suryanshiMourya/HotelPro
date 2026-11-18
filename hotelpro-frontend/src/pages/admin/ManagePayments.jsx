import { useEffect, useState } from "react";
import paymentService from "../../services/paymentService";
import Loader from "../../components/common/Loader";
import PaymentStatus from "../../components/payments/PaymentStatus";
import formatCurrency from "../../utils/formatCurrency";
import formatDate from "../../utils/formatDate";
import { getErrorMessage } from "../../services/api";

export default function ManagePayments() {
  const [payments, setPayments] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  useEffect(() => { paymentService.all().then(d => setPayments(d.payments || [])).catch(e => setError(getErrorMessage(e))).finally(() => setLoading(false)); }, []);
  if (loading) return <Loader />;
  const revenue = payments.filter(p => p.paymentStatus === "paid").reduce((sum, p) => sum + p.amount, 0);
  return <section className="container section-space page-container"><div className="page-title"><span className="eyebrow">ADMINISTRATION</span><h1>Manage payments</h1><p>Review mock payment records and recorded revenue.</p></div>{error && <div className="alert alert-danger">{error}</div>}<div className="revenue-banner"><span>Recorded successful payments</span><strong>{formatCurrency(revenue)}</strong><small>Mock gateway demonstration data only.</small></div><div className="table-panel"><div className="table-responsive"><table className="table align-middle"><thead><tr><th>Date</th><th>Guest</th><th>Booking</th><th>Method</th><th>Amount</th><th>Status</th><th>Reference</th></tr></thead><tbody>{payments.map(p => <tr key={p._id}><td>{formatDate(p.createdAt)}</td><td>{p.user?.name || "—"}</td><td>{String(p.booking?._id || p.booking || "—").slice(-8)}</td><td>{p.paymentMethod}</td><td>{formatCurrency(p.amount)}</td><td><PaymentStatus status={p.paymentStatus} /></td><td>{p.mockReference || p.transactionId || "—"}</td></tr>)}</tbody></table></div>{!payments.length && <p className="muted-note">No payment records found.</p>}</div></section>;
}