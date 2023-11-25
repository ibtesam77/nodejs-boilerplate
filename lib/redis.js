const { createClient } = require("redis");

const redisClient = createClient({ url: process.env.REDIS_SERVER_URL });

(async () => {
  redisClient
    .on("ready", () => console.log("🏬 Redis server is ready to use!!!"))
    .on("error", (error) =>
      console.error(
        "😐 Something went wrong in connecting to redis server",
        error
      )
    );

  await redisClient.connect();
})();

module.exports = redisClient;
