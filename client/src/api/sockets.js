import { io } from "socket.io-client";

const SOCKET_PORT = 3000;
const socket = io(`http://localhost:${SOCKET_PORT}`, { transports: ["websocket"] });


export default socket;