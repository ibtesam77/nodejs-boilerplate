const {
  addUserToRedis,
  removeUserFromRedis,
} = require("../../helpers/redis/user.helper");
const { authenticateUser } = require("../middlewares.socket");

module.exports = (namespace) => {
  // Group Handlers
  const { onGroupJoin, onSendGroupMessage } =
    require("./group.handler")(namespace);

  namespace.use(authenticateUser).on("connection", async (socket) => {
    // Adding user in Redis Online users
    await addUserToRedis(socket.user.id, {
      socket_id: socket.id,
    });

    // Group Events
    socket.on("group:join", onGroupJoin);
    socket.on("group:message", onSendGroupMessage);

    socket.on("disconnect", async (reason) => {
      // Removing user from Redis Online users
      await removeUserFromRedis(socket.user.id);

      console.log(`Player disconnected ${socket.id} due to ${reason}`);
    });
  });
};
