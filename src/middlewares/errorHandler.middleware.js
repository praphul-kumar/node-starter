const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

module.exports = (err, req, res, next) => {
  // Default to a 500 Internal Server Error if no status code is set
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  // Handle MongoDB CastError
  if (err.name === "CastError") {
      const message = `Resource not found. Invalid ${err.path}`;
      err = new ApiError(400, message);
  }

  // Handle Mongoose duplicate key error
  if (err.code === 11000) {
      const message = `Duplicate field value entered: ${Object.keys(err.keyValue).join(', ')}`;
      err = new ApiError(400, message);
  }

  // Handle JWT invalid error
  if (err.name === "JsonWebTokenError") {
      const message = "Access token expired";
      err = new ApiError(401, message);
  }

  // Handle JWT expired error
  if (err.name === "TokenExpiredError") {
      const message = "Access token expired";
      err = new ApiError(401, message);
  }

  // Send error response
  res.status(err.statusCode).json(
    new ApiResponse(err.statusCode, null, err.message)
  );
};