const {
  getGroups,
  getGroupDetails,
  getGroupMessages,
} = require("../../helpers/lineup/group.helper");
const { validateData } = require("../../utilities/helpers");

exports.getMyLineupGroups = async (req, res) => {
  try {
    const groupDetails = await getGroups(req.user.id);
    return res.success({ data: groupDetails });
  } catch (error) {
    return res.error({
      error,
      message:
        error?.message || "Something went wrong in fetching group details",
    });
  }
};

exports.getLineupGroupDetails = async (req, res) => {
  try {
    const { GROUP_ID } = req.params;

    const groupDetails = await getGroupDetails(GROUP_ID);
    return res.success({ data: groupDetails });
  } catch (error) {
    return res.error({
      error,
      message:
        error?.message || "Something went wrong in fetching group details",
    });
  }
};

exports.getLineupGroupMessages = async (req, res) => {
  try {
    const { GROUP_ID } = req.params;

    await validateData(req.query, {
      limit: "numeric",
      offset: "numeric",
    });

    const { limit = 20, offset = 0 } = req.query;

    const params = {
      skip: +offset,
      take: +limit,
    };

    const groupMessages = await getGroupMessages(GROUP_ID, params);

    return res.success({ data: groupMessages });
  } catch (error) {
    return res.error({
      error,
      message:
        error?.message || "Something went wrong in fetching group details",
    });
  }
};
