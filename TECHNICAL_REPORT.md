# CineBook — Enterprise Cinema Hall Ticket Booking System
## Technical Architecture, Concurrency Engineering & Security Report
**Prepared for**: ALGIONS AI LABS Assessment Evaluation  
**Candidate / Author**: Lithish Kumar  
**Version**: 2.4.0 (Production-Ready)  
**Date**: November 2026  

---

## 1. Executive Summary
CineBook is an enterprise-grade Cinema Hall Ticket Booking System built on the MERN (MongoDB, Express.js, React, Node.js) architecture. Engineered for high concurrency, zero-oversell guarantees, and luxury user experience, CineBook provides end-to-end cinema operations including:
- **Atomic Concurrency Protection**: Zero double-booking guarantee under concurrent seat contention.
- **Temporary Seat Locking**: 5-minute reservation hold with real-time UI countdown and auto-expiration.
- **Cancellation & Automated Refund Processing**: Instant seat de-allocation and financial reconciliation.
- **Single-Use Gate Validation**: Tamper-proof QR ticket verification denying cancelled or re-used passes.
- **Auditorium Occupancy Telemetry**: Real-time reporting dynamically adjusted for cancellations.
- **Tamper-Resistant Audit Trail**: Full recording of material administrative and financial actions.

---

## 2. System Architecture

### 2.1 High-Level Component Topology
```
┌─────────────────────────────────────────────────────────────────┐
│                    React 18 Luxury Client                       │
│    (Tailwind CSS, Cinzel/Playfair Typography, QR Generator)     │
└───────────────▲─────────────────────────────────▲───────────────┘
                │ HTTP / REST                     │ HTTP / REST
                ▼                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Express.js Backend API                       │
│  - JWT Authentication Middleware    - RBAC Authorization        │
│  - Concurrency Lock Engine         - Gate Validation Engine    │
│  - Analytics & Audit Controller    - Dynamic Hold Purger       │
└───────────────────────────────▲─────────────────────────────────┘
                                │ Mongoose ODM
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                   MongoDB Community (v7/v8)                     │
│  - Compound Indexes: (showId, seatNumber, isBooked)             │
│  - Atomic Document Locks: findOneAndUpdate with arrayFilters    │
│  - Immutable Audit Collection                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Technology Stack
| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Frontend** | React.js | `18.2.0` | Declarative UI, state management |
| **Styling** | Tailwind CSS + Google Fonts | `3.4.x` | Editorial luxury cinema aesthetic (`Cinzel`, `Playfair Display`) |
| **Backend** | Node.js + Express | `18.x / 4.18.2` | High-throughput async REST API |
| **Database** | MongoDB + Mongoose | `8.3.4` | Document-oriented data store with atomic subdocument updates |
| **Testing** | Jest + Supertest | `29.7.x` | Automated integration and concurrency test suite |
| **Security** | JWT + bcrypt | `9.0.2 / 5.1.1` | Stateless auth tokens, salted password hashing |

---

## 3. Concurrency Engineering & Double-Booking Prevention

### 3.1 The Race Condition Problem
In standard cinema booking workflows, two concurrent customers ($User_A$ and $User_B$) attempting to reserve the same seat ($Seat_{T1}$) execute separate read-modify-write cycles:
1. $User_A$ reads Show document: `Seat.isBooked === false`.
2. $User_B$ reads Show document: `Seat.isBooked === false`.
3. $User_A$ writes Show document: `Seat.isBooked = true`.
4. $User_B$ writes Show document: `Seat.isBooked = true` (overwrites $User_A$'s write).

In naive implementations, both users receive confirmation receipts for the exact same seat, causing double-booking.

### 3.2 The Solution: Atomic Subdocument Isolation via `findOneAndUpdate`
CineBook solves this at the database engine level without requiring external distributed lock managers (like Redis Redlock) or heavy table locks:

```javascript
const seatConditions = seats.map((seatNum) => ({
  $elemMatch: {
    seatNumber: seatNum,
    isBooked: false,
    $or: [
      { lockedUntil: null },
      { lockedUntil: { $lte: now } },
      { lockedBy: userObjId },
      { lockedBy: null },
    ],
  },
}));

