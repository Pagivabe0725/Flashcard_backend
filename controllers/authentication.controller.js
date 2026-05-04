import { UserRepository } from "../classes/User/user-repository.class.js";
import { getDb } from "../database/database.js";
import dotenv from "dotenv";
import { AuthService } from "../services/auth.service.js";

dotenv.config({ path: "./environment/session.env" });

/** Maximum allowed lifetime of a session in milliseconds (7 days). */
const MAX_SESSION_LIFETIME = 7 * 24 * 60 * 60 * 1000;

/**
 * Represents the custom session data stored in express-session.
 *
 * @typedef {Object} MySession
 * @property {string} userId - Identifier of the authenticated user
 * @property {string} role - Role of the authenticated user
 */

/**
 * Handles user signup.
 *
 * Creates a new user via AuthService and initializes session.
 *
 * @param {import('express').Request & { session: import('express-session').Session & Partial<MySession> }} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const signupHandler = async (req, res, next) => {
   try {
      const db = getDb();
      const userRepository = new UserRepository(db);

      const user = await AuthService.signup(req.body, userRepository);

      req.session.userId = user.id;

      res.status(201).json({
         message: "User signed up",
         result: user.toJSON(),
      });
   } catch (err) {
      next(err);
   }
};

/**
 * Handles user login.
 *
 * Authenticates the user, regenerates the session to prevent fixation,
 * and sets session lifetime.
 *
 * @param {import('express').Request & { session: import('express-session').Session & Partial<MySession> }} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
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

      return res.status(200).json({
         message: "User logged",
         result: user.toJSON(),
      });
   } catch (err) {
      return next(err);
   }
};

/**
 * Generates and returns a CSRF token.
 *
 * Disables caching to ensure token freshness.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const getCSRFToken = (req, res) => {
   res.set("Cache-Control", "no-store");
   
   res.status(200).json({
      message: "CSRF Token generated",
      result: req.csrfToken(),
   });
};

/**
 * Handles user logout.
 *
 * Destroys the current session and clears the session cookie.
 *
 * @param {import('express').Request & { session: import('express-session').Session & Partial<MySession> }} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const logout = (req, res, next) => {
   if (!req.session.userId) {
      return res.status(401).json({
         message: "User not logged in",
      });
   }

   req.session.destroy((err) => {
      if (err) return next(err);

      res.clearCookie(process.env.SESSION_KEY);

      return res.status(200).json({
         message: "User logged out",
      });
   });
};

/**
 * Checks whether the current session is valid and returns the authenticated user.
 *
 * @param {import('express').Request & { session: import('express-session').Session & Partial<MySession> }} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const loginCheckHandler = async (req, res, next) => {
   try {
      const db = getDb();
      const userRepository = new UserRepository(db);

      const user = await AuthService.loginCheck(req, userRepository);

      return res.status(200).json({
         message: "Session check was successful",
         result: user.toJSON(),
      });
   } catch (err) {
      next(err);
   }
};

/**
 * Represents the custom session data stored in express-session.
 *
 * @typedef {Object} MySession
 * @property {string} userId - Identifier of the authenticated user
 * @property {string} role - Role of the authenticated user
 */

/**
 * Middleware enforcing maximum session lifetime.
 *
 * If the session exceeds the allowed lifetime, it is destroyed.
 *
 * @param {import('express').Request & { session: import('express-session').Session & Partial<MySession> }} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const enforceSessionLifetime = (req, res, next) => {
   const { createdAt } = req.session;

   // Checks whether the session exceeded the maximum allowed lifetime
   if (Date.now() - createdAt > MAX_SESSION_LIFETIME) {
      return req.session.destroy((err) => {
         if (err) return next(err);

         return res.status(401).json({
            message: "Session expired",
         });
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
