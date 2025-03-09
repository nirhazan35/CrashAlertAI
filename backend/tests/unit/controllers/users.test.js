const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../../src/models/User");
const { sendEmail } = require("../../../src/services/emailService");

// Controllers to test
const {
  getAllUsers,
  getRole,
  deleteUser,
  changePassword,
  requestPasswordChange,
  notifyPasswordChange,
  getAssignedCameras,
} = require("../../../src/controllers/users");

// Mock dependencies
jest.mock("../../../src/models/User");
jest.mock("../../../src/services/emailService");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");

describe("Users Controller", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllUsers", () => {
    test("should return all users without refreshToken", async () => {
      const req = {};
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      // Simulate users returned by DB; each user has a toObject method.
      const mockUsers = [
        { toObject: () => ({ _id: "u1", username: "user1", refreshToken: "token1" }) },
        { toObject: () => ({ _id: "u2", username: "user2", refreshToken: "token2" }) },
      ];
      User.find.mockResolvedValue(mockUsers);

      await getAllUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([
        { _id: "u1", username: "user1" },
        { _id: "u2", username: "user2" },
      ]);
    });

    test("should return 400 if no users found", async () => {
      const req = {};
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      User.find.mockResolvedValue(null);

      await getAllUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "No users found" });
    });

    test("should handle errors in getAllUsers", async () => {
      const req = {};
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      User.find.mockRejectedValue(new Error("DB error"));

      await getAllUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to get users",
        message: "DB error",
      });
    });
  });

  describe("getRole", () => {
    test("should return the role of the user", async () => {
      const req = { user: { id: "u1" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      User.findById.mockResolvedValue({ get: jest.fn().mockReturnValue("admin") });

      await getRole(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ role: "admin" });
    });

    test("should return 400 if role not found", async () => {
      const req = { user: { id: "u1" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      User.findById.mockResolvedValue({ get: jest.fn().mockReturnValue(undefined) });

      await getRole(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Role not found for user" });
    });

    test("should handle errors in getRole", async () => {
      const req = { user: { id: "u1" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      User.findById.mockRejectedValue(new Error("DB error"));

      await getRole(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to get user role",
        message: "DB error",
      });
    });
  });


  describe("deleteUser", () => {
    test("should delete the user successfully", async () => {
      const req = { user: { id: "u1" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      User.findByIdAndDelete.mockResolvedValue({ _id: "u1", username: "user1" });

      await deleteUser(req, res);
      expect(User.findByIdAndDelete).toHaveBeenCalledWith("u1");
    });

    test("should return 500 if error occurs during deletion", async () => {
      const req = { user: { id: "u1" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      User.findByIdAndDelete.mockRejectedValue(new Error("Delete error"));

      await deleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to delete user",
        message: "Delete error",
      });
    });
  });

  describe("changePassword", () => {
    test("should update password successfully", async () => {
      const req = { body: { token: "validtoken", newPassword: "newpass" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      const mockUser = { 
        id: "u1", 
        password: "oldhash", 
        save: jest.fn().mockResolvedValue() 
      };

      jwt.verify.mockReturnValue({ id: "u1" });
      User.findById.mockResolvedValue(mockUser);
      bcrypt.genSalt.mockResolvedValue("salt");
      bcrypt.hash.mockResolvedValue("newhash");

      await changePassword(req, res);

      expect(bcrypt.hash).toHaveBeenCalledWith("newpass", "salt");
      expect(mockUser.password).toBe("newhash");
      expect(mockUser.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Password updated successfully" });
    });

    test("should return 404 if user not found during changePassword", async () => {
      const req = { body: { token: "validtoken", newPassword: "newpass" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      jwt.verify.mockReturnValue({ id: "u1" });
      User.findById.mockResolvedValue(null);

      await changePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "User not found" });
    });

    test("should handle errors in changePassword", async () => {
      const req = { body: { token: "validtoken", newPassword: "newpass" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      jwt.verify.mockImplementation(() => { throw new Error("Token error"); });

      await changePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to update password",
        message: "Token error",
      });
    });
  });


  describe("requestPasswordChange", () => {
    test("should send password reset request successfully", async () => {
      const req = { body: { username: "user1", email: "user1@example.com" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      const mockUser = { id: "u1", email: "user1@example.com", superior: "admin1" };
      const mockAdmin = { username: "admin1", email: "admin@example.com" };

      User.findOne
        .mockResolvedValueOnce(mockUser) // for finding user by username
        .mockResolvedValueOnce(mockAdmin); // for finding admin user

      jwt.sign.mockReturnValue("resettoken");

      await requestPasswordChange(req, res);

      expect(sendEmail).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Password reset request sent successfully" });
    });

    test("should return 404 if user not found", async () => {
      const req = { body: { username: "nonexistent", email: "user@example.com" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      User.findOne.mockResolvedValue(null);

      await requestPasswordChange(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
    });

    test("should return 400 if email does not match", async () => {
      const req = { body: { username: "user1", email: "wrong@example.com" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      const mockUser = { id: "u1", email: "user1@example.com", superior: "admin1" };
      User.findOne.mockResolvedValue(mockUser);

      await requestPasswordChange(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Invalid email" });
    });

    test("should return 404 if admin user not found", async () => {
      const req = { body: { username: "user1", email: "user1@example.com" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      const mockUser = { id: "u1", email: "user1@example.com", superior: "admin1" };
      User.findOne
        .mockResolvedValueOnce(mockUser) // found user
        .mockResolvedValueOnce(null); // admin user not found

      await requestPasswordChange(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Admin user not found" });
    });

    test("should handle errors in requestPasswordChange", async () => {
      const req = { body: { username: "user1", email: "user1@example.com" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      User.findOne.mockRejectedValue(new Error("DB error"));

      await requestPasswordChange(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Failed to send password reset request",
        error: "DB error",
      });
    });
  });

  describe("notifyPasswordChange", () => {
    test("should send password change notification successfully", async () => {
      const req = { body: { token: "validtoken", newPassword: "newpass" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      const mockUser = { id: "u1", email: "user1@example.com" };
      jwt.verify.mockReturnValue({ id: "u1" });
      User.findById.mockResolvedValue(mockUser);
      sendEmail.mockResolvedValue();

      await notifyPasswordChange(req, res);
      expect(sendEmail).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Password change notification sent successfully" });
    });

    test("should return 404 if user not found in notifyPasswordChange", async () => {
      const req = { body: { token: "validtoken", newPassword: "newpass" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      jwt.verify.mockReturnValue({ id: "u1" });
      User.findById.mockResolvedValue(null);

      await notifyPasswordChange(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "User not found" });
    });

    test("should handle errors in notifyPasswordChange", async () => {
      const req = { body: { token: "validtoken", newPassword: "newpass" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      jwt.verify.mockImplementation(() => { throw new Error("Token error"); });

      await notifyPasswordChange(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Failed to send password change notification",
        error: "Token error",
      });
    });
  });

  describe("getAssignedCameras", () => {
    test("should return assigned cameras for a user", async () => {
      const req = { body: { userId: "u1" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      const mockUser = { assignedCameras: ["cam1", "cam2"] };
      // Mock the chaining of populate
      User.findById.mockImplementation(() => ({
        populate: jest.fn().mockResolvedValue(mockUser),
      }));

      await getAssignedCameras(req, res);

      expect(User.findById).toHaveBeenCalledWith("u1");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ assignedCameras: ["cam1", "cam2"] });
    });

    test("should return 404 if user not found in getAssignedCameras", async () => {
      const req = { body: { userId: "u1" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      User.findById.mockImplementation(() => ({
        populate: jest.fn().mockResolvedValue(null),
      }));

      await getAssignedCameras(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
    });

    test("should handle errors in getAssignedCameras", async () => {
      const req = { body: { userId: "u1" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      User.findById.mockImplementation(() => ({
        populate: jest.fn().mockRejectedValue(new Error("DB error")),
      }));

      await getAssignedCameras(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Failed to get assigned cameras",
        error: "DB error",
      });
    });
  });
});
