# CineBook — REST API Specification
**Author**: Lithish Kumar  
**Base URL**: `http://localhost:5001/api`  
**Protocol**: HTTP/1.1  
**Content-Type**: `application/json`  
**Authentication**: Bearer JWT Token (`Authorization: Bearer <TOKEN>`)  

---

## 1. Authentication Endpoints (`/api/auth`)

### 1.1 Register New User
- **Method**: `POST`
- **Route**: `/api/auth/register`
- **Access**: Public
- **Request Body**:
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "securepassword123",
  "role": "user"
}
```
- **Response (201 Created)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "6734c89abcf123456789abcd",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "user"
  }
}
```

### 1.2 User Login
- **Method**: `POST`
- **Route**: `/api/auth/login`
- **Access**: Public
- **Request Body**:
```json
{
  "email": "jane@example.com",
  "password": "securepassword123"
}
```
- **Response (200 OK)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "6734c89abcf123456789abcd",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "user"
  }
}
```

---

## 2. Seat Hold & Booking Endpoints (`/api/bookings`)

### 2.1 Temporary Seat Hold (5-Minute TTL)
- **Method**: `POST`
- **Route**: `/api/bookings/hold`
- **Access**: Public / Authenticated
- **Request Body**:
```json
{
  "showId": "6734c89abcf1234567890001",
  "seats": ["A1", "A2"],
  "userId": "6734c89abcf123456789abcd",
  "holdMinutes": 5
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Seats held for 5 minutes. Complete checkout before release.",
  "holdExpiresAt": "2026-11-13T12:55:00.000Z",
  "seats": ["A1", "A2"]
}
```
- **Error (409 Conflict)**:
```json
{
  "message": "Some seats are already booked or held by another customer.",
  "conflictedSeats": ["A1"]
}
```

### 2.2 Release Seat Hold
- **Method**: `POST`
- **Route**: `/api/bookings/release-hold`
- **Access**: Public / Authenticated
- **Request Body**:
```json
{
  "showId": "6734c89abcf1234567890001",
  "seats": ["A1", "A2"],
  "userId": "6734c89abcf123456789abcd"
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Seat holds released successfully"
}
```

### 2.3 Confirm Booking (Atomic Double-Booking Guard)
- **Method**: `POST`
- **Route**: `/api/bookings`
- **Access**: Authenticated
- **Request Body**:
```json
{
  "showId": "6734c89abcf1234567890001",
  "seats": ["A1", "A2"],
  "userId": "6734c89abcf123456789abcd",
  "snacks": [
    { "snackId": "6734c89abcf1234567890099", "name": "Large Truffle Popcorn", "price": 350, "qty": 1 }
  ],
  "parking": {
    "type": "Four-Wheeler",
    "price": 100
  }
}
```
- **Response (201 Created)**:
```json
{
  "_id": "6734cb80bcf1234567890077",
  "bookingReference": "CB-2026-X89F2A",
  "showId": {
    "_id": "6734c89abcf1234567890001",
    "theatre": "PVR Select Citywalk, Delhi",
    "date": "2026-11-20",
    "time": "08:30 PM",
    "movieId": {
      "title": "Oppenheimer",
      "poster": "/oppenheimer-hero.jpg"
    }
  },
  "seats": ["A1", "A2"],
  "totalPrice": 1050,
  "status": "CONFIRMED",
  "paymentStatus": "Success",
  "used": false,
  "createdAt": "2026-11-13T12:50:00.000Z"
}
```
- **Error (409 Conflict)**:
```json
{
  "message": "Seats conflict: Some seats were confirmed or locked by another customer.",
  "conflictedSeats": ["A1"]
}
```

### 2.4 Cancel Booking & Simulated Refund
- **Method**: `POST`
- **Route**: `/api/bookings/:id/cancel`
- **Access**: Authenticated Customer / Admin
- **Request Body**:
```json
{
  "reason": "Customer requested cancellation due to schedule conflict"
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Booking successfully cancelled. Simulated full refund has been credited.",
  "bookingReference": "CB-2026-X89F2A",
  "refundAmount": 1050,
  "refundId": "REF-1731498700000-X7Q9",
  "booking": {
    "_id": "6734cb80bcf1234567890077",
    "status": "CANCELLED",
    "refundStatus": "PROCESSED",
    "refundAmount": 1050,
    "refundId": "REF-1731498700000-X7Q9",
    "cancelledAt": "2026-11-13T12:52:00.000Z"
  }
}
```
- **Error (400 Bad Request)**:
```json
{
  "message": "Cannot cancel a ticket that has already been admitted at the theatre gate."
}
```

---

## 3. Gate Verification & QR Scanner Endpoints (`/api/bookings`)

### 3.1 Verify Ticket Reference (QR Gate Check)
- **Method**: `GET`
- **Route**: `/api/bookings/verify/:id`
- **Note**: `:id` accepts either MongoDB `_id` OR `bookingReference` (e.g. `CB-2026-X89F2A`).
- **Response (200 OK - Valid Admission)**:
```json
{
  "message": "✅ TICKET VALID - Ready for admission.",
  "status": "VALID",
  "booking": {
    "bookingReference": "CB-2026-X89F2A",
    "seats": ["A1", "A2"],
    "showId": {
      "theatre": "PVR Select Citywalk, Delhi",
      "date": "2026-11-20",
      "time": "08:30 PM",
      "movieId": { "title": "Oppenheimer" }
    }
  }
}
```
- **Response (400 Bad Request - Cancelled Ticket)**:
```json
{
  "message": "⛔ TICKET CANCELLED - Full refund was already processed. Entry denied.",
  "status": "CANCELLED"
}
```
- **Response (400 Bad Request - Already Used)**:
```json
{
  "message": "⛔ TICKET ALREADY USED - Ticket has already been validated and admitted at gate.",
  "status": "ALREADY_USED"
}
```

### 3.2 Mark Ticket Admitted at Gate
- **Method**: `PUT`
- **Route**: `/api/bookings/use/:id`
- **Response (200 OK)**:
```json
{
  "message": "Ticket marked as used. Guest admitted to auditorium.",
  "booking": {
    "bookingReference": "CB-2026-X89F2A",
    "used": true,
    "status": "USED"
  }
}
```

---

## 4. Admin Analytics & Occupancy Telemetry (`/api/analytics`)

### 4.1 Get Revenue & Occupancy Report
- **Method**: `GET`
- **Route**: `/api/analytics`
- **Query Parameters**:
  - `startDate` (optional): `YYYY-MM-DD`
  - `endDate` (optional): `YYYY-MM-DD`
- **Response (200 OK)**:
```json
{
  "movieStats": [
    {
      "_id": "6734c89abcf1234567890101",
      "title": "Oppenheimer",
      "poster": "/oppenheimer-hero.jpg",
      "ticketsSold": 48,
      "ticketRevenue": 14400
    }
  ],
  "theatreStats": [
    {
      "_id": "PVR Select Citywalk, Delhi",
      "ticketRevenue": 14400,
      "snackRevenue": 4200,
      "parkingRevenue": 1100,
      "totalRevenue": 19700
    }
  ],
  "summary": {
    "totalMovies": 6,
    "totalShows": 18,
    "totalTickets": 48,
    "totalBookings": 24,
    "totalRevenue": 19700,
    "totalCapacity": 720,
    "occupiedSeats": 48,
    "occupancyPercentage": 6.7,
    "totalCancellations": 3,
    "totalCancelledSeats": 6,
    "totalRefundedAmount": 1800,
    "occupancy": {
      "totalAuditoriumCapacity": 720,
      "currentlyOccupiedSeats": 48,
      "occupancyPercentage": "6.7%",
      "totalConfirmedTickets": 48,
      "totalCancellations": 3,
      "totalCancelledSeats": 6,
      "totalRefundedAmount": 1800
    }
  }
}
```

### 4.2 Get Immutable Audit Trail
- **Method**: `GET`
- **Route**: `/api/analytics/audit-logs`
- **Query Parameters**: `limit` (default: 50)
- **Response (200 OK)**:
```json
{
  "total": 2,
  "auditLogs": [
    {
      "_id": "6734cc12bcf1234567890999",
      "action": "BOOKING_CONFIRMED",
      "entityType": "Booking",
      "entityId": "6734cb80bcf1234567890077",
      "performedBy": "6734c89abcf123456789abcd",
      "details": {
        "bookingReference": "CB-2026-X89F2A",
        "seats": ["A1", "A2"],
        "totalPrice": 1050,
        "theatre": "PVR Select Citywalk, Delhi"
      },
      "ipAddress": "127.0.0.1",
      "timestamp": "2026-11-13T12:50:00.123Z"
    },
    {
      "_id": "6734cc10bcf1234567890998",
      "action": "SEAT_HOLD",
      "entityType": "Show",
      "entityId": "6734c89abcf1234567890001",
      "performedBy": "6734c89abcf123456789abcd",
      "details": {
        "seats": ["A1", "A2"],
        "holdMinutes": 5,
        "expiresAt": "2026-11-13T12:55:00.000Z"
      },
      "ipAddress": "127.0.0.1",
      "timestamp": "2026-11-13T12:45:00.045Z"
    }
  ]
}
```

