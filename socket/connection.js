const socketIO = require("socket.io");
const { authSocketMiddleware, connectedUsers } = require("./authenticating");
let io;
const SocketConnection = (server) => {
  io = socketIO(server, {
    cors: {
      origin: ["http://localhost:3000", "http://localhost:3001"],
      methods: ["GET", "POST", "DELETE", "PUT"],
      credentials: true,
    },
  });
  io.on("connection", async (socket) => {
    if (authSocketMiddleware(socket)) {
      socket.send("Socket IO connection success");
      console.log(connectedUsers);
    } else {
      socket.send("Socket IO connection failed");
    }

    socket.on("disconnect", () => {
      const disconnectedUser = Object.entries(connectedUsers).find(
        ([username, user]) => username === user.username
      );
      if (disconnectedUser) {
        const [username] = disconnectedUser;
        delete connectedUsers[username];
      }
    });
  });
  return io;
};

module.exports = { SocketConnection, getIO: () => io };
