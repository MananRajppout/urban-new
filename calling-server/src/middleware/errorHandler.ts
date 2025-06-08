import { Request, Response, NextFunction } from "express";
import { HttpException } from "../utils/HttpException.js";
const errorHandler = async (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("Error:",error.message);
  if (error instanceof HttpException) {
    res.status(error.statusCode).json({
      message: error.message,
      error: error.error,
    });
    
  } else {
    res.status(500).json({
      message: error.message,
    });
  }
};

export default errorHandler;
