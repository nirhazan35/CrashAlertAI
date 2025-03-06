const logAuth = require("../../util/LogAuth");
const AuthLogs = require("../../models/AuthLogs");

jest.mock("../../models/AuthLogs");

describe("LogAuth Utility", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should create a new auth log and save it", async () => {
    // Create a mock save method that resolves
    const mockSave = jest.fn().mockResolvedValue("saved");
    // When a new AuthLogs is created, it should store the passed data and have a save() method.
    AuthLogs.mockImplementation(function (data) {
      this.username = data.username;
      this.type = data.type;
      this.timeStamp = data.timeStamp;
      this.result = data.result;
      this.save = mockSave;
    });

    const username = "testUser";
    const type = "Login";
    const timeStamp = new Date();
    const result = "Success";

    await logAuth(username, type, timeStamp, result);

    // Verify that AuthLogs was instantiated with the correct data.
    expect(AuthLogs).toHaveBeenCalledWith({ username, type, timeStamp, result });
    // And that save() was called.
    expect(mockSave).toHaveBeenCalled();
  });

  test("should log an error if saving fails", async () => {
    const error = new Error("Save failed");
    const mockSave = jest.fn().mockRejectedValue(error);
    AuthLogs.mockImplementation(function (data) {
      this.username = data.username;
      this.type = data.type;
      this.timeStamp = data.timeStamp;
      this.result = data.result;
      this.save = mockSave;
    });

    // Spy on console.error
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    await logAuth("user", "Register", new Date(), "Failure");

    expect(consoleErrorSpy).toHaveBeenCalledWith("Error logging auth:", error);
    consoleErrorSpy.mockRestore();
  });
});
