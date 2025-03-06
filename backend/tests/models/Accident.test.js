const Accident = require("../../models/Accident");

describe("Accident Model", () => {
  test("should validate a valid accident instance", () => {
    const accidentData = {
      cameraId: "cam_1",
      location: "Highway 1",
      severity: "high",
      video: "http://example.com/video.mp4",
      description: "Test accident",
    };
    const accident = new Accident(accidentData);
    const error = accident.validateSync();
    expect(error).toBeUndefined();

    // Check default values from schema
    expect(accident.status).toBe("active");       // Default status is "active"
    expect(accident.falsePositive).toBe(false);   // Default falsePositive is false
    expect(accident.displayDate).toBeNull();      // Default displayDate is null
    expect(accident.displayTime).toBeNull();      // Default displayTime is null
    expect(accident.date).toBeInstanceOf(Date);     // date is set to current date by default
  });

  test("should default optional fields to null/false when not provided", () => {
    const accidentData = {
      cameraId: "cam_2",
      location: "Highway 2",
      severity: "medium",
    };
    const accident = new Accident(accidentData);
    const error = accident.validateSync();
    expect(error).toBeUndefined();

    // Optional string fields should be null by default
    expect(accident.video).toBeUndefined();      // schema default is undefined
    expect(accident.description).toBeNull();     // schema default is null
    expect(accident.displayDate).toBeNull();     // schema default is null
    expect(accident.displayTime).toBeNull();     // schema default is null
    expect(accident.assignedTo).toBeNull();      // assignedTo should be null by default
    expect(accident.falsePositive).toBe(false);  // falsePositive should default to false
  });

  test("should store a provided date when given", () => {
    const customDate = new Date("2023-03-06T12:00:00Z");
    const accidentData = {
      cameraId: "cam_3",
      location: "Highway 3",
      severity: "low",
      date: customDate,
    };
    const accident = new Accident(accidentData);
    const error = accident.validateSync();
    expect(error).toBeUndefined();
    expect(accident.date.getTime()).toBe(customDate.getTime());
  });

  test("should fail validation if cameraId is missing", () => {
    const accidentData = {
      location: "Highway 1",
      severity: "high",
    };
    const accident = new Accident(accidentData);
    const error = accident.validateSync();
    expect(error.errors["cameraId"]).toBeDefined();
  });

  test("should fail validation if location is missing", () => {
    const accidentData = {
      cameraId: "cam_1",
      severity: "high",
    };
    const accident = new Accident(accidentData);
    const error = accident.validateSync();
    expect(error.errors["location"]).toBeDefined();
  });

  test("should fail validation if severity is missing", () => {
    const accidentData = {
      cameraId: "cam_1",
      location: "Highway 1",
    };
    const accident = new Accident(accidentData);
    const error = accident.validateSync();
    expect(error.errors["severity"]).toBeDefined();
  });

  test("should fail validation if severity is not allowed", () => {
    const accidentData = {
      cameraId: "cam_1",
      location: "Highway 1",
      severity: "critical", // Not allowed; valid values are 'low', 'medium', 'high'
    };
    const accident = new Accident(accidentData);
    const error = accident.validateSync();
    expect(error.errors["severity"]).toBeDefined();
  });

  test("should fail validation if status is not allowed", () => {
    const accidentData = {
      cameraId: "cam_1",
      location: "Highway 1",
      severity: "high",
      status: "unknown", // Not allowed; valid values are 'active', 'assigned', 'handled'
    };
    const accident = new Accident(accidentData);
    const error = accident.validateSync();
    expect(error.errors["status"]).toBeDefined();
  });

  test("should allow explicitly provided optional fields", () => {
    const accidentData = {
      cameraId: "cam_4",
      location: "Highway 4",
      severity: "medium",
      video: "http://example.com/vid.mp4",
      description: "Accident description",
      assignedTo: "user123",
      status: "assigned",
      falsePositive: true,
      displayDate: "06/03/2023",
      displayTime: "12:00:00",
    };
    const accident = new Accident(accidentData);
    const error = accident.validateSync();
    expect(error).toBeUndefined();

    expect(accident.video).toBe("http://example.com/vid.mp4");
    expect(accident.description).toBe("Accident description");
    expect(accident.assignedTo).toBe("user123");
    expect(accident.status).toBe("assigned");
    expect(accident.falsePositive).toBe(true);
    expect(accident.displayDate).toBe("06/03/2023");
    expect(accident.displayTime).toBe("12:00:00");
  });
});
