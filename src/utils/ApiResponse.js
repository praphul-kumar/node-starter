class ApiResponse {
  constructor(success, statusCode, data, message="Success") {
    this.success = success;
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
  }
}