class ApiError extends Error {
  constructor(
    statusCode, 
    message= "Something went wrong",
    errors = [],
    stack = ""
  ) {
    super(message);
    this.success = false;
    this.data = null;
    this.statusCode = statusCode;
    this.message = message;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

module.exports = ApiError;