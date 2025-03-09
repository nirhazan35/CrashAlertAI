// Force a dummy export for routes so that controllers/auth.js doesn't break.
jest.mock("../../../src/routes/auth", () => ({ use: jest.fn() }));

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../../src/models/User");
const authLogs = require("../../../src/models/AuthLogs");
const { register, login, logout, refreshToken } = require("../../../src/controllers/auth");

// Mock dependencies
jest.mock("../../../src/models/User");
jest.mock("../../../src/models/AuthLogs");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");

describe("Auth Controller", () => {
  beforeEach(() => {
    process.env.ACCESS_TOKEN_SECRET = "test_access_secret";
    process.env.REFRESH_TOKEN_SECRET = "test_refresh_secret";
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("register", () => {
    test("should register a new user successfully", async () => {
      const req = {
        user: { id: "admin123" },
        body: { username: "newUser", email: "new@example.com", password: "password", role: "user" },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      // Mock admin user lookup
      User.findById.mockResolvedValue({ get: jest.fn().mockReturnValue("adminUser") });
      // For uniqueness checks, simulate no matching user found
      User.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
      // Mock saving new user – override the instance method save on User prototype
      const mockSavedUser = { _id: "user123", username: "newUser", email: "new@example.com", role: "user", superior: "adminUser" };
      User.prototype.save = jest.fn().mockResolvedValue(mockSavedUser);

      // Mock bcrypt operations
      bcrypt.genSalt.mockResolvedValue("salt");
      bcrypt.hash.mockResolvedValue("hashed_password");

      // Mock authLogs methods
      const updateResultMock = jest.fn().mockResolvedValue();
      const initializeAndSaveMock = jest.fn().mockResolvedValue();
      authLogs.mockImplementation(() => ({
        initializeAndSave: initializeAndSaveMock,
        updateResult: updateResultMock,
      }));

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockSavedUser);
      expect(bcrypt.hash).toHaveBeenCalledWith("password", "salt");
    });

    test("should fail if username already exists", async () => {
      const req = {
        user: { id: "admin123" },
        body: { username: "existingUser", email: "new@example.com", password: "password", role: "user" },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      // Mock admin lookup
      User.findById.mockResolvedValue({ get: jest.fn().mockReturnValue("adminUser") });
      // Simulate username already exists by returning a user on the first findOne call
      User.findOne.mockResolvedValueOnce({});

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: "Failed to create user" }));
    });
  });

  describe("login", () => {
    test("should login successfully with valid credentials", async () => {
      const req = { body: { username: "testUser", password: "password" } };
      const res = { 
        status: jest.fn().mockReturnThis(), 
        json: jest.fn(), 
        cookie: jest.fn() 
      };

      const mockUser = { 
        id: "user123", 
        username: "testUser", 
        password: "hashed_password", 
        role: "user", 
        save: jest.fn().mockResolvedValue() 
      };

      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockImplementation(() => "signedToken");

      // Mock authLogs methods
      const updateResultMock = jest.fn().mockResolvedValue();
      const initializeAndSaveMock = jest.fn().mockResolvedValue();
      authLogs.mockImplementation(() => ({
        initializeAndSave: initializeAndSaveMock,
        updateResult: updateResultMock,
      }));

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ accessToken: "signedToken" });
      expect(res.cookie).toHaveBeenCalled();
      expect(bcrypt.compare).toHaveBeenCalledWith("password", "hashed_password");
    });

    test("should fail login if user is not found", async () => {
      const req = { body: { username: "nonexistent", password: "password" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      User.findOne.mockResolvedValue(null);

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Invalid username or password" });
    });

    test("should fail login if password is incorrect", async () => {
      const req = { body: { username: "testUser", password: "wrongpassword" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      const mockUser = { id: "user123", username: "testUser", password: "hashed_password" };
      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Invalid username or password" });
    });
  });

  describe("logout", () => {
    test("should return 204 if no JWT cookie is present", async () => {
      const req = { body: { username: "testUser" }, cookies: {} };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), clearCookie: jest.fn(), send: jest.fn() };

      await logout(req, res);
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

    test("should logout successfully if user is found", async () => {
      const req = { 
        body: { username: "testUser" }, 
        cookies: { jwt: "refreshToken" } 
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), clearCookie: jest.fn(), send: jest.fn() };

      const mockUser = { 
        username: "testUser", 
        refreshToken: "refreshToken", 
        save: jest.fn().mockResolvedValue() 
      };
      User.findOne.mockResolvedValue(mockUser);

      // Mock authLogs methods
      const updateResultMock = jest.fn().mockResolvedValue();
      const initializeAndSaveMock = jest.fn().mockResolvedValue();
      authLogs.mockImplementation(() => ({
        initializeAndSave: initializeAndSaveMock,
        updateResult: updateResultMock,
      }));

      await logout(req, res);
      expect(mockUser.refreshToken).toBeNull();
      expect(res.clearCookie).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Logged out successfully" });
    });

    test("should clear cookie and return 204 if user not found", async () => {
      const req = { 
        body: { username: "testUser" }, 
        cookies: { jwt: "refreshToken" } 
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), clearCookie: jest.fn(), send: jest.fn() };

      User.findOne.mockResolvedValue(null);
      await logout(req, res);
      expect(res.clearCookie).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });
  });

  describe("refreshToken", () => {
    test("should return 401 if no JWT cookie is present", async () => {
      const req = { cookies: {} };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await refreshToken(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Refresh Token not found" });
    });

    test("should return 403 if user not found", async () => {
      const req = { cookies: { jwt: "refreshToken" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      jwt.verify.mockReturnValue({ id: "user123" });
      User.findOne.mockResolvedValue(null);

      await refreshToken(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
    });

    test("should return new access token on valid refresh", async () => {
      const req = { cookies: { jwt: "refreshToken" } };
      const res = { json: jest.fn() };

      const mockUser = { id: "user123", role: "user", username: "testUser" };
      jwt.verify.mockReturnValue({ id: "user123" });
      User.findOne.mockResolvedValue(mockUser);
      jwt.sign.mockImplementation(() => "newAccessToken");

      await refreshToken(req, res);
      expect(res.json).toHaveBeenCalledWith({ accessToken: "newAccessToken" });
    });

    test("should return 403 for invalid or expired refresh token", async () => {
      const req = { cookies: { jwt: "refreshToken" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      jwt.verify.mockImplementation(() => { throw new Error("Token error"); });

      await refreshToken(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Invalid or expired Refresh Token" }));
    });
  });
});
