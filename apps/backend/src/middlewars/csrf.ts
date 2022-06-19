import { Request, Response, NextFunction } from 'express';

export function csrfMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  res.cookie('X-CSRF', req.csrfToken());
  next();
}
