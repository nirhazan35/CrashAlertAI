const {
    saveNewAccident,
    getActiveAccidents,
    changeAccidentStatus,
    getHandledAccidents,
    updateAccidentDetails,
  } = require("../../src/controllers/accidents");
  const Accident = require("../../models/Accident");
  const User = require("../../models/User");
  
  // Prevent socketService from running real logic during tests
  jest.mock("../../services/socketService", () => ({
    emitAccidentUpdate: jest.fn(),
  }));
  jest.mock("../../models/Accident");
  jest.mock("../../models/User");
  
  describe("Accidents Controller", () => {
    beforeEach(() => {
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });
    afterEach(() => {
        console.error.mockRestore();
        jest.clearAllMocks();
    });
  
    describe("saveNewAccident", () => {
      test("should save a new accident when valid input is provided", async () => {
        const accidentData = { cameraId: "cam_1", location: "Highway 1", severity: "high" };
        // Mock the save method on a new Accident instance
        Accident.prototype.save = jest.fn().mockResolvedValue({ _id: "acc123", ...accidentData });
        
        const result = await saveNewAccident(accidentData);
        
        expect(result.success).toBe(true);
        expect(result.data._id).toBe("acc123");
        expect(Accident.prototype.save).toHaveBeenCalled();
      });
  
      test("should return error if required fields are missing", async () => {
        const accidentData = { location: "Highway 1", severity: "high" }; // cameraId missing
        const result = await saveNewAccident(accidentData);
        expect(result.success).toBe(false);
        expect(result.message).toMatch(/required/);
      });
  
      test("should handle errors thrown during saving", async () => {
        const accidentData = { cameraId: "cam_1", location: "Highway 1", severity: "high" };
        Accident.prototype.save = jest.fn().mockRejectedValue(new Error("DB error"));
        
        const result = await saveNewAccident(accidentData);
        expect(result.success).toBe(false);
        expect(result.message).toMatch(/An error occurred while saving/);
        expect(result.error).toBe("DB error");
      });
    });

    describe("getActiveAccidents", () => {
      test("should return active accidents", async () => {
        const req = { user: { assignedCameras: ["cam_1"] } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        // Return one active accident that matches the user's camera
        Accident.find.mockResolvedValue([{ _id: "acc123", status: "active", cameraId: "cam_1" }]);
        
        await getActiveAccidents(req, res);
        
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({ success: true, data: expect.any(Array) })
        );
      });
  
      test("should handle errors in fetching active accidents", async () => {
        const req = { user: { assignedCameras: ["cam_1"] } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        Accident.find.mockRejectedValue(new Error("Fetch error"));
        
        await getActiveAccidents(req, res);
        
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({ success: false, message: expect.stringMatching(/An error occurred/) })
        );
      });
    });

    describe("changeAccidentStatus", () => {
      test("should change accident status successfully", async () => {
        const req = {
          body: { accident_id: "acc123", status: "handled" },
          user: { id: "user123" },
          get: jest.fn(() => "Bearer mockToken"),
        };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        // Mock User.findById to return an object with a get method for username
        User.findById.mockResolvedValue({ get: jest.fn().mockReturnValue("mockUsername") });
        // Mock update to return the updated accident
        Accident.findByIdAndUpdate.mockResolvedValue({ _id: "acc123", status: "handled" });
        
        await changeAccidentStatus(req, res);
        
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ status: "handled" }));
      });
  
      test("should return 400 for invalid status value", async () => {
        const req = {
          body: { accident_id: "acc123", status: "invalid" },
          user: { id: "user123" },
          get: jest.fn(() => "Bearer mockToken"),
        };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        
        await changeAccidentStatus(req, res);
        
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Invalid status value" }));
      });
  
      test("should return 404 if accident not found", async () => {
        const req = {
          body: { accident_id: "acc123", status: "handled" },
          user: { id: "user123" },
          get: jest.fn(() => "Bearer mockToken"),
        };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        User.findById.mockResolvedValue({ get: jest.fn().mockReturnValue("mockUsername") });
        // Simulate accident not found
        Accident.findByIdAndUpdate.mockResolvedValue(null);
        
        await changeAccidentStatus(req, res);
        
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Accident not found" }));
      });
  
      test("should handle errors in changeAccidentStatus", async () => {
        const req = {
          body: { accident_id: "acc123", status: "handled" },
          user: { id: "user123" },
          get: jest.fn(() => "Bearer mockToken"),
        };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        // Simulate error when updating accident
        User.findById.mockResolvedValue({ get: jest.fn().mockReturnValue("mockUsername") });
        Accident.findByIdAndUpdate.mockRejectedValue(new Error("Update error"));
        
        await changeAccidentStatus(req, res);
        
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringMatching(/An error occurred/) }));
      });
    });

    describe("getHandledAccidents", () => {
      test("should return handled accidents", async () => {
        const req = {}; // no special properties needed
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        Accident.find.mockResolvedValue([{ _id: "acc456", status: "handled" }]);
        
        await getHandledAccidents(req, res);
        
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({ success: true, data: expect.arrayContaining([expect.objectContaining({ status: "handled" })]) })
        );
      });
  
      test("should handle errors in getHandledAccidents", async () => {
        const req = {};
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        Accident.find.mockRejectedValue(new Error("Fetch error"));
        
        await getHandledAccidents(req, res);
        
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
      });
    });
  
    describe("updateAccidentDetails", () => {
      test("should update accident details successfully", async () => {
        const req = { body: { accident_id: "acc123", severity: "high", description: "Updated", falsePositive: false } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        // Simulate a successful update
        Accident.findByIdAndUpdate.mockResolvedValue({ _id: "acc123", severity: "high", description: "Updated", falsePositive: false });
        
        await updateAccidentDetails(req, res);
        
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ _id: "acc123" }));
      });
  
      test("should return 400 for invalid severity value", async () => {
        const req = { body: { accident_id: "acc123", severity: "extreme" } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        
        await updateAccidentDetails(req, res);
        
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Invalid severity value" }));
      });
  
      test("should return 404 if accident not found", async () => {
        const req = { body: { accident_id: "acc123", severity: "low" } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        // Simulate accident not found
        Accident.findByIdAndUpdate.mockResolvedValue(null);
        
        await updateAccidentDetails(req, res);
        
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Accident not found" }));
      });
  
      test("should handle errors in updateAccidentDetails", async () => {
        const req = { body: { accident_id: "acc123", severity: "low" } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        Accident.findByIdAndUpdate.mockRejectedValue(new Error("Update error"));
        
        await updateAccidentDetails(req, res);
        
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringMatching(/Error updating accident details/) }));
      });
    });
  });
  