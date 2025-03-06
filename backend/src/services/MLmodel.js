const { emitNewAccident } = require("./socketService");
const { saveNewAccident } = require("../controllers/accidents");

const startFakeAccidentSimulation = () => {
  console.log("Starting fake accident simulation...");
  
const oneDayInMs = 24 * 60 * 60 * 1000; // one day
const twoDaysInMs = 2 * oneDayInMs; // two days
const oneDayBefore = new Date(Date.now() - oneDayInMs);
const twoDaysBefore = new Date(Date.now() - twoDaysInMs);

  // Simulated real-time alert for accidents (replace this with ML model integration)
  setInterval(async () => {
    const fakeAccident = {
      // cameraId: `accident_${Math.floor(Math.random() * 1000)}`,
      cameraId: `accident_94`,
      location: "Highway 1",
      // date: twoDaysBefore.toISOString(),
      date: new Date().toISOString(),
      severity: "high",
      video: "fake-video-url",
    };

    try {
      // Save the fake accident using the saveNewAccident controller
      const savedAccident = await saveNewAccident(fakeAccident);

      // Emit the accident to clients
      console.log("Emitting new accident:", savedAccident.data);
      if (savedAccident.data)
        emitNewAccident(savedAccident.data);
      else
        throw new Error("Error saving fake accident");
    } catch (error) {
      console.error("Error during fake accident simulation:", error);
    }
  }, 3000); // Simulate every 3 seconds
};

module.exports = { startFakeAccidentSimulation };
