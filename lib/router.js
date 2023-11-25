const { Router } = require("express");

function customMiddleware(req, res, next) {
  /**
   * (default status 200)
   * Success response
   */
  res.success = function ({
    data = {},
    statusCode = 200,
    message = "Success",
  }) {
    return res.status(statusCode).json({
      data,
      status: statusCode,
      message,
    });
  };

  /**
   * Custom error/Bad request response
   */
  res.error = function ({
    error = {},
    statusCode = 400,
    message = "Something went wrong",
  }) {
    return res.status(statusCode).json({
      error,
      status: statusCode,
      message,
    });
  };

  /**
   * Unauthorized response
   */
  res.unauthorized = function ({
    error = {},
    statusCode = 401,
    message = "Something went wrong",
  }) {
    return res.error({
      error,
      statusCode,
      message,
    });
  };

  next();
}

class CustomRouter {
  constructor() {
    const router = Router();

    // Attaching custom middleware to router
    router.use(customMiddleware);

    this.router = router;
  }
}

module.exports = CustomRouter;
