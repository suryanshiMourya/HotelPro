import { CheckCircle2, Clock3, XCircle } from "lucide-react";

export default function PaymentStatus({ status }) {
  const config = {
    paid: { label: "Paid", icon: CheckCircle2, cls: "pill-success" },
    pending: { label: "Pending", icon: Clock3, cls: "pill-pending" },
    failed: { label: "Failed", icon: XCircle, cls: "pill-danger" },
    refunded: { label: "Refunded", icon: CheckCircle2, cls: "pill-muted" }
  }[status] || { label: status || "Unknown", icon: Clock3, cls: "pill-muted" };
  const Icon = config.icon;
  return <span className={`pill ${config.cls}`}><Icon size={14} /> {config.label}</span>;
}