const HttpError = require("../model/http-error");
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }
  try {
    //Get token from the request header
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      throw new Error("Authentication failed");
    }
    //Verfiy that the token is one created by the server
    const decodedToken = jwt.verify(token, process.env.JWT_KEY);
    //Get the user ID to which this token belongs and add to request
    req.userData = { userId: decodedToken.userId };
    //Continue the journey
    next();
  } catch (err) {
    return next(new HttpError("Authentication failed", 403));
  }
};
