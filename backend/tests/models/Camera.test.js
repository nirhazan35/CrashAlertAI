const mongoose = require("mongoose");
const Camera = require("../../models/Camera");

describe("Camera Model", () => {
  test("should validate a valid camera instance and set default date", () => {
    const cameraData = {
      cameraId: "cam_1",
      location: "Downtown",
    };

    const camera = new Camera(cameraData);
    const error = camera.validateSync();
    expect(error).toBeUndefined();

    // Check that the default date is set and is a Date
    expect(camera.date).toBeDefined();
    expect(camera.date).toBeInstanceOf(Date);
  });

  test("should default array fields to empty arrays if not provided", () => {
    const cameraData = {
      cameraId: "cam_1",
      location: "Downtown",
    };

    const camera = new Camera(cameraData);
    const error = camera.validateSync();
    expect(error).toBeUndefined();

    // Ensure that arrays default to an empty array.
    expect(camera.activeAccidents).toEqual([]);
    expect(camera.accidentHistory).toEqual([]);
    expect(camera.users).toEqual([]);
  });

  test("should fail validation if cameraId is missing", () => {
    const cameraData = {
      location: "Downtown",
    };
    const camera = new Camera(cameraData);
    const error = camera.validateSync();
    expect(error.errors["cameraId"]).toBeDefined();
  });

  test("should fail validation if location is missing", () => {
    const cameraData = {
      cameraId: "cam_1",
    };
    const camera = new Camera(cameraData);
    const error = camera.validateSync();
    expect(error.errors["location"]).toBeDefined();
  });

  test("should store provided activeAccidents, accidentHistory, and users as ObjectIds", () => {
    // Create valid ObjectIds using mongoose.Types.ObjectId
    const objId1 = new mongoose.Types.ObjectId();
    const objId2 = new mongoose.Types.ObjectId();
    
    const cameraData = {
      cameraId: "cam_2",
      location: "Uptown",
      activeAccidents: [objId1, objId2],
      accidentHistory: [objId1],
      users: [objId1, objId2],
    };
    const camera = new Camera(cameraData);
    const error = camera.validateSync();
    expect(error).toBeUndefined();

    expect(camera.activeAccidents).toEqual([objId1, objId2]);
    expect(camera.accidentHistory).toEqual([objId1]);
    expect(camera.users).toEqual([objId1, objId2]);
  });

  test("should cast valid string IDs to ObjectIds for array fields", () => {
    // Create valid ObjectId strings (24 hex characters)
    const idStr1 = new mongoose.Types.ObjectId().toHexString();
    const idStr2 = new mongoose.Types.ObjectId().toHexString();

    const cameraData = {
      cameraId: "cam_3",
      location: "Midtown",
      activeAccidents: [idStr1],
      accidentHistory: [idStr2],
      users: [idStr1, idStr2],
    };
    const camera = new Camera(cameraData);
    const error = camera.validateSync();
    expect(error).toBeUndefined();

    // After casting, these should be ObjectId instances with the same value as the original strings.
    expect(camera.activeAccidents[0].toString()).toBe(idStr1);
    expect(camera.accidentHistory[0].toString()).toBe(idStr2);
    expect(camera.users[0].toString()).toBe(idStr1);
    expect(camera.users[1].toString()).toBe(idStr2);
  });

  test("should fail validation if an invalid ObjectId string is provided in array fields", () => {
    // Provide an invalid ObjectId string (e.g., too short)
    const invalidId = "12345";
    const cameraData = {
      cameraId: "cam_4",
      location: "Suburb",
      activeAccidents: [invalidId],
    };
    const camera = new Camera(cameraData);
    const error = camera.validateSync();
    expect(error.errors["activeAccidents.0"]).toBeDefined();
  });
});
