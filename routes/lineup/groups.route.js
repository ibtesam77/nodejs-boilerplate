const CustomRouter = require("../../lib/router");
const {
  getMyLineupGroups,
  getLineupGroupDetails,
  getLineupGroupMessages,
} = require("../../controllers/player/group.controller");

const router = new CustomRouter().router;

router.get("/", getMyLineupGroups);
router.get("/:GROUP_ID", getLineupGroupDetails);
router.get("/:GROUP_ID/messages", getLineupGroupMessages);

module.exports = router;
