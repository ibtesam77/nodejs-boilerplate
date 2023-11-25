const router = require("express").Router();
const lineUpRouter = require("./lineup");

router.use("/lineup", lineUpRouter);

module.exports = router;
