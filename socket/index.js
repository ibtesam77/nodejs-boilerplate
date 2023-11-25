const http = require("http");
const { Server } = require("socket.io");
const redisClient = require("../lib/redis");
const { REDIS, SOCKETIO, NAMESPACES } = require("../utilities/constants");

module.exports = (app) => {
  const httpServer = http.createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"], credentials: true },
    allowEIO3: true,
    transports: ["websocket", "polling"],
  });

  // ======================================== Namespaces ========================================
  const lineupNameSpace = io.of("/lineup");
  require("./lineup")(lineupNameSpace);

  // Set IO in express app
  app.set(SOCKETIO, io);

  // Set Redis Server
  app.set(REDIS, redisClient);

  // Set namespaces in express app
  app.set(NAMESPACES.LINEUP, lineupNameSpace);

  return httpServer;
};
