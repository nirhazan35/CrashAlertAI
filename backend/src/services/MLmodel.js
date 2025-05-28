const { emitNewAccident } = require("./socketService");
const { saveNewAccident } = require("../controllers/accidents");
const Camera = require("../models/Camera");
const User = require("../models/User");

const startFakeAccidentSimulation = async (initialStatus) => {
  console.log("Starting fake accident simulation...");
  // Fetch all cameras from the database
  const cameras = await Camera.find({});

  // Fetch all users from the database
  const users = await User.find({});

  // Validate inputs
  if (!cameras || !Array.isArray(cameras) || cameras.length === 0) {
    throw new Error("No cameras found in the database");
  }

  if (!users || !Array.isArray(users) || users.length === 0) {
    throw new Error("No users found in the database");
  }

  // Validate status
  const validStatuses = ['active', 'assigned', 'handled'];
  if (!validStatuses.includes(initialStatus)) {
    throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  }

  // Severity options
  // const severityOptions = ['high', 'medium', 'low', 'null'];
  const severityOptions = ['no severity'];

  // Function to generate a random date within a specific range
  const getRandomDate = (start, end) => {
    const startTime = start.getTime();
    const endTime = end.getTime();
    const randomTime = startTime + Math.random() * (endTime - startTime);
    return new Date(randomTime);
  };
  // Start the simulation interval
  setInterval(async () => {
    try {
      // Randomly select a camera
      const selectedCamera = cameras[Math.floor(Math.random() * cameras.length)];
      // Generate a random date within the last year
      const endDate = new Date();
      const startDate = new Date();
      startDate.setFullYear(endDate.getFullYear() - 1);
      const randomDate = getRandomDate(startDate, endDate);


      // Randomly select severity
      const randomSeverity = severityOptions[Math.floor(Math.random() * severityOptions.length)];

      // Randomly select whether it's a false positive
      const randomFalsePositive = Math.random() < 0.5; // 50% chance

      // Always assign to a random user
      const assignedTo = users[Math.floor(Math.random() * users.length)].username;
      // Create fake accident object
      const fakeAccident = {
        cameraId: selectedCamera.cameraId,
        location: selectedCamera.location,
        // date: randomDate.toISOString(),
        date: new Date(),
        severity: randomSeverity,
        video: "",
        falsePositive: randomFalsePositive,
        assignedTo: assignedTo,
        status: initialStatus
      };
      // Create a fake req object with the accident data as req.body
      const fakeReq = { body: fakeAccident };

      // Create a minimal fake res object with chained status and json methods
      const fakeRes = {
        status(code) {
          this.statusCode = code;
          return this;
        },
        json(data) {
          return data;
        },
      };

      // Pass the fake request and response objects to the saveNewAccident controller
      const savedAccident = await saveNewAccident(fakeReq, fakeRes);
      if (savedAccident.success) {
        emitNewAccident(savedAccident.data);
      } else {
        throw new Error("Error saving fake accident: " + savedAccident.message);
      }
    } catch (error) {
      console.error("Error during fake accident simulation:", error);
    }
  }, 3000); // Simulate every 3 seconds
};

module.exports = { startFakeAccidentSimulation };