const updatedShow = await Show.findOneAndUpdate(
  {
    _id: showId,
    seats: { $all: seatConditions },
  },
  {
    $set: {
      "seats.$[elem].isBooked": true,
      "seats.$[elem].lockedUntil": null,
      "seats.$[elem].lockedBy": null,
    },
  },
  {
    arrayFilters: [{ "elem.seatNumber": { $in: seats } }],
    new: true,
  }
);
```

#### Mathematical Proof of Correctness:
1. **Atomicity**: In MongoDB, single-document write operations are strictly atomic.
2. **Pre-condition Guard**: The query predicate requires `isBooked: false` on **all** requested seats simultaneously (`$all` of `$elemMatch`).
3. **Linearizability**: If two requests execute concurrently, MongoDB serializes their execution order. The first operation matches and mutates `isBooked` to `true`.
4. **Instant Rejection**: The second operation evaluates the query against the mutated document where `isBooked` is now `true`. The query fails to match, returning `null`.
5. **Conflict Response**: If `!updatedShow`, the backend immediately issues HTTP `409 Conflict` with `conflictedSeats: [...]`.

---

## 4. Temporary Seat Hold with Expiration (TTL)

### 4.1 Specification
- When a customer clicks available seats in the luxury auditorium UI, an asynchronous hold request (`POST /api/bookings/hold`) reserves the seats for **5 minutes**.
- The backend assigns `lockedUntil = now + 5 minutes` and `lockedBy = userId`.
- Other customers attempting to pick this seat observe a distinct amber lock icon (`🔒 Held`) and are prevented from selecting it.

### 4.2 Auto-Purging & Graceful Release
1. **Client-Side Graceful Cleanup**: If the customer deselects the seat or navigates away, the client issues `POST /api/bookings/release-hold`, freeing the seat immediately.
2. **Client Timer Expiration**: An active countdown banner displays remaining time (`⏳ 04:59`). If the timer hits `00:00`, the client clears selected seats and fetches fresh availability.
3. **Server-Side Expired Hold Invalidation**: During every seat query (`GET /api/shows/:id`) and every booking attempt (`POST /api/bookings`), the server evaluates `{ lockedUntil: { $lte: new Date() } }`. Expired holds are treated as fully available seats without requiring a background cron worker.

---

## 5. Booking Lifecycle & State Machine

```
                   ┌──────────────┐
                   │  AVAILABLE   │
                   └──────┬───────┘
                          │ Customer selects seat
                          ▼
                   ┌──────────────┐
                   │  TEMPORARY   │
         ┌─────────┤     HOLD     ├─────────┐
         │         └──────┬───────┘         │
         │ Timeout        │ Checkout        │ User
         │ (5 Mins)       │ Confirmed       │ Deselects
         ▼                ▼                 ▼
   ┌───────────┐   ┌──────────────┐   ┌───────────┐
   │ AVAILABLE │   │  CONFIRMED   │   │ AVAILABLE │
   └───────────┘   └──────┬───────┘   └───────────┘
                          │
            ┌─────────────┴─────────────┐
            │                           │
            │ Gate Scan                 │ Customer Cancels
            ▼                           ▼
     ┌─────────────┐             ┌─────────────┐
     │    USED     │             │  CANCELLED  │
     │ (Admitted)  │             │ (Refunded)  │
     └─────────────┘             └──────┬──────┘
                                        │
                                        ▼ Seat Returned
                                 ┌─────────────┐
                                 │  AVAILABLE  │
                                 └─────────────┘
