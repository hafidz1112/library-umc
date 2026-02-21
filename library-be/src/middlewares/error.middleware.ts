import { type Request, type Response, type NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../exceptions/AppError";

/**
 * Global Error Handling Middleware
 */
export const errorMiddleware = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  let statusCode = 500;
  let message = "Internal Server Error";
  let errors: Record<string, string[]> | undefined = undefined;

  // Handle Custom AppError
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }
  // Handle Zod Validation Errors
  else if (err instanceof ZodError) {
    statusCode = 400;
    message = "Validation Error";
    errors = err.flatten().fieldErrors;
  }
  // Handle Multer Errors
  else if (err instanceof Error && err.name === "MulterError") {
    statusCode = 400;
    message = err.message;
  }
  // Handle generic Error instances
  else if (err instanceof Error) {
    message = err.message;
  }

  // Log errors for debugging
  console.error(`🔥 [${req.method}] ${req.originalUrl} Error:`, {
    message,
    statusCode,
    stack:
      err instanceof Error && process.env.NODE_ENV === "development"
        ? err.stack
        : undefined,
  });

  // Send error response
  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { data: errors }), // Maintain data format consistent with existing responses
    ...(process.env.NODE_ENV === "development" && {
      stack: err instanceof Error ? err.stack : undefined,
    }),
  });
};
