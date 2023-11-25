const prisma = require("../../lib/primsa");
const { validateData } = require("../../utilities/helpers");
const { getUserFromRedis } = require("../redis/user.helper");
const { MEDIA_URL } = require("../../utilities/constants");

exports.formatGroupMember = (member) => {
  return new Promise(async (resolve) => {
    const memberRedisDetails = await getUserFromRedis(member.details.uuid);
    const isMemberOnline = Boolean(memberRedisDetails?.socket_id);

    resolve({
      ...member,
      name: member.details.name,
      is_manual: member.details.is_linked.toString(),
      is_online: isMemberOnline ? "1" : "0",
      photo: member.details.photo
        ? `${MEDIA_URL}/users/${member.details.photo}`
        : "",
      bib_attachment: `${MEDIA_URL}/lineup/teams/${member.details.bib_attachment.photo_url}`,
      details: undefined,
    });
  });
};

exports.formatGroup = async (groupDetails) => {
  const groupMembers = await Promise.all(
    groupDetails.members.map(this.formatGroupMember)
  );

  return {
    ...groupDetails,
    members: groupMembers,
  };
};

exports.formatMessageAttachments = async (attachments = []) => {
  return attachments.map((attachment) => ({
    ...attachment,
    path: `${MEDIA_URL}/${attachment.path}`,
  }));
};

exports.formatGroupMessage = (message) => {
  return new Promise(async (resolve) => {
    const formattedGroupMember = await this.formatGroupMember(message.member);

    const formattedMessageAttachments = await this.formatMessageAttachments(
      message.attachments
    );

    resolve({
      ...message,
      attachments: formattedMessageAttachments,
      sender: formattedGroupMember,
      member: undefined,
    });
  });
};

exports.getGroups = async (ownerID) => {
  try {
    // Fetch group along with group members
    const targetUserGroups = await prisma.lp_groups.findMany({
      where: {
        owner_id: +ownerID,
      },
      select: {
        id: true,
        group_name: true,
        members: {
          select: {
            id: true,
            details: {
              select: {
                uuid: true,
                name: true,
                photo: true,
                is_linked: true,
                bib_attachment: { select: { photo_url: true } },
              },
            },
          },
        },
      },
    });

    // Format Group Details
    const modifiedGroups = await Promise.all(
      targetUserGroups.map(this.formatGroup)
    );

    return modifiedGroups;
  } catch (error) {
    throw error;
  }
};

exports.getGroupDetails = async (groupID) => {
  try {
    // Fetch group along with group members
    const targetGroupDetails = await prisma.lp_groups.findFirstOrThrow({
      where: {
        id: +groupID,
      },
      select: {
        id: true,
        group_name: true,
        members: {
          select: {
            id: true,
            details: {
              select: {
                uuid: true,
                name: true,
                photo: true,
                is_linked: true,
                bib_attachment: { select: { photo_url: true } },
              },
            },
          },
        },
      },
    });

    // Format Group Details
    const modifiedTargetGroupDetails = await this.formatGroup(
      targetGroupDetails
    );

    return modifiedTargetGroupDetails;
  } catch (error) {
    throw error;
  }
};

exports.createGroup = async (payload) => {
  try {
    await validateData(payload, {
      group_name: "string|required",
      owner_id: "numeric|required",
      members: "array|required",
      "members.*.friend_id": "numeric|required",
      "members.*.friendship_id": "numeric|required",
    });

    const { group_name, owner_id, members } = payload;

    // Create group along with group members
    const targetGroupDetails = await prisma.lp_groups.create({
      data: {
        group_name,
        owner_id,
        members: {
          createMany: {
            data: members.map((member) => ({
              member_friend_id: +member.friend_id,
              member_friendship_id: +member.friendship_id,
            })),
          },
        },
      },
      select: {
        id: true,
        group_name: true,
        members: {
          select: {
            id: true,
            details: {
              select: {
                uuid: true,
                name: true,
                photo: true,
                is_linked: true,
                bib_attachment: { select: { photo_url: true } },
              },
            },
          },
        },
      },
    });

    // Format Group Details
    const modifiedTargetGroupDetails = await this.formatGroup(
      targetGroupDetails
    );

    return modifiedTargetGroupDetails;
  } catch (error) {
    throw error;
  }
};

exports.createGroupWithFriends = async (ownerID) => {
  try {
    // Fetch Owner Details
    const ownerDetails = await prisma.oleh_users.findFirstOrThrow({
      where: { id: +ownerID },
      select: { name: true },
    });

    // Fetch Target Owner Friends
    const targetOwnerFriends = await prisma.friends_list.findMany({
      where: { user_id: +ownerID },
      select: { id: true, uuid: true },
    });

    // Create New Group With His Friends
    const createdGroupDetails = await this.createGroup({
      group_name: `${ownerDetails.name || "User"}'s Group`, // User "name" or (User's Group)
      owner_id: +ownerID,
      members: targetOwnerFriends.map((friend) => ({
        friend_id: friend.uuid,
        friendship_id: friend.id,
      })),
    });

    return createdGroupDetails;
  } catch (error) {
    throw error;
  }
};

exports.getOrCreateGroupWithFriends = async (ownerID) => {
  try {
    let groupDetails = null;

    try {
      // Fetch Target Owner First Group
      const targetGroup = await prisma.lp_groups.findFirstOrThrow({
        where: { owner_id: +ownerID },
        select: { id: true },
      });
      groupDetails = this.getGroupDetails(targetGroup.id);
    } catch (error) {
      // Create Owner Group With His Friends
      groupDetails = this.createGroupWithFriends(ownerID);
    }

    return groupDetails;
  } catch (error) {
    throw error;
  }
};

exports.createGroupMessage = async (groupID, membershipID, message) => {
  try {
    const createdMessage = await prisma.lp_group_chat_messages.create({
      data: {
        group_id: +groupID,
        membership_id: +membershipID,
        text: message.text || "",
        parent_message_id: message.replied_to || null,
        attachments: {
          createMany: {
            data: (message.attachments || []).map((attachment) => ({
              path: attachment.path,
            })),
          },
        },
      },
      select: {
        id: true,
        text: true,
        created_at: true,
        replied_to: {
          select: {
            id: true,
            text: true,
          },
        },
        attachments: {
          select: {
            id: true,
            path: true,
            uploaded_at: true,
          },
        },
        member: {
          select: {
            details: {
              select: {
                uuid: true,
                name: true,
                photo: true,
                is_linked: true,
                bib_attachment: { select: { photo_url: true } },
              },
            },
          },
        },
      },
    });

    const formattedMessage = await this.formatGroupMessage(createdMessage);

    return formattedMessage;
  } catch (error) {
    throw error;
  }
};

exports.getGroupMessages = async (groupID, params = {}) => {
  const groupMessages = await prisma.lp_group_chat_messages.findMany({
    where: { group_id: +groupID },
    orderBy: {
      id: "desc",
    },
    select: {
      id: true,
      text: true,
      created_at: true,
      replied_to: {
        select: {
          id: true,
          text: true,
        },
      },
      attachments: {
        select: {
          id: true,
          path: true,
          uploaded_at: true,
        },
      },
      member: {
        select: {
          details: {
            select: {
              uuid: true,
              name: true,
              photo: true,
              is_linked: true,
              bib_attachment: { select: { photo_url: true } },
            },
          },
        },
      },
    },
    ...params,
  });

  const formattedGroupMessages = await Promise.all(
    groupMessages.map(this.formatGroupMessage)
  );

  return formattedGroupMessages;
};
