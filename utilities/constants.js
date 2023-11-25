//BASE URL for TEST SERVER
const BASE_URL = "https://api.test.com";

// Media URL
const MEDIA_URL = `${BASE_URL}/uploads`;

// Redis Client
const REDIS = "REDIS_CLIENT";

// Socket IO and Namespaces
const SOCKETIO = "SOCKETIO";
const NAMESPACES = {
  LINEUP: "NAMESPACES:LINEUP",
};

// Notification Types
const NOTIFICATION_TYPE = {
  LINEUP_GAME_ADDED: "lineupGameAdded",
  NEW_CAPTAIN: "newCaptain",
  GAME_SCORE_ADDED: "gameScoreAdded",
};

module.exports = {
  BASE_URL,
  MEDIA_URL,
  REDIS,
  SOCKETIO,
  NAMESPACES,
  NOTIFICATION_TYPE,
};
