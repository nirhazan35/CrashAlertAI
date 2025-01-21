const ws = new WebSocket("ws://localhost:3001");

const onOpen = () => console.log("Connected to WebSocket server");
const onClose = () => console.log("Disconnected from WebSocket server");
const onError = (error) => console.error("WebSocket error:", error);

ws.onopen = onOpen;
ws.onclose = onClose;
ws.onerror = onError;

export const subscribeToAccidents = (callback) => {
  console.log("Subscribing to accidents frontend");
  ws.onmessage = (event) => {
    const accidentData = JSON.parse(event.data);
    callback(accidentData);
  };
};

export default ws;
