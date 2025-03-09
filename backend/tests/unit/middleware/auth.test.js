const jwt = require("jsonwebtoken");
const User = require("../../../src/models/User");
const { verifyToken, hasPermission } = require("../../../src/middleware/auth");

// Mock dependencies
jest.mock("jsonwebtoken");
jest.mock("../../../src/models/User");

describe("Auth Middleware", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("verifyToken", () => {
    test("should return 401 if no Authorization header", () => {
      const req = { headers: {} };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      verifyToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
      expect(next).not.toHaveBeenCalled();
    });

    test("should return 401 if Authorization header does not start with Bearer", () => {
      const req = { headers: { authorization: "Token something" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      verifyToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
      expect(next).not.toHaveBeenCalled();
    });

    test("should verify token and attach user to request", () => {
      const req = { headers: { authorization: "Bearer validtoken" } };
      const res = {};
      const next = jest.fn();

      jwt.verify.mockReturnValue({ id: "user123" });
      verifyToken(req, res, next);

      expect(req.user).toEqual({ id: "user123" });
      expect(next).toHaveBeenCalled();
    });

    test("should return 403 for invalid token", () => {
      const req = { headers: { authorization: "Bearer invalidtoken" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      jwt.verify.mockImplementation(() => { throw new Error("Invalid token error"); });
      verifyToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: "Invalid or expired Access Token", error: "Invalid token error" });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("hasPermission", () => {
    test("should call next if user has required role", async () => {
      const req = { user: { id: "user123" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      // Simulate User.findById returning a role 'admin'
      User.findById.mockResolvedValue({ get: jest.fn().mockReturnValue("admin") });

      const middleware = hasPermission(["admin"]);
      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    test("should return 400 if role not found for user", async () => {
      const req = { user: { id: "user123" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      User.findById.mockResolvedValue({ get: jest.fn().mockReturnValue(undefined) });

      const middleware = hasPermission(["admin"]);
      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Role not found for user" });
      expect(next).not.toHaveBeenCalled();
    });

    test("should return 403 if user does not have required role", async () => {
      const req = { user: { id: "user123" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      // Simulate user's role is 'user' and required role is 'admin'
      User.findById.mockResolvedValue({ get: jest.fn().mockReturnValue("user") });

      const middleware = hasPermission(["admin"]);
      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: "Access denied" });
      expect(next).not.toHaveBeenCalled();
    });

    test("should return 500 if error occurs during role lookup", async () => {
      const req = { user: { id: "user123" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      User.findById.mockRejectedValue(new Error("DB error"));

      const middleware = hasPermission(["admin"]);
      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Failed to authorize user", message: "DB error" });
      expect(next).not.toHaveBeenCalled();
    });
  });
});
