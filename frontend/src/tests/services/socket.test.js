import { connectSocket } from "../../services/socket";
import { io } from "socket.io-client";

jest.mock("socket.io-client", () => ({
  io: jest.fn(),
}));

describe("Socket Service", () => {
  test("connects to socket with token", () => {
    connectSocket("test-token");

    expect(io).toHaveBeenCalledWith(process.env.REACT_APP_URL_BACKEND, {
      auth: { token: "test-token" },
    });
  });
});
