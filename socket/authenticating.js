const jwt = require("jsonwebtoken");
let connectedUsers = {};

const authSocketMiddleware = async (socket, next) => {
  const token = socket.handshake.auth?.token;
  try {
    if (!token) {
      return connectedUsers;
    }
    const tokenString = token?.split(" ")[1];
    const validToken = await jwt.verify(tokenString, process.env.PRIVATEKEY);
    if (validToken) {
      connectedUsers[validToken.user[validToken.authority[0] + "_username"]] = {
        socketId: socket.id,
        username: validToken.user[validToken.authority[0] + "_username"],
        userType: validToken.authority[0],
        id: validToken.user[validToken.authority[0] + "_id"],
      };
      return connectedUsers;
    } else {
      return connectedUsers;
    }
  } catch (error) {
    return false;
  }
};

module.exports = { authSocketMiddleware, connectedUsers };
