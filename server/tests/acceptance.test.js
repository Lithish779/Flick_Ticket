const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../server");
const Movie = require("../models/Movie");
const Show = require("../models/Show");
const Booking = require("../models/Booking");
const User = require("../models/User");

describe("ALGIONS AI LABS - Cinema Hall Ticket Booking System Acceptance Test Suite", () => {
  let testUser1;
  let testUser2;
  let testMovie;
  let testShow;
  let validBooking;
  let cancelledBooking;

  beforeAll(async () => {
    // Ensure DB connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/cinebook");
    }

    // Create test users
    testUser1 = await User.create({
      name: "Algions Candidate Alice",
      email: `alice_${Date.now()}@algions.com`,
      password: "password123",
      role: "user",
    });

    testUser2 = await User.create({
      name: "Algions Candidate Bob",
      email: `bob_${Date.now()}@algions.com`,
      password: "password123",
      role: "user",
    });

    // Create test movie
    testMovie = await Movie.create({
      title: "Algions Inception " + Date.now(),
      genre: "Sci-Fi",
      duration: 148,
      rating: 9.0,
      description: "Algions concurrency and seat locking test benchmark.",
      poster: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800",
    });

    // Create test show with 4 seats
    testShow = await Show.create({
      movieId: testMovie._id,
      theatre: "Algions Grand IMAX",
      date: "2026-11-20",
      time: "07:00 PM",
      balconyPrice: 300,
      firstClassPrice: 250,
      secondClassPrice: 200,
      seats: [
        { seatNumber: "T1", category: "Balcony", price: 300, isBooked: false, lockedUntil: null, lockedBy: null },
        { seatNumber: "T2", category: "Balcony", price: 300, isBooked: false, lockedUntil: null, lockedBy: null },
        { seatNumber: "T3", category: "Second Class", price: 200, isBooked: false, lockedUntil: null, lockedBy: null },
        { seatNumber: "T4", category: "Second Class", price: 200, isBooked: false, lockedUntil: null, lockedBy: null },
      ],
    });
  });

  afterAll(async () => {
    // Cleanup test artifacts
    if (testShow) await Show.findByIdAndDelete(testShow._id);
    if (testMovie) await Movie.findByIdAndDelete(testMovie._id);
    if (testUser1) await User.findByIdAndDelete(testUser1._id);
    if (testUser2) await User.findByIdAndDelete(testUser2._id);
    await Booking.deleteMany({ showId: testShow?._id });
    await mongoose.connection.close();
  });

  /* -------------------------------------------------------------------------- */
  /* ACCEPTANCE CRITERIA 1: Available seat can be held and booked               */
  /* -------------------------------------------------------------------------- */
  describe("Acceptance Criteria 1: Seat Hold and Booking Flow", () => {
    it("should allow an available seat (T1) to be held for 5 minutes", async () => {
      const res = await request(app)
        .post("/api/bookings/hold")
        .send({
          showId: testShow._id.toString(),
          seats: ["T1"],
          userId: testUser1._id.toString(),
          holdMinutes: 5,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.holdExpiresAt).toBeDefined();
      expect(res.body.seats).toContain("T1");

      // Verify seat is locked in database
      const updatedShow = await Show.findById(testShow._id);
      const seatT1 = updatedShow.seats.find((s) => s.seatNumber === "T1");
      expect(seatT1.lockedUntil).not.toBeNull();
      expect(seatT1.lockedBy.toString()).toBe(testUser1._id.toString());
      expect(seatT1.isBooked).toBe(false);
    });

    it("should allow the holding user to confirm and finalize booking for seat T1", async () => {
      const res = await request(app)
        .post("/api/bookings")
        .send({
          showId: testShow._id.toString(),
          seats: ["T1"],
          userId: testUser1._id.toString(),
          snacks: [],
          parking: null,
        });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe("CONFIRMED");
      expect(res.body.bookingReference).toMatch(/^CB-2026-[A-Z0-9]{6}$/);
      expect(res.body.seats).toEqual(["T1"]);
      expect(res.body.totalPrice).toBe(300);

      // Verify seat is permanently booked and hold is cleared
      const updatedShow = await Show.findById(testShow._id);
      const seatT1 = updatedShow.seats.find((s) => s.seatNumber === "T1");
      expect(seatT1.isBooked).toBe(true);
      expect(seatT1.lockedUntil).toBeNull();
      expect(seatT1.lockedBy).toBeNull();
    });
  });

  /* -------------------------------------------------------------------------- */
  /* ACCEPTANCE CRITERIA 2: Double-booking rejection (409 Conflict)             */
  /* -------------------------------------------------------------------------- */
  describe("Acceptance Criteria 2: Double-Booking Prevention & Concurrency Guard", () => {
    it("should reject another user (User 2) attempting to hold an already booked seat (T1) with 409 Conflict", async () => {
      const res = await request(app)
        .post("/api/bookings/hold")
        .send({
          showId: testShow._id.toString(),
          seats: ["T1"],
          userId: testUser2._id.toString(),
        });

      expect(res.status).toBe(409);
      expect(res.body.conflictedSeats).toContain("T1");
    });

    it("should reject concurrent booking attempts for the same seat (T2), granting only one and rejecting the other with 409", async () => {
      // Both users concurrently attempt to book seat T2
      const [res1, res2] = await Promise.all([
        request(app).post("/api/bookings").send({
          showId: testShow._id.toString(),
          seats: ["T2"],
          userId: testUser1._id.toString(),
        }),
        request(app).post("/api/bookings").send({
          showId: testShow._id.toString(),
          seats: ["T2"],
          userId: testUser2._id.toString(),
        }),
      ]);

      const statuses = [res1.status, res2.status].sort();
      // Exactly one must succeed (201) and one must be rejected (409 Conflict)
      expect(statuses).toEqual([201, 409]);

      // Verify database reflects exactly one booking for T2
      const updatedShow = await Show.findById(testShow._id);
      const seatT2 = updatedShow.seats.find((s) => s.seatNumber === "T2");
      expect(seatT2.isBooked).toBe(true);
    });
  });

  /* -------------------------------------------------------------------------- */
  /* ACCEPTANCE CRITERIA 3: Expired holds release; confirmed bookings remain    */
  /* -------------------------------------------------------------------------- */
  describe("Acceptance Criteria 3: Expired Holds & Booking Persistence", () => {
    it("should automatically release expired seat holds and permit new reservations", async () => {
      // Simulate expired hold on seat T3 by manually setting lockedUntil in the past
      await Show.updateOne(
        { _id: testShow._id, "seats.seatNumber": "T3" },
        {
          $set: {
            "seats.$.lockedUntil": new Date(Date.now() - 60000), // 1 minute in the past
            "seats.$.lockedBy": testUser1._id,
            "seats.$.isBooked": false,
          },
        }
      );

      // User 2 now books seat T3; the system must auto-clear the expired hold and grant the booking
      const res = await request(app)
        .post("/api/bookings")
        .send({
          showId: testShow._id.toString(),
          seats: ["T3"],
          userId: testUser2._id.toString(),
        });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe("CONFIRMED");
      expect(res.body.seats).toContain("T3");

      // Verify seat T3 is now confirmed booked by User 2
      const updatedShow = await Show.findById(testShow._id);
      const seatT3 = updatedShow.seats.find((s) => s.seatNumber === "T3");
      expect(seatT3.isBooked).toBe(true);
      expect(seatT3.lockedUntil).toBeNull();
    });

    it("should ensure confirmed booked seats (T1) remain unavailable indefinitely", async () => {
      const res = await request(app)
        .post("/api/bookings")
        .send({
          showId: testShow._id.toString(),
          seats: ["T1"],
          userId: testUser2._id.toString(),
        });

      expect(res.status).toBe(409);
      expect(res.body.conflictedSeats).toContain("T1");
    });
  });

  /* -------------------------------------------------------------------------- */
  /* ACCEPTANCE CRITERIA 4: Ticket QR validation (single-use & cancelled reject)*/
  /* -------------------------------------------------------------------------- */
  describe("Acceptance Criteria 4: Gate Validation Guards (Single Use & Cancellation Guard)", () => {
    beforeAll(async () => {
      // Create a valid booking for Seat T4
      const res1 = await request(app)
        .post("/api/bookings")
        .send({
          showId: testShow._id.toString(),
          seats: ["T4"],
          userId: testUser1._id.toString(),
        });
      validBooking = res1.body;

      cancelledBooking = await Booking.create({
        bookingReference: "CB-2026-CANCEL",
        showId: testShow._id,
        seats: ["T_CANCELLED"],
        userId: testUser1._id,
        totalPrice: 300,
        status: "CANCELLED",
        paymentStatus: "Refunded",
        refundStatus: "PROCESSED",
        refundAmount: 300,
        refundId: "REF-TEST-001",
        used: false,
      });
    });

    it("should validate an active ticket reference as VALID for first-time gate entry", async () => {
      const res = await request(app)
        .get(`/api/bookings/verify/${validBooking.bookingReference}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("VALID");
      expect(res.body.booking.bookingReference).toBe(validBooking.bookingReference);
    });

    it("should mark the ticket as used and reject subsequent gate validation attempts", async () => {
      // First, mark as used at gate
      const useRes = await request(app)
        .put(`/api/bookings/use/${validBooking.bookingReference}`);
      expect(useRes.status).toBe(200);

      // Second validation attempt must be rejected
      const retryRes = await request(app)
        .get(`/api/bookings/verify/${validBooking.bookingReference}`);

      expect(retryRes.status).toBe(400);
      expect(retryRes.body.status).toBe("ALREADY_USED");
      expect(retryRes.body.message).toMatch(/ALREADY USED/);
    });

    it("should reject validation for cancelled tickets with clear entry denial message", async () => {
      const res = await request(app)
        .get(`/api/bookings/verify/${cancelledBooking.bookingReference}`);

      expect(res.status).toBe(400);
      expect(res.body.status).toBe("CANCELLED");
      expect(res.body.message).toMatch(/CANCELLED/);
    });
  });

  /* -------------------------------------------------------------------------- */
  /* ACCEPTANCE CRITERIA 5: Admin Occupancy Report & Cancellation Deductions   */
  /* -------------------------------------------------------------------------- */
  describe("Acceptance Criteria 5: Occupancy Report and Cancellation Deductions", () => {
    it("should dynamically deduct cancelled tickets from occupancy and increment cancellations", async () => {
      // 1. Fetch baseline analytics
      const baselineRes = await request(app).get("/api/analytics");
      expect(baselineRes.status).toBe(200);
      const baselineCancellations = baselineRes.body.summary?.totalCancellations || 0;

      // 2. Cancel the valid booking for seat T4
      const cancelRes = await request(app)
        .post(`/api/bookings/${cancelledBooking._id}/cancel`)
        .send({ reason: "Testing occupancy audit sync" });

      // Even if cancelledBooking was already CANCELLED, verify error handling:
      expect(cancelRes.status).toBe(400); // Already cancelled

      // Now create a fresh booking, check occupancy, then cancel it and check occupancy again
      const tempShow = await Show.create({
        movieId: testMovie._id,
        theatre: "Algions Audit Lab",
        date: "2026-11-21",
        time: "09:00 PM",
        balconyPrice: 500,
        firstClassPrice: 400,
        secondClassPrice: 300,
        seats: [
          { seatNumber: "X1", category: "Balcony", price: 500, isBooked: false },
          { seatNumber: "X2", category: "Balcony", price: 500, isBooked: false },
        ],
      });

      const bookRes = await request(app)
        .post("/api/bookings")
        .send({
          showId: tempShow._id.toString(),
          seats: ["X1"],
          userId: testUser1._id.toString(),
        });
      expect(bookRes.status).toBe(201);
      const newBookingId = bookRes.body._id;

      // Check analytics with active booking
      const activeAnalytics = await request(app).get("/api/analytics");
      const activeTickets = activeAnalytics.body.summary?.totalTickets || 0;

      // Cancel the new booking
      const confirmCancelRes = await request(app)
        .post(`/api/bookings/${newBookingId}/cancel`)
        .send({ reason: "Customer changed showtime" });

      expect(confirmCancelRes.status).toBe(200);
      expect(confirmCancelRes.body.success).toBe(true);
      expect(confirmCancelRes.body.refundAmount).toBe(500);

      // Verify seat X1 was restored to available in show
      const updatedTempShow = await Show.findById(tempShow._id);
      const seatX1 = updatedTempShow.seats.find((s) => s.seatNumber === "X1");
      expect(seatX1.isBooked).toBe(false);

      // Fetch analytics after cancellation
      const postCancelAnalytics = await request(app).get("/api/analytics");
      const postCancelTickets = postCancelAnalytics.body.summary?.totalTickets || 0;
      const postCancellations = postCancelAnalytics.body.summary?.totalCancellations || 0;

      // Total tickets should decrease by 1, and cancellations should increase by 1
      expect(postCancelTickets).toBe(activeTickets - 1);
      expect(postCancellations).toBeGreaterThan(baselineCancellations);

      // Cleanup temp show
      await Show.findByIdAndDelete(tempShow._id);
      await Booking.findByIdAndDelete(newBookingId);
    });
  });
});
