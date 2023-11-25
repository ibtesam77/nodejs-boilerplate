const CustomRouter = require("../../lib/router");
const groupRouter = require("./groups.route");
const authenticateAuthToken = require("../../middlewares/auth/authenticateAuthToken.middleware");

const router = new CustomRouter().router;

// Group routes
router.use("/groups", authenticateAuthToken, groupRouter);

module.exports = router;
