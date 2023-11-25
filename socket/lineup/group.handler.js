const prisma = require("../../lib/primsa");
const {
  getOrCreateGroupWithFriends,
  createGroupMessage,
} = require("../../helpers/lineup/group.helper");
const { validateData } = require("../../utilities/helpers");

module.exports = (namespace) => {
  const onGroupJoin = async function (payload) {
    const socket = this;

    try {
      // Validating Payload
      await validateData(payload, {
        group_owner_id: "numeric|required",
      });
      const { group_owner_id } = payload;

      const targetGroupDetails = await getOrCreateGroupWithFriends(
        group_owner_id
      );

      // Join user to group chatroom
      socket.join(`group:${targetGroupDetails.id}`);

      // Send User Target Group Details
      socket.emit("group:details", targetGroupDetails);
    } catch (error) {
      socket.emit("error", { error, message: error?.message });
    }
  };

  const onSendGroupMessage = async function (payload) {
    const socket = this;

    try {
      // Validating Payload
      await validateData(payload, {
        group_id: "numeric|required",
        message: "object|required",
        "message.text": "string",
        "message.replied_to": "numeric",
        "message.attachments": "array",
        "message.attachments.*.path": "string|required",
      });
      const { group_id, message } = payload;

      const memberDetails = await prisma.lp_group_members.findFirst({
        where: { group_id: +group_id, member_friend_id: socket.user.id },
      });

      if (!memberDetails) throw new Error("You are not member of this group");

      // Create Group Message
      const groupMessage = await createGroupMessage(
        group_id,
        memberDetails.id,
        message
      );

      // Send message to all game room members
      namespace.in(`group:${group_id}`).emit("group:message", groupMessage);
    } catch (error) {
      socket.emit("error", { error, message: error?.message });
    }
  };

  return {
    onGroupJoin,
    onSendGroupMessage,
  };
};
