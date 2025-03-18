const { emitNewAccident } = require("./socketService");
const { saveNewAccident } = require("../controllers/accidents");

const startFakeAccidentSimulation = () => {
  console.log("Starting fake accident simulation...");

  // Simulated real-time alert for accidents (replace this with ML model integration)
  setInterval(async () => {
    const fakeAccident = {
      cameraId: `accident_94`,
      location: "Highway 1",
      date: new Date().toISOString(),
      severity: "high",
      video: "https://drive.google.com/file/d/1PrdFv0D57EKBeGtslIJjlQGJGjQszRfE/view",
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

    try {
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
