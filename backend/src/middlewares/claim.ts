import { NextFunction, Request, Response } from '../http';
import { UnauthorizedError } from '../lib/errors';
import { AuthorizationErrorCode, ClaimType } from '../config/values';

/**
 * Claim Guard check if user perform this action according to claim type
 * @param req Express request
 * @param _res Express response
 * @param next Express next function
 */
export function ClaimGuard(req: Request, _res: Response, next: NextFunction) {
  const { context, url } = req;

  switch (context.env.CLAIM_TYPE) {
    case ClaimType.AIRDROP:
      if (url === '/claim-airdrop' || url === '/claim-whitelist') {
        next();
        return;
      }
      break;
    case ClaimType.FREE_MINT:
      if (url === '/claim') {
        next();
        return;
      }
      break;
    case ClaimType.POAP:
      if (url === '/claim' || url === '/claim-airdrop') {
        next();
        return;
      }
      break;
    default:
      console.log("Unsupported claim type:", context.env.CLAIM_TYPE);
      next(
        new UnauthorizedError(
          AuthorizationErrorCode.UNSUPPORTED_CLAIM_TYPE,
          context,
          'claim-middleware/validateRoute',
        ),
      );
  }

  console.log("Unsupported claim type:", context.env.CLAIM_TYPE);
  next(
    new UnauthorizedError(
      AuthorizationErrorCode.UNSUPPORTED_CLAIM_TYPE,
      context,
      'claim-middleware/validateRoute',
    ),
  );
}
