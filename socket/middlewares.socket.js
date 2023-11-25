const jwt = require("jsonwebtoken");
const prisma = require("../lib/primsa");

exports.customResponseHandler = async (socket, next) => {
  try {
    /**
     * (default status 200)
     * Success response
     */
    socket.success = function ({
      data = {},
      statusCode = 200,
      message = "Success",
    }) {
      return {
        data,
        status: statusCode,
        message,
      };
    };

    /**
     * Custom error/Bad request response
     */
    socket.error = function ({
      error = {},
      statusCode = 400,
      message = "Something went wrong",
    }) {
      return {
        error,
        status: statusCode,
        message,
      };
    };

    next();
  } catch (e) {
    next(e);
  }
};

exports.authenticateUser = async (socket, next) => {
  try {
    // If No Auth Header Found
    if (!socket.request.headers.authorization)
      throw new Error("Authorization header not provided");

    // Split away authorization token
    var [_, token] = socket.request.headers.authorization.split(" ");
    if (!token) throw new Error("No token found");
  } catch (error) {
    next(error);
  }

  // Authenticate JWT Token
  jwt.verify(token, process.env.SECRET_KEY, async (error, response) => {
    try {
      if (error) throw new Error("Invalid or Expired token provided");

      const { data: userData } = response;

      const targetUser = await prisma.oleh_users.findFirst({
        where: { id: +userData.userid },
      });

      if (!targetUser) throw new Error("User not found");

      socket.user = targetUser;
      next();
    } catch (error) {
      next(error);
    }
  });
};
