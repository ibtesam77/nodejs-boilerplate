const { initializeApp, cert } = require("firebase-admin/app");
const { getMessaging } = require("firebase-admin/messaging");
const firebaseServiceAccount = require("../config/firebase.json");

const app = initializeApp({
  credential: cert(firebaseServiceAccount),
  databaseURL: "https://malaebole-248119.firebaseio.com",
});

exports.messaging = getMessaging(app);
