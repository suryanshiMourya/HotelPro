import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Hotels from "./pages/Hotels";
import HotelDetails from "./pages/HotelDetails";
import MyBookings from "./pages/MyBookings";
import Payment from "./pages/Payment";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageHotels from "./pages/admin/ManageHotels";
import ManageRooms from "./pages/admin/ManageRooms";
import ManageBookings from "./pages/admin/ManageBookings";
import ManagePayments from "./pages/admin/ManagePayments";
import "./App.css";

function NotFound() { return <div className="container section-space empty-panel"><h1>Page not found</h1><p>The page you're looking for doesn't exist.</p><a href="/" className="btn btn-dark">Back home</a></div>; }

export default function App() {
  return <><Navbar /><main className="app-main"><Routes>
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/hotels" element={<Hotels />} />
    <Route path="/hotels/:id" element={<HotelDetails />} />
    <Route element={<ProtectedRoute />}>
      <Route path="/my-bookings" element={<MyBookings />} />
      <Route path="/payment" element={<Payment />} />
      <Route path="/profile" element={<Profile />} />
    </Route>
    <Route element={<ProtectedRoute adminOnly />}>
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/hotels" element={<ManageHotels />} />
      <Route path="/admin/rooms" element={<ManageRooms />} />
      <Route path="/admin/bookings" element={<ManageBookings />} />
      <Route path="/admin/payments" element={<ManagePayments />} />
    </Route>
    <Route path="*" element={<NotFound />} />
  </Routes></main><Footer /></>;
}