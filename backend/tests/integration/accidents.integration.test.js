const request = require("supertest");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

// Import the Express app from your index.js.
// Make sure your index.js exports the Express app (e.g., module.exports = app)
const app = require("../../index");
const Accident = require("../../src/models/Accident");

// Create a test user and generate a valid JWT for protected routes.
// (Using a fixed secret for tests. Ensure your tests/setup.js or environment sets ACCESS_TOKEN_SECRET.)
const testUser = { id: "testUser", role: "admin", username: "adminUser" };
const token = jwt.sign(testUser, process.env.ACCESS_TOKEN_SECRET || "testsecret", { expiresIn: "1h" });

describe("Accidents Integration", () => {
  beforeEach(async () => {
    // Clear the Accident collection before each test
    await Accident.deleteMany({});
  });

  afterAll(async () => {
    // Close mongoose connection when done
    await mongoose.connection.close();
  });

  describe("POST /accidents/handle-accident", () => {
    test("should create a new accident when valid data is provided", async () => {
      const accidentData = {
        cameraId: "cam_1",
        location: "Highway 1",
        severity: "high",
        video: "http://example.com/video.mp4"
      };

      const response = await request(app)
        .post("/accidents/handle-accident")
        .set("Authorization", `Bearer ${token}`)
        .send(accidentData);

      // Assuming that a successful save returns a JSON with success: true.
      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.cameraId).toBe("cam_1");
      // Also, check that displayDate and displayTime have been set by the DateFormatting utility.
      expect(response.body.data.displayDate).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
      expect(response.body.data.displayTime).toMatch(/^\d{2}:\d{2}:\d{2}$/);
    });

    test("should return error if required fields are missing", async () => {
      // Missing cameraId
      const accidentData = {
        location: "Highway 1",
        severity: "high"
      };

      const response = await request(app)
        .post("/accidents/handle-accident")
        .set("Authorization", `Bearer ${token}`)
        .send(accidentData);

      // The controller returns success false with a message.
      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/required/);
    });
  });

  describe("GET /accidents/active-accidents", () => {
    test("should return active (and assigned) accidents", async () => {
      // Create some accidents (one active, one assigned, one handled)
      await Accident.create([
        { cameraId: "cam_1", location: "Highway 1", severity: "high", status: "active" },
        { cameraId: "cam_1", location: "Highway 1", severity: "low", status: "assigned" },
        { cameraId: "cam_2", location: "Highway 2", severity: "medium", status: "handled" }
      ]);

      const response = await request(app)
        .get("/accidents/active-accidents")
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      // Only accidents with status active or assigned are returned.
      expect(response.body.data.length).toBe(2);
    });
  });

  describe("POST /accidents/accident-status-update", () => {
    test("should update accident status successfully", async () => {
      // Create an accident
      const accident = await Accident.create({
        cameraId: "cam_1",
        location: "Highway 1",
        severity: "high",
        status: "active"
      });

      const response = await request(app)
        .post("/accidents/accident-status-update")
        .set("Authorization", `Bearer ${token}`)
        .send({ accident_id: accident._id, status: "handled" });

      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe("handled");
    });

    test("should return 400 for an invalid status value", async () => {
      const accident = await Accident.create({
        cameraId: "cam_1",
        location: "Highway 1",
        severity: "high",
        status: "active"
      });

      const response = await request(app)
        .post("/accidents/accident-status-update")
        .set("Authorization", `Bearer ${token}`)
        .send({ accident_id: accident._id, status: "invalid" });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe("Invalid status value");
    });

    test("should return 404 if accident not found", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .post("/accidents/accident-status-update")
        .set("Authorization", `Bearer ${token}`)
        .send({ accident_id: fakeId, status: "handled" });

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe("Accident not found");
    });
  });

  describe("GET /accidents/handled-accidents", () => {
    test("should return handled accidents", async () => {
      await Accident.create([
        { cameraId: "cam_1", location: "Highway 1", severity: "high", status: "handled" },
        { cameraId: "cam_2", location: "Highway 2", severity: "low", status: "active" }
      ]);

      const response = await request(app)
        .get("/accidents/handled-accidents")
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].status).toBe("handled");
    });
  });

  describe("POST /accidents/update-accident-details", () => {
    test("should update accident details successfully", async () => {
      const accident = await Accident.create({
        cameraId: "cam_1",
        location: "Highway 1",
        severity: "high",
        status: "active"
      });

      const newDetails = {
        accident_id: accident._id,
        severity: "medium",
        description: "Updated description",
        falsePositive: true
      };

      const response = await request(app)
        .post("/accidents/update-accident-details")
        .set("Authorization", `Bearer ${token}`)
        .send(newDetails);

      expect(response.statusCode).toBe(200);
      expect(response.body.severity).toBe("medium");
      expect(response.body.description).toBe("Updated description");
      expect(response.body.falsePositive).toBe(true);
    });

    test("should return 400 for invalid severity value", async () => {
      const accident = await Accident.create({
        cameraId: "cam_1",
        location: "Highway 1",
        severity: "high",
        status: "active"
      });

      const response = await request(app)
        .post("/accidents/update-accident-details")
        .set("Authorization", `Bearer ${token}`)
        .send({ accident_id: accident._id, severity: "extreme" });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe("Invalid severity value");
    });

    test("should return 404 if accident not found when updating details", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .post("/accidents/update-accident-details")
        .set("Authorization", `Bearer ${token}`)
        .send({ accident_id: fakeId, severity: "low" });

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe("Accident not found");
    });

    test("should handle errors in updating accident details", async () => {
      // Forcing an error by passing an invalid accident_id type.
      const response = await request(app)
        .post("/accidents/update-accident-details")
        .set("Authorization", `Bearer ${token}`)
        .send({ accident_id: "invalid_id", severity: "low" });

      expect(response.statusCode).toBe(500);
      expect(response.body.message).toMatch(/Error updating accident details/);
    });
  });
});
