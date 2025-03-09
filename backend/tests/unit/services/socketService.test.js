const { emitNewAccident, emitAccidentUpdate } = require("../../../src/services/socketService");
const Camera = require("../../../src/models/Camera");

// Retrieve the clients object from the socket module (a plain object)
const { clients } = require("../../../src/socket");

jest.mock("../../../src/models/Camera");
jest.mock("../../../src/socket", () => ({
  clients: {}
}));

describe("Socket Service", () => {
  const accidentData = { cameraId: "cam_1", location: "Highway 1", severity: "high" };
  const updateData = { cameraId: "cam_1", _id: "accident_1", status: "assigned" };

  let logSpy, errorSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    // Manually clear keys from clients object
    Object.keys(clients).forEach((key) => delete clients[key]);

    // Spy on console.log and console.error and store the spies in variables.
    logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  describe("emitNewAccident", () => {
    test("should emit 'new_accident' event to authorized sockets", async () => {
      // Simulate a camera with populated users.
      const mockCamera = {
        _id: "camera_1",
        users: [{ id: "user1" }, { id: "user2" }]
      };
      Camera.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockCamera)
      });

      // Set up fake sockets in the clients object.
      clients.socket1 = { user: { id: "user1" }, emit: jest.fn() };
      clients.socket2 = { user: { id: "user2" }, emit: jest.fn() };
      clients.socket3 = { user: { id: "user3" }, emit: jest.fn() };

      await emitNewAccident(accidentData);

      expect(Camera.findOne).toHaveBeenCalledWith({ cameraId: "cam_1" });
      expect(clients.socket1.emit).toHaveBeenCalledWith("new_accident", accidentData);
      expect(clients.socket2.emit).toHaveBeenCalledWith("new_accident", accidentData);
      expect(clients.socket3.emit).not.toHaveBeenCalled();
      expect(logSpy).toHaveBeenCalledWith("Accident dispatched to 2 users");
    });

    test("should handle camera not found", async () => {
      Camera.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      });

      await emitNewAccident(accidentData);

      expect(Camera.findOne).toHaveBeenCalledWith({ cameraId: "cam_1" });
      expect(errorSpy).toHaveBeenCalledWith("Camera with ID cam_1 not found");
      expect(clients).toEqual({});
    });

    test("should handle errors during emission", async () => {
      // Instead of rejecting findOne directly (which would bypass the populate method),
      // simulate an error on the populate call.
      Camera.findOne.mockReturnValue({
        populate: jest.fn().mockRejectedValue(new Error("DB error"))
      });

      await emitNewAccident(accidentData);

      expect(errorSpy).toHaveBeenCalledWith(
        "Error emitting new accident:",
        expect.objectContaining({ message: "DB error" })
      );
    });
  });

  describe("emitAccidentUpdate", () => {
    test("should broadcast 'accident_update' event to authorized sockets", async () => {
      const mockCamera = {
        _id: "camera_1",
        users: [{ id: "userA" }]
      };
      Camera.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockCamera)
      });

      // Set up fake sockets.
      clients.socketA = { user: { id: "userA" }, emit: jest.fn() };
      clients.socketB = { user: { id: "userB" }, emit: jest.fn() };

      await emitAccidentUpdate(updateData);

      expect(Camera.findOne).toHaveBeenCalledWith({ cameraId: "cam_1" });
      expect(clients.socketA.emit).toHaveBeenCalledWith("accident_update", updateData);
      expect(clients.socketB.emit).not.toHaveBeenCalled();
      expect(logSpy).toHaveBeenCalledWith("Accident update dispatched to 1 users");
    });

    test("should handle missing camera", async () => {
      Camera.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      });

      await emitAccidentUpdate(updateData);

      expect(Camera.findOne).toHaveBeenCalledWith({ cameraId: "cam_1" });
      expect(errorSpy).toHaveBeenCalledWith("Camera with ID cam_1 not found");
    });

    test("should handle errors during update emission", async () => {
      Camera.findOne.mockReturnValue({
        populate: jest.fn().mockRejectedValue(new Error("Network error"))
      });

      await emitAccidentUpdate(updateData);

      expect(errorSpy).toHaveBeenCalledWith(
        "Error emitting accident update:",
        expect.objectContaining({ message: "Network error" })
      );
    });
  });
});
