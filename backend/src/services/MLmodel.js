const { emitNewAccident } = require("./socketService");
const { saveNewAccident } = require("../controllers/accidents");
const Camera = require("../models/Camera");


const startFakeAccidentSimulation = async () => {
  console.log("Starting fake accident simulation...");

  // Fetch all cameras from the database
  const cameras = await Camera.find({});

  // Validate cameras input
  if (!cameras || !Array.isArray(cameras) || cameras.length === 0) {
    throw new Error("Invalid cameras array provided");
  }

  // Severity options
  const severityOptions = ['high', 'medium', 'low'];

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

      // Create fake accident object
      const fakeAccident = {
        cameraId: selectedCamera.cameraId,
        location: selectedCamera.location,
        date: randomDate.toISOString(),
        severity: randomSeverity,
        video: "" // You can modify this if needed
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
        console.log("Mocked new accident");
      } else {
        throw new Error("Error saving fake accident: " + savedAccident.message);
      }
    } catch (error) {
      console.error("Error during fake accident simulation:", error);
    }
  }, 3000); // Simulate every 3 seconds
};

module.exports = { startFakeAccidentSimulation };
