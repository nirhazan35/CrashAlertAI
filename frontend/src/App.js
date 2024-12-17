import { useEffect, useState } from "react";
import axios from "axios";
const url = "http://localhost:3001"

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios.get(`${url}`)
      .then((res) => setMessage(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h1>{message || "Loading..."}</h1>
    </div>
  );
}

export default App;
