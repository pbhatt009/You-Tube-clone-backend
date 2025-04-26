class ApiResponse {
  constructor(statusCode, data, messae = "Success") {
    (this.statusCode = statusCode),
     (this.data = data),
      (this.message = messae),
      (this.sucess = statusCode < 400);
  }
}
export { ApiResponse };
