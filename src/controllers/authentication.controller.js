import { DeckRepository } from "../classes/Deck/deck.repository.class.js";
import { UserRepository } from "../classes/User/user-repository.class.js";
import { getDb } from "../database/database.js";
import { AuthService } from "../services/auth.service.js";

/** Maximum allowed lifetime of a session in milliseconds (7 days). */
const MAX_SESSION_LIFETIME = 7 * 24 * 60 * 60 * 1000;

/**
 * Handles user signup.
 *
 * Creates a new user via AuthService, initializes session,
 * and stores the response payload in `res.locals`.
 *
 * @param {import('express').Request & {
 *    session: import('express-session').Session & Partial<MySession>
 * }} req
 *
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 *
 * @returns {Promise<void>}
 */
const signupHandler = async (req, res, next) => {
   try {
      const db = getDb();

      const userRepository = new UserRepository(db);

      const user = await AuthService.signup(req.body, userRepository);

      req.session.userId = user.id;

      res.locals.status = 201;

      res.locals.message = "User signed up";

      res.locals.result = user.toJSON();

      next();
   } catch (err) {
      next(err);
   }
};

/**
 * Handles user login.
 *
 * Authenticates the user, regenerates the session to prevent fixation,
 * sets session lifetime, and stores the response payload in `res.locals`.
 *
 * @param {import('express').Request & {
 *    session: import('express-session').Session & Partial<MySession>
 * }} req
 *
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 *
 * @returns {Promise<void>}
 */
const loginHandler = async (req, res, next) => {
   const db = getDb();

   const userRepository = new UserRepository(db);

   try {
      const user = await AuthService.login(req.body, userRepository);

      // Regenerate session to prevent session fixation attacks
      await new Promise((resolve, reject) => {
         req.session.regenerate((err) => {
            if (err) return reject(err);

            resolve();
         });
      });

      req.session.userId = user.id;

      req.session.cookie.maxAge = MAX_SESSION_LIFETIME;

      res.locals.status = 200;

      res.locals.message = "User logged";

      res.locals.result = user.toJSON();

      next();
   } catch (err) {
      next(err);
   }
};

/**
 * Generates and returns a CSRF token.
 *
 * Disables caching to ensure token freshness and stores
 * the response payload in `res.locals`.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 *
 * @returns {void}
 */
const getCSRFToken = (req, res, next) => {
   res.set("Cache-Control", "no-store");

   res.locals.status = 200;

   res.locals.message = "CSRF Token generated";

   res.locals.result = req.csrfToken();

   next();
};

/**
 * Handles user logout.
 *
 * Destroys the current session, clears the session cookie,
 * and stores the response payload in `res.locals`.
 *
 * @param {import('express').Request & {
 *    session: import('express-session').Session & Partial<MySession>
 * }} req
 *
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 *
 * @returns {void}
 */
const logout = (req, res, next) => {
   if (!req.session.userId) {
      return next(HttpError.unauthorized("User not logged in"));
   }

   req.session.destroy((err) => {
      if (err) return next(err);

      res.clearCookie(process.env.SESSION_KEY);

      res.locals.status = 200;

      res.locals.message = "User logged out";

      res.locals.result = null;

      next();
   });
};

/**
 * Checks whether the current session is valid
 * and returns the authenticated user.
 *
 * Stores the response payload in `res.locals`.
 *
 * @param {import('express').Request & {
 *    session: import('express-session').Session & Partial<MySession>
 * }} req
 *
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 *
 * @returns {Promise<void>}
 */
const loginCheckHandler = async (req, res, next) => {
   try {
      const db = getDb();

      const userRepository = new UserRepository(db);

      const user = await AuthService.loginCheck(req, userRepository);

      res.locals.status = 200;

      res.locals.message = "Session check was successful";

      res.locals.result = user.toJSON();

      next();
   } catch (err) {
      next(err);
   }
};

/**
 * Middleware enforcing maximum session lifetime.
 *
 * If the session exceeds the allowed lifetime,
 * the session is destroyed and an unauthorized
 * error is forwarded to the error handler.
 *
 * @param {import('express').Request & {
 *    session: import('express-session').Session & Partial<MySession>
 * }} req
 *
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 *
 * @returns {void}
 */
const enforceSessionLifetime = (req, res, next) => {
   const { createdAt } = req.session;

   // Checks whether the session exceeded
   // the maximum allowed lifetime
   if (Date.now() - createdAt > MAX_SESSION_LIFETIME) {
      return req.session.destroy((err) => {
         if (err) return next(err);

         return next(HttpError.unauthorized("Session expired"));
      });
   }

   next();
};

/**
 * Collection of authentication-related handlers and middleware.
 */
export const AuthenticationFunctions = {
   signupHandler,
   loginHandler,
   getCSRFToken,
   logout,
   loginCheckHandler,
   enforceSessionLifetime,
};