```

---

## 6. Cancellation & Automated Refund Protocol

1. **Eligibility Check**: Bookings can only be cancelled if `status === "CONFIRMED"` and `used === false`. Tickets already scanned at the theater gate cannot be refunded.
2. **Seat Release**: The cancelled booking's seat numbers are immediately updated to `isBooked: false` on the corresponding `Show` document.
3. **Simulated Refund Transaction**:
   - Status updated to `CANCELLED`.
   - `refundStatus = "PROCESSED"`.
   - `refundAmount = booking.totalPrice` (100% full refund).
   - `refundId = REF-<timestamp>-<hash>`.
4. **Audit Trail Logging**: Creates an immutable `BOOKING_CANCELLED` audit log recording `bookingReference`, `releasedSeats`, and `refundAmount`.
5. **Occupancy Reconciliation**: The analytics engine automatically deducts cancelled bookings from total ticket sales and recalculates the auditorium occupancy rate.

---

## 7. Gate QR Scanner & Validation Guards

- **Unique Booking Reference**: Every booking is assigned an alphanumeric reference code (`CB-2026-XXXXXX`).
- **Single-Use Enforcement**: When a QR pass is scanned, `GET /api/bookings/verify/:id` validates status. Once admitted, `PUT /api/bookings/use/:id` sets `used: true`. Subsequent validation attempts are rejected with `400 Bad Request` (`status: "ALREADY_USED"`).
- **Cancelled Ticket Guard**: Scans of refunded tickets are immediately blocked with `400 Bad Request` (`status: "CANCELLED"`), preventing gate admission.

---

## 8. Role-Based Access Control (RBAC) & Security

| Role | Permissions | Endpoints Protected |
|---|---|---|
| **Guest / Anonymous** | Browse movies, view showtimes, inspect seat maps | `/api/movies`, `/api/shows` |
| **Authenticated Customer** | Hold seats, book tickets, cancel reservations, view ticket history | `/api/bookings/hold`, `/api/bookings`, `/api/bookings/:id/cancel` |
| **Theater Staff / Gatekeeper**| Scan and validate customer QR passes, admit entry | `/api/bookings/verify/:id`, `/api/bookings/use/:id` |
| **System Administrator** | Create/delete shows, manage movies, manage snacks/parking, view financial analytics and audit trail | `/api/shows` (POST/DELETE), `/api/analytics`, `/api/analytics/audit-logs` |

- Passwords hashed using bcrypt (10 salt rounds).
- Stateless JWT authentication with Bearer token validation and automatic expiration.
- CORS whitelist restricting browser access to approved deployment origins.

---

## 9. Automated Test Suite Validation

The system includes a 100% passing automated test suite (`server/tests/acceptance.test.js`) executed via Jest and Supertest.

| Test Case | Acceptance Criteria | Verified Result |
|---|---|---|
| `Test 1.1` | Available seat can be held for 5 minutes | `PASS (200 OK, lockedUntil set)` |
| `Test 1.2` | Holding user can confirm booking | `PASS (201 Created, isBooked: true)` |
| `Test 2.1` | Competing user rejected on holding booked seat | `PASS (409 Conflict)` |
| `Test 2.2` | Concurrent race condition: 2 simultaneous booking attempts | `PASS (Exactly one 201, one 409)` |
| `Test 3.1` | Expired holds auto-release and grant reservation to new user | `PASS (201 Created, hold cleared)` |
| `Test 3.2` | Confirmed bookings remain unavailable indefinitely | `PASS (409 Conflict)` |
| `Test 4.1` | Valid ticket passes initial gate QR scan | `PASS (200 OK, status: VALID)` |
| `Test 4.2` | Second validation attempt rejected as already used | `PASS (400 Bad Request, ALREADY_USED)`|
| `Test 4.3` | Cancelled/refunded ticket denied gate admission | `PASS (400 Bad Request, CANCELLED)` |
| `Test 5.1` | Occupancy report deducts cancelled tickets and increments cancellations | `PASS (Occupancy and refunds synced)` |

---

## 10. System Limitations & Future Roadmap

1. **Distributed Clustered Locking**: The current atomic `findOneAndUpdate` model is optimal for single or replica-set MongoDB instances. For multi-region geographically distributed databases, migrating to Redis Distributed Locks (Redlock) with sub-millisecond TTL keys would further reduce database write lock contention.
2. **WebSocket Real-time Seating Mesh**: Currently, seat states sync via 15-second polling and user-driven actions. Implementing Socket.io / WebSockets will deliver instantaneous seat occupancy updates across all active browser tabs in under 50ms.
3. **Payment Gateway Webhooks**: Live payments are currently simulated with instant confirmation. Integrating production Razorpay / Stripe webhooks with cryptographic signature verification will enable asynchronous 3D-Secure payment authorization.

