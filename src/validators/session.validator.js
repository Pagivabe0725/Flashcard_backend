
import { HttpError } from "../classes/Error/httpError.class.js";

/**
 * Ensures that the current request
 * belongs to an authenticated user.
 *
 * Validation succeeds only when
 * `req.session.userId` exists.
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} _
 * @param {import("express").NextFunction} next
 *
 * @returns {void}
 */
const requireAuthenticatedSession = (req, _, next) => {
   if (!req.session?.userId) {
      return next(HttpError.unauthorized("Authentication required"));
   }

   next();
};

/**
 * Collection of reusable session validation middleware.
 */
export const SessionValidators = {
   requireAuthenticatedSession,
};
