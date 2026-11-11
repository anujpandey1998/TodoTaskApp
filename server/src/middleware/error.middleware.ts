import type { ErrorRequestHandler, RequestHandler } from 'express';
import { Error as MongooseError } from 'mongoose';
import { ZodError } from 'zod';

export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(new HttpError(404, `Route not found: ${req.method} ${req.path}`));
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: {
        message: 'Request validation failed',
        details: error.issues.map(({ path, message }) => ({ path: path.join('.'), message })),
      },
    });
    return;
  }

  if (error instanceof HttpError) {
    res.status(error.statusCode).json({
      success: false,
      error: { message: error.message },
    });
    return;
  }

  if (error instanceof MongooseError.CastError) {
    res.status(400).json({
      success: false,
      error: { message: 'Invalid value provided' },
    });
    return;
  }

  if (error instanceof MongooseError.ValidationError) {
    res.status(400).json({
      success: false,
      error: { message: error.message },
    });
    return;
  }

  if (error instanceof SyntaxError && 'body' in error) {
    res.status(400).json({
      success: false,
      error: { message: 'Malformed JSON request body' },
    });
    return;
  }

  console.error('Unhandled request error:', error);
  res.status(500).json({
    success: false,
    error: { message: 'Internal server error' },
  });
};
