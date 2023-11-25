const jwt = require("jsonwebtoken");
const prisma = require("../../lib/primsa");

module.exports = async (req, res, next) => {
  // Check for authorization header
  if (!req.headers.authorization) {
    return res.unauthorized({ error: "No Authorization Header" });
  }

  // Split away authorization token
  const [_, token] = req.headers.authorization.split(" ");
  if (!token) return res.unauthorized({ message: "No token found" });

  // Authenticate authorization header
  try {
    jwt.verify(token, process.env.SECRET_KEY, async (error, response) => {
      if (error) {
        return res.unauthorized({
          error,
          message: "Invalid or Expired token provided",
        });
      }

      const { data: userData } = response;

      const targetUser = await prisma.oleh_users.findFirst({
        where: { id: +userData.userid, status: 1 },
      });

      if (!targetUser) return res.unauthorized({ message: "User not found" });

      req.user = targetUser;
      next();
    });
  } catch (error) {
    return res.error({
      error,
      message: "Something went wrong in verifying token",
    });
  }
};
