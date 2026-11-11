import type { RequestHandler } from 'express';
import type { ZodType } from 'zod';

export const validate =
  (schema: ZodType, source: 'body' | 'query' | 'params' = 'body'): RequestHandler =>
  (req, _res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      next(result.error);
      return;
    }

    Object.defineProperty(req, source, {
      configurable: true,
      enumerable: true,
      value: result.data,
      writable: true,
    });
    next();
  };
