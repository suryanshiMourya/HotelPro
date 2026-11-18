HotelPro Analytics Dashboard Patch

Files:
- src/pages/admin/AdminDashboard.jsx (replace your existing file)
- src/App.css (replace your existing file, or append the analytics styles from the end)

No new npm package is required. The dashboard uses the existing lucide-react icons and existing HotelPro service modules.

Data endpoints used:
- GET /api/hotels
- GET /api/rooms
- GET /api/bookings (admin)
- GET /api/payments (admin)

How to install:
1. Back up your current frontend/src/pages/admin/AdminDashboard.jsx and frontend/src/App.css.
2. Copy the two files from this patch into the same paths in your project.
3. Keep backend and frontend running.
4. Sign in using an admin account and open http://localhost:5173/admin.
5. Click Refresh data after creating bookings or mock payments.

Metric definitions:
- Revenue collected = sum of Payment.amount where paymentStatus is paid.
- Pending collection = sum of Payment.amount where paymentStatus is pending.
- Room occupancy today = distinct active rooms with confirmed/checked_in bookings spanning the current browser date, divided by active rooms.
- Booking trend = bookings grouped by their createdAt month for the last six calendar months.
- Revenue trend = paid payments grouped by their createdAt month for the last six calendar months.

This is an admin analytics view. The admin endpoints require an admin JWT token. A booking is not counted as revenue until its associated payment status is paid.
