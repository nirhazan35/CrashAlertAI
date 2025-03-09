const mongoose = require("mongoose");
const AuthLogs = require("../../../src/models/AuthLogs");

describe("AuthLogs Model", () => {
  // Clear the AuthLogs collection after each test (using the in-memory DB from setup.js)
  afterEach(async () => {
    await AuthLogs.deleteMany({});
  });

  test("should create a valid auth log instance with default timeStamp", () => {
    const log = new AuthLogs({
      username: "testUser",
      type: "Login",
      result: "Success",
    });
    const error = log.validateSync();
    expect(error).toBeUndefined();
    // Check that the default timeStamp is set and is a Date
    expect(log.timeStamp).toBeDefined();
    expect(log.timeStamp).toBeInstanceOf(Date);
  });

  test("should fail validation if required fields are missing", () => {
    const log = new AuthLogs({});
    const error = log.validateSync();
    expect(error.errors["username"]).toBeDefined();
    expect(error.errors["type"]).toBeDefined();
    expect(error.errors["result"]).toBeDefined();
  });

  test("should set timeStamp close to current time", () => {
    const before = new Date();
    const log = new AuthLogs({
      username: "testUser",
      type: "Login",
      result: "Success",
    });
    const after = new Date();
    // Ensure the log.timeStamp is between before and after timestamps
    expect(log.timeStamp.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(log.timeStamp.getTime()).toBeLessThanOrEqual(after.getTime());
  });

  test("initializeAndSave should set fields and save the log", async () => {
    const log = new AuthLogs();
    const savedLog = await log.initializeAndSave("testUser", "Login", "Success");
    expect(savedLog.username).toBe("testUser");
    expect(savedLog.type).toBe("Login");
    expect(savedLog.result).toBe("Success");
    expect(savedLog._id).toBeDefined();
  });

  test("initializeAndSave should default username to 'Unknown' and result to 'Failure' when not provided", async () => {
    const log = new AuthLogs();
    const savedLog = await log.initializeAndSave(null, "Logout");
    expect(savedLog.username).toBe("Unknown");
    expect(savedLog.type).toBe("Logout");
    expect(savedLog.result).toBe("Failure");
  });

  test("initializeAndSave should propagate errors from save", async () => {
    const log = new AuthLogs();
    // Override save to simulate an error
    log.save = jest.fn().mockRejectedValue(new Error("Save failed"));
    await expect(log.initializeAndSave("user", "Login")).rejects.toThrow("Save failed");
  });

  test("updateResult should update the result and save the log", async () => {
    // Create and save a log first
    const log = new AuthLogs({
      username: "testUser",
      type: "Register",
      result: "Failure",
    });
    await log.save();
    const updatedLog = await log.updateResult("Success");
    expect(updatedLog.result).toBe("Success");
  });

  test("updateResult should propagate errors from save", async () => {
    const log = new AuthLogs({
      username: "testUser",
      type: "Register",
      result: "Failure",
    });
    await log.save();
    // Override save to simulate an error on update
    log.save = jest.fn().mockRejectedValue(new Error("Update failed"));
    await expect(log.updateResult("Success")).rejects.toThrow("Update failed");
  });
});
