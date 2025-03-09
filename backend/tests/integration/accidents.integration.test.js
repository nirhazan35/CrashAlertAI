const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../../index");
const Accident = require("../../src/models/Accident");
const User = require("../../src/models/User");

describe("Accidents Integration", () => {
  let testUser;

  // Create a test user that will be used for authentication and filtering accidents.
  beforeAll(async () => {
    // Create a user with a valid ObjectId.
    testUser = new User({
      _id: new mongoose.Types.ObjectId(),
      username: "testUser",
      email: "test@example.com",
      password: "hashed", // dummy value; not used for auth in integration tests
      assignedCameras: ["cam_1"],
    });
    await testUser.save();
  });

  // Clear the Accident collection after each test.
  afterEach(async () => {
    await Accident.deleteMany({});
  });

  // Optionally, you may drop the database and close the connection after all tests.
  // (This is handled by your tests/teardown.js if set up.)
  afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
  });

  describe("POST /accidents/handle-accident", () => {
    it("should create a new accident when valid data is provided", async () => {
      const accidentData = {
        cameraId: "cam_1",
        location: "Highway 1",
        severity: "high",
        video: "http://example.com/video.mp4"
      };

      const response = await request(app)
        .post("/accidents/handle-accident")
        .set("Authorization", "Bearer validtoken") // In real tests, you might bypass auth or simulate a valid token.
        .send(accidentData)
        .timeout({ deadline: 10000 });

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.cameraId).toBe("cam_1");
    }, 15000);

    it("should return error if required fields are missing", async () => {
      // Missing cameraId
      const accidentData = {
        location: "Highway 1",
        severity: "high"
      };

      const response = await request(app)
        .post("/accidents/handle-accident")
        .set("Authorization", "Bearer validtoken")
        .send(accidentData)
        .timeout({ deadline: 10000 });

      // According to your controller logic, missing fields result in a response with success:false.
      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/required/);
    }, 15000);
  });

  describe("GET /accidents/active-accidents", () => {
    it("should return active (and assigned) accidents", async () => {
      // Create an accident that belongs to a camera assigned to testUser.
      const accident = new Accident({
        cameraId: "cam_1",
        location: "Highway 1",
        severity: "high",
        status: "active"
      });
      await accident.save();

      const response = await request(app)
        .get("/accidents/active-accidents")
        .set("Authorization", "Bearer validtoken")
        .timeout({ deadline: 10000 });

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    }, 15000);
  });

  describe("POST /accidents/accident-status-update", () => {
    it("should update accident status successfully", async () => {
      const accident = new Accident({
        cameraId: "cam_1",
        location: "Highway 1",
        severity: "high",
        status: "active"
      });
      await accident.save();

      const response = await request(app)
        .post("/accidents/accident-status-update")
        .set("Authorization", "Bearer validtoken")
        .send({ accident_id: accident._id.toString(), status: "handled" })
        .timeout({ deadline: 10000 });

      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe("handled");
    }, 15000);

    it("should return 400 for an invalid status value", async () => {
      const accident = new Accident({
        cameraId: "cam_1",
        location: "Highway 1",
        severity: "high",
        status: "active"
      });
      await accident.save();

      const response = await request(app)
        .post("/accidents/accident-status-update")
        .set("Authorization", "Bearer validtoken")
        .send({ accident_id: accident._id.toString(), status: "invalid" })
        .timeout({ deadline: 10000 });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe("Invalid status value");
    }, 15000);

    it("should return 404 if accident not found", async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();

      const response = await request(app)
        .post("/accidents/accident-status-update")
        .set("Authorization", "Bearer validtoken")
        .send({ accident_id: fakeId, status: "handled" })
        .timeout({ deadline: 10000 });

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe("Accident not found");
    }, 15000);
  });

  describe("GET /accidents/handled-accidents", () => {
    it("should return handled accidents", async () => {
      const accident = new Accident({
        cameraId: "cam_1",
        location: "Highway 1",
        severity: "high",
        status: "handled"
      });
      await accident.save();

      const response = await request(app)
        .get("/accidents/handled-accidents")
        .set("Authorization", "Bearer validtoken")
        .timeout({ deadline: 10000 });

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data[0].status).toBe("handled");
    }, 15000);
  });

  describe("POST /accidents/update-accident-details", () => {
    it("should update accident details successfully", async () => {
      const accident = new Accident({
        cameraId: "cam_1",
        location: "Highway 1",
        severity: "high",
        status: "active",
        description: "Old description"
      });
      await accident.save();

      const response = await request(app)
        .post("/accidents/update-accident-details")
        .set("Authorization", "Bearer validtoken")
        .send({
          accident_id: accident._id.toString(),
          severity: "medium",
          description: "Updated description",
          falsePositive: true
        })
        .timeout({ deadline: 10000 });

      expect(response.statusCode).toBe(200);
      expect(response.body.severity).toBe("medium");
      expect(response.body.description).toBe("Updated description");
      expect(response.body.falsePositive).toBe(true);
    }, 15000);

    it("should return 400 for invalid severity value", async () => {
      const accident = new Accident({
        cameraId: "cam_1",
        location: "Highway 1",
        severity: "high",
        status: "active"
      });
      await accident.save();

      const response = await request(app)
        .post("/accidents/update-accident-details")
        .set("Authorization", "Bearer validtoken")
        .send({
          accident_id: accident._id.toString(),
          severity: "extreme"
        })
        .timeout({ deadline: 10000 });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe("Invalid severity value");
    }, 15000);

    it("should return 404 if accident not found when updating details", async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();

      const response = await request(app)
        .post("/accidents/update-accident-details")
        .set("Authorization", "Bearer validtoken")
        .send({
          accident_id: fakeId,
          severity: "low"
        })
        .timeout({ deadline: 10000 });

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe("Accident not found");
    }, 15000);

    it("should handle errors in updating accident details", async () => {
      // Send an invalid accident_id to simulate a cast error
      const response = await request(app)
        .post("/accidents/update-accident-details")
        .set("Authorization", "Bearer validtoken")
        .send({
          accident_id: "invalid_id",
          severity: "low"
        })
        .timeout({ deadline: 10000 });

      expect(response.statusCode).toBe(500);
      expect(response.body.message).toMatch(/Error updating accident details/);
    }, 15000);
  });
});
