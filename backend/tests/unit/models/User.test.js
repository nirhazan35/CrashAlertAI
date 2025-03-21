const mongoose = require("mongoose");
const User = require("../../../src/models/User");

describe("User Model", () => {
  // Clean up the User collection after each test (using the in-memory DB from setup.js)
  afterEach(async () => {
    await User.deleteMany({});
  });

  test("should validate a valid user instance and set defaults", () => {
    const userData = {
      username: "user1",
      email: "user1@example.com",
      password: "secret",
    };
    const user = new User(userData);
    const error = user.validateSync();
    expect(error).toBeUndefined();

    // Check default values
    expect(user.role).toBe("user"); // default role is "user"
    expect(user.createdAt).toBeInstanceOf(Date);
    expect(user.superior).toBeNull();
    expect(user.refreshToken).toBeUndefined();
    expect(user.assignedCameras).toEqual([]); // defaults to empty array
  });

  test("should fail validation if username is missing", () => {
    const userData = {
      email: "user1@example.com",
      password: "secret",
    };
    const user = new User(userData);
    const error = user.validateSync();
    expect(error.errors["username"]).toBeDefined();
  });

  test("should fail validation if email is missing", () => {
    const userData = {
      username: "user1",
      password: "secret",
    };
    const user = new User(userData);
    const error = user.validateSync();
    expect(error.errors["email"]).toBeDefined();
  });

  test("should fail validation if password is missing", () => {
    const userData = {
      username: "user1",
      email: "user1@example.com",
    };
    const user = new User(userData);
    const error = user.validateSync();
    expect(error.errors["password"]).toBeDefined();
  });

  test("should fail validation if role is not allowed", () => {
    const userData = {
      username: "user1",
      email: "user1@example.com",
      password: "secret",
      role: "superuser", // invalid role
    };
    const user = new User(userData);
    const error = user.validateSync();
    expect(error.errors["role"]).toBeDefined();
  });

  test("should store assignedCameras as provided", () => {
    const userData = {
      username: "user1",
      email: "user1@example.com",
      password: "secret",
      assignedCameras: ["cam1", "cam2"],
    };
    const user = new User(userData);
    const error = user.validateSync();
    expect(error).toBeUndefined();
    expect(user.assignedCameras).toEqual(["cam1", "cam2"]);
  });

  test("should not allow duplicate usernames", async () => {
    // Create indexes to enforce uniqueness
    await User.createIndexes();

    const userData1 = {
      username: "user1",
      email: "user1@example.com",
      password: "secret",
    };
    const user1 = new User(userData1);
    await user1.save();

    const userData2 = {
      username: "user1", // duplicate username
      email: "user2@example.com",
      password: "secret",
    };
    const user2 = new User(userData2);
    await expect(user2.save()).rejects.toThrow(/E11000/); // duplicate key error generated by MongoDB
  });

  test("should not allow duplicate emails", async () => {
    // Create indexes to enforce uniqueness
    await User.createIndexes();

    const userData1 = {
      username: "user1",
      email: "user1@example.com",
      password: "secret",
    };
    const user1 = new User(userData1);
    await user1.save();

    const userData2 = {
      username: "user2",
      email: "user1@example.com", // duplicate email
      password: "secret",
    };
    const user2 = new User(userData2);
    await expect(user2.save()).rejects.toThrow(/E11000/); // duplicate key error generated by MongoDB
  });

  test("should store a user with a superior set to another user's username", async () => {
    // Create a superior user first
    const superiorData = {
      username: "superiorUser",
      email: "superior@example.com",
      password: "secret",
      role: "admin",
    };
    const superior = new User(superiorData);
    await superior.save();

    // Create a subordinate with superior set to the superior's username
    const subordinateData = {
      username: "subordinateUser",
      email: "subordinate@example.com",
      password: "secret",
      superior: superior.username,
    };
    const subordinate = new User(subordinateData);
    const savedSubordinate = await subordinate.save();

    expect(savedSubordinate.superior).toBe("superiorUser");
  });
});
