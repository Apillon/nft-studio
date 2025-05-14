import { NextFunction, Request, Response } from '../http';
import { UnauthorizedError } from '../lib/errors';
import { AuthorizationErrorCode } from '../config/values';

/**
 * Authenticate user and return error if user can't be authenticated
 * @param req Express request
 * @param _res Express response
 * @param next Express next function
 */
export function AuthenticateAdmin(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const token = String(
    req.header('authToken') ||
      req.header('authorization') ||
      req.header('Authorization') ||
      req.query['nftToken'] ||
      ' ',
  )
    .toString()
    .split(' ')
    .reverse()[0];

  const { context } = req;
  if (!token) {
    next(
      new UnauthorizedError(
        AuthorizationErrorCode.MISSING_AUTH_TOKEN,
        context,
        'authentication-middleware/AuthenticateUser',
      ),
    );
    return;
  }

  context.authenticateAdmin(token);

  if (context && context.isAdmin) {
    next();
    return;
  }
  next(
    new UnauthorizedError(
      AuthorizationErrorCode.UNAUTHORIZED,
      context,
      'authentication-middleware/AuthenticateUser',
    ),
  );
}
