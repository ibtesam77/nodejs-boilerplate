const redisClient = require("../../lib/redis");
const { REDIS_LINEUP_MODULE } = require("../../utilities/constants");

// Save online user in redis
exports.addUserToRedis = async (user_id, data) =>
  await redisClient.hSet(`${REDIS_LINEUP_MODULE.USER}:${user_id}`, data);

// Get online user in redis
exports.getUserFromRedis = async (user_id) =>
  await redisClient.hGetAll(`${REDIS_LINEUP_MODULE.USER}:${user_id}`);

// Remove online user from redis
exports.removeUserFromRedis = async (user_id) =>
  await redisClient.del(`${REDIS_LINEUP_MODULE.USER}:${user_id}`);
