const { getCameras, assignCameras } = require("../../src/controllers/cameras");
const Camera = require("../../src/models/Camera");
const User = require("../../src/models/User");

jest.mock("../../src/models/Camera");
jest.mock("../../src/models/User");

describe("Cameras Controller", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getCameras", () => {
    test("should return cameras with status 200 if cameras exist", async () => {
      const req = {};
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      const camerasMock = [{ _id: "cam1" }, { _id: "cam2" }];
      Camera.find.mockResolvedValue(camerasMock);

      await getCameras(req, res);

      expect(Camera.find).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(camerasMock);
    });

    test("should return 400 if no cameras found (null)", async () => {
      const req = {};
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      Camera.find.mockResolvedValue(null);

      await getCameras(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "No active cameras" });
    });

    test("should return 500 if an error occurs in fetching cameras", async () => {
      const req = {};
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      const errorMessage = "Database error";
      Camera.find.mockRejectedValue(new Error(errorMessage));

      await getCameras(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Failed to fetch cameras", message: errorMessage });
    });
  });

  describe("assignCameras", () => {
    test("should return 400 if input is invalid", async () => {
      const req = { body: { userId: null, cameraIds: "not an array" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await assignCameras(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid input' });
    });

    test("should return 404 if user is not found", async () => {
      const req = { body: { userId: "user123", cameraIds: ["cam1", "cam2"] } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      User.findById.mockResolvedValue(null);

      await assignCameras(req, res);

      expect(User.findById).toHaveBeenCalledWith("user123");
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });

    test("should return 400 if not all cameras exist", async () => {
      const req = { body: { userId: "user123", cameraIds: ["cam1", "cam2"] } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      // Simulate a user exists
      User.findById.mockResolvedValue({ assignedCameras: [], save: jest.fn() });
      // Simulate that only one camera is returned even though two are requested
      Camera.find.mockResolvedValue([{ _id: "cam1" }]);

      await assignCameras(req, res);

      expect(Camera.find).toHaveBeenCalledWith({ _id: { $in: ["cam1", "cam2"] } });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'One or more cameras not found' });
    });

    test("should assign cameras successfully and return 200", async () => {
      const req = { body: { userId: "user123", cameraIds: ["cam1", "cam2"] } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      // Simulate a found user with a save method
      const mockUser = { 
        assignedCameras: [], 
        save: jest.fn().mockResolvedValue() 
      };
      User.findById.mockResolvedValue(mockUser);
      // Simulate that cameras exist matching the requested cameraIds
      Camera.find.mockResolvedValue([{ _id: "cam1" }, { _id: "cam2" }]);

      await assignCameras(req, res);

      expect(User.findById).toHaveBeenCalledWith("user123");
      expect(Camera.find).toHaveBeenCalledWith({ _id: { $in: ["cam1", "cam2"] } });
      expect(mockUser.assignedCameras).toEqual(["cam1", "cam2"]);
      expect(mockUser.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Cameras assigned successfully' });
    });

    test("should return 500 if an error occurs during assignment", async () => {
      const req = { body: { userId: "user123", cameraIds: ["cam1", "cam2"] } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      // Simulate error thrown when finding user
      User.findById.mockRejectedValue(new Error("DB error"));

      await assignCameras(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "DB error" });
    });
  });
});
