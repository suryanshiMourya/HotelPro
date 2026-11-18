import { useState } from "react";
import { CreditCard, Smartphone, Banknote } from "lucide-react";

const methods = [
  { value: "UPI", label: "UPI", icon: Smartphone },
  { value: "Card", label: "Card", icon: CreditCard },
  { value: "Cash", label: "Cash", icon: Banknote }
];

export default function MockPaymentForm({ onCreate, busy }) {
  const [method, setMethod] = useState("UPI");
  return <div className="payment-method-box"><h3>Choose payment method</h3><div className="payment-methods">{methods.map(({ value, label, icon: Icon }) => <button type="button" key={value} className={`method-option ${method === value ? "selected" : ""}`} onClick={() => setMethod(value)}><Icon size={22} /><span>{label}</span></button>)}</div><button className="btn btn-dark w-100 mt-3" disabled={busy} onClick={() => onCreate(method)}>{busy ? "Preparing..." : "Create mock payment"}</button><p className="muted-note">Demonstration only. No real payment will be collected.</p></div>;
}