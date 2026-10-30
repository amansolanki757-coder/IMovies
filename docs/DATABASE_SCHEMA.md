# IMovies Database Schema Specification

This document outlines the 8 MongoDB collections required by the IMovies specification, including indexes and relationships.

---

### 1. Users Collection (`users`)
Stores user accounts, credentials, and roles.
```javascript
{
  _id: ObjectId,
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  phone: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user', index: true },
  createdAt: { type: Date, default: Date.now }
}
```

---

### 2. Movies Collection (`movies`)
Stores film catalog, descriptions, posters, and metadata.
```javascript
{
  _id: ObjectId,
  title: { type: String, required: true, index: true },
  description: { type: String, required: true },
  genres: [{ type: String, index: true }], // Action, Comedy, Drama, Sci-Fi, etc.
  language: { type: String, required: true, index: true },
  durationMinutes: { type: Number, required: true },
  releaseDate: { type: Date, required: true },
  rating: { type: Number, default: 8.5 }, // IMDb style out of 10
  poster: { type: String, required: true },
  backdrop: { type: String },
  trailerUrl: { type: String },
  director: { type: String },
  cast: [{ type: String }],
  status: { type: String, enum: ['now_showing', 'coming_soon'], default: 'now_showing', index: true }
}
```
**Indexes**: Text index on `title`, `description`, `cast`. Single indexes on `genres`, `language`, `status`.

---

### 3. Theatres Collection (`theatres`)
Stores physical cinema locations, addresses, and screen configs.
```javascript
{
  _id: ObjectId,
  name: { type: String, required: true, index: true },
  city: { type: String, required: true, index: true },
  address: { type: String, required: true },
  screens: [{
    screenNumber: { type: Number, required: true },
    name: { type: String },
    totalSeats: { type: Number, default: 60 }
  }],
  facilities: [{ type: String }] // Dolby Atmos, Recliner, 4DX, Parking
}
```

---

### 4. Shows Collection (`shows`)
Schedules linking a movie to a theatre, date, and screen time.
```javascript
{
  _id: ObjectId,
  movieId: { type: ObjectId, ref: 'Movie', required: true, index: true },
  theatreId: { type: ObjectId, ref: 'Theatre', required: true, index: true },
  screenNumber: { type: Number, required: true },
  showDate: { type: Date, required: true, index: true }, // Format YYYY-MM-DD
  showTime: { type: String, required: true }, // e.g. "10:30 AM", "02:15 PM"
  ticketPrice: { type: Number, required: true },
  isActive: { type: Boolean, default: true }
}
```
**Indexes**: Compound index on `{ movieId: 1, showDate: 1 }` and `{ theatreId: 1, showDate: 1 }`.

---

### 5. Seats Collection (`seats`)
Individual seat matrices generated per show.
```javascript
{
  _id: ObjectId,
  showId: { type: ObjectId, ref: 'Show', required: true, index: true },
  seatNumber: { type: String, required: true }, // e.g., "A1", "C5"
  row: { type: String, required: true }, // "A", "B", ...
  col: { type: Number, required: true }, // 1, 2, ...
  seatType: { type: String, enum: ['Standard', 'Prime', 'VIP Recliner'], default: 'Standard' },
  status: { type: String, enum: ['available', 'locked', 'booked'], default: 'available', index: true },
  lockedBy: { type: ObjectId, ref: 'User', default: null },
  lockExpiresAt: { type: Date, default: null }
}
```
**Indexes**: Compound index on `{ showId: 1, seatNumber: 1 }` (unique) and `{ showId: 1, status: 1 }`.

---

### 6. Bookings Collection (`bookings`)
Records of user reservations and tickets.
```javascript
{
  _id: ObjectId,
  userId: { type: ObjectId, ref: 'User', required: true, index: true },
  showId: { type: ObjectId, ref: 'Show', required: true, index: true },
  seatNumbers: [{ type: String, required: true }],
  totalAmount: { type: Number, required: true },
  bookingCode: { type: String, required: true, unique: true },
  status: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed', index: true },
  createdAt: { type: Date, default: Date.now, index: true }
}
```
**Indexes**: `{ userId: 1, createdAt: -1 }`.

---

### 7. Payments Collection (`payments`)
Tracks checkout transactions.
```javascript
{
  _id: ObjectId,
  bookingId: { type: ObjectId, ref: 'Booking', required: true, index: true },
  userId: { type: ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['UPI', 'Credit Card', 'Debit Card', 'Net Banking'], default: 'UPI' },
  transactionId: { type: String, required: true, unique: true },
  status: { type: String, enum: ['success', 'failed', 'refunded'], default: 'success' },
  createdAt: { type: Date, default: Date.now }
}
```

---

### 8. Notifications Collection (`notifications`)
User notification updates for booking confirmations, cancellations, and alerts.
```javascript
{
  _id: ObjectId,
  userId: { type: ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['booking', 'cancellation', 'system'], default: 'booking' },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}
```

