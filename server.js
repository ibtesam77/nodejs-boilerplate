require("dotenv").config();
const express = require("express");
const cors = require("cors");

const initializeSocket = require("./socket");
const apiRouter = require("./routes");

const PORT = process.env.PORT || 5000;
const app = express();

// Register Socket Server
const server = initializeSocket(app);

// Cross Origin
app.use(cors({ origin: "*" }));

// For parsing application/json
app.use(express.json());

// For parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// Prisma client
require("./lib/primsa");

// For public access
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));
app.use("/media", express.static("media"));

// Routes
app.use("/api", apiRouter);

// Application Setup
server.listen(PORT, () => {
  console.log("🎉 Server listening on port:", PORT);
});
