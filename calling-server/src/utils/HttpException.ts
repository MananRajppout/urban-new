export class HttpException extends Error {
  statusCode: number;
  error?: any;
  constructor(statusCode: number, message: string, error?: any) {
    super(message);
    this.statusCode = statusCode;
    this.error = error;
  }
  static ok(message: string = "OK") {
    return new HttpException(200, message);
  }

  static error(
    statusCode: number = 400,
    message: string = "Bad Request",
    error?: any
  ) {
    return new HttpException(statusCode, message, error);
  }
  static notFound(message: string = "Not Found") {
    return new HttpException(404, message);
  }
  static unauthorized(message: string = "Unauthorized") {
    return new HttpException(401, message);
  }
  static forbidden(message: string = "Forbidden") {
    return new HttpException(403, message);
  }
  static internalServerError(message: string = "Internal Server Error") {
    return new HttpException(500, message);
  }
  static badGateway(message: string = "Bad Gateway") {
    return new HttpException(502, message);
  }
}
