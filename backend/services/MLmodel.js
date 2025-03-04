const { emitNewAccident } = require("./socketService");
const { saveNewAccident } = require("../controllers/accidents");

const startFakeAccidentSimulation = () => {
  console.log("Starting fake accident simulation...");
  
  // Simulated real-time alert for accidents (replace this with ML model integration)
  setInterval(async () => {
    const fakeAccident = {
      cameraId: `accident_${Math.floor(Math.random() * 1000)}`,
      location: "Israel",
      date: new Date().toISOString(),
      severity: "low",
      video: "fake-video-url",
    };

    try {
      // Save the fake accident using the saveNewAccident controller
      const savedAccident = await saveNewAccident(fakeAccident);

      // Emit the accident to clients
    emitNewAccident(savedAccident);
    } catch (error) {
      console.error("Error during fake accident simulation:", error);
    }
  }, 3000); // Simulate every 3 seconds
};

module.exports = { startFakeAccidentSimulation };
