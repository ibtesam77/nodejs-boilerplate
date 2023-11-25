const { Validator } = require("node-input-validator");

// Fetch IP from request
exports.getIpFromRequest = (req) => {
  let ips = (
    req.headers["cf-connecting-ip"] ||
    req.headers["x-real-ip"] ||
    req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress ||
    req.ips
  ).split(",");

  return ips?.[0]?.trim() || req.ip;
};

// Validate Input
exports.validateData = (data, options) =>
  new Promise(async (resolve, reject) => {
    const validator = new Validator(data, options);
    const isValid = await validator.check();
    if (!isValid) reject(validator.errors);
    resolve();
  });
