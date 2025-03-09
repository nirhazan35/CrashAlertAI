const mongoose = require("mongoose");
const AuthLogs = require("../../../src/models/AuthLogs");
const logAuth = require("../../../src/util/LogAuth");

describe("LogAuth Utility", () => {
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
  });
  
  afterEach(async () => {
    // Clean up any created documents
    await AuthLogs.deleteMany({});
  });

  test("should create a valid auth log instance with default timeStamp", () => {
    const now = new Date();
    const logInstance = new AuthLogs({
      username: "testUser",
      type: "Login",
      result: "Success"
    });
    const validationError = logInstance.validateSync();
    expect(validationError).toBeUndefined();
    // Check that timeStamp default is applied:
    expect(logInstance.timeStamp).toBeDefined();
    expect(logInstance.timeStamp).toBeInstanceOf(Date);
    // Check that the default timeStamp is set close to current time (within 1 second)
    expect(Math.abs(logInstance.timeStamp.getTime() - now.getTime())).toBeLessThan(1000);
  });

  test("should fail validation if required fields are missing", () => {
    const logInstance = new AuthLogs({});
    const validationError = logInstance.validateSync();
    // Expect validation errors for required fields.
    expect(validationError.errors["username"]).toBeDefined();
    expect(validationError.errors["type"]).toBeDefined();
    expect(validationError.errors["result"]).toBeDefined();
  });

  test("initializeAndSave should set fields and save the log", async () => {
    // Override the save method to simulate saving
    const mockSave = jest.fn().mockResolvedValue({
      _id: new mongoose.Types.ObjectId().toHexString(),
      username: "testUser",
      type: "Login",
      result: "Success",
      timeStamp: new Date()
    });
    // Monkey-patch AuthLogs constructor for this test.
    const OriginalAuthLogs = AuthLogs;
    AuthLogs.prototype.save = mockSave;

    const savedLog = await logAuth("testUser", "Login", new Date(), "Success");
    expect(savedLog.username).toBe("testUser");
    expect(savedLog.type).toBe("Login");
    expect(savedLog.result).toBe("Success");
    expect(savedLog._id).toBeDefined();
    expect(mockSave).toHaveBeenCalled();

    // Restore the original save method.
    AuthLogs.prototype.save = OriginalAuthLogs.prototype.save;
  });

  test("initializeAndSave should default username to 'Unknown' and result to 'Failure' when not provided", async () => {
    const mockSave = jest.fn().mockResolvedValue({
      _id: new mongoose.Types.ObjectId().toHexString(),
      username: "Unknown",
      type: "Logout",
      result: "Failure",
      timeStamp: new Date()
    });
    const OriginalAuthLogs = AuthLogs;
    AuthLogs.prototype.save = mockSave;

    const savedLog = await logAuth(null, "Logout");
    expect(savedLog.username).toBe("Unknown");
    expect(savedLog.type).toBe("Logout");
    expect(savedLog.result).toBe("Failure");
    expect(mockSave).toHaveBeenCalled();

    AuthLogs.prototype.save = OriginalAuthLogs.prototype.save;
  });

  test("initializeAndSave should propagate errors from save", async () => {
    const error = new Error("Save failed");
    const mockSave = jest.fn().mockRejectedValue(error);
    const OriginalAuthLogs = AuthLogs;
    AuthLogs.prototype.save = mockSave;

    await expect(logAuth("user", "Login")).rejects.toThrow("Save failed");
    expect(mockSave).toHaveBeenCalled();

    AuthLogs.prototype.save = OriginalAuthLogs.prototype.save;
  });

  test("updateResult should update the result and save the log", async () => {
    // Create a new log instance using the real model.
    const logInstance = new AuthLogs({
      username: "testUser",
      type: "Register",
      result: "Failure"
    });
    // Override save method to simulate a successful update.
    logInstance.save = jest.fn().mockResolvedValue({
      _id: new mongoose.Types.ObjectId().toHexString(),
      username: logInstance.username,
      type: logInstance.type,
      result: "Success",
      timeStamp: logInstance.timeStamp
    });

    const updatedLog = await logInstance.updateResult("Success");
    expect(updatedLog.result).toBe("Success");
    expect(logInstance.save).toHaveBeenCalled();
  });

  test("updateResult should propagate errors from save", async () => {
    const logInstance = new AuthLogs({
      username: "testUser",
      type: "Register",
      result: "Failure"
    });
    logInstance.save = jest.fn().mockRejectedValue(new Error("Update failed"));
    await expect(logInstance.updateResult("Success")).rejects.toThrow("Update failed");
  });

  test("initializeAndSave should set a timeStamp if not provided", async () => {
    const mockSave = jest.fn().mockResolvedValue({
      _id: new mongoose.Types.ObjectId().toHexString(),
      username: "testUser",
      type: "Login",
      result: "Success",
      timeStamp: new Date()
    });
    const OriginalAuthLogs = AuthLogs;
    AuthLogs.prototype.save = mockSave;

    const savedLog = await logAuth("testUser", "Login");
    expect(savedLog.timeStamp).toBeDefined();
    expect(savedLog.timeStamp).toBeInstanceOf(Date);

    AuthLogs.prototype.save = OriginalAuthLogs.prototype.save;
  });
});
