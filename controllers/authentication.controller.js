import { ObjectId } from "mongodb";
import { UserRepository } from "../classes/User/user-repository.class.js";
import { getDb } from "../database/database.js";
import bcrypt from "bcrypt";
import session from "express-session";
import dotenv from "dotenv";

dotenv.config({ path: "./environment/session.env" });

const MAX_SESSION_LIFETIME = 7 * 24 * 60 * 60 * 1000;

/**
 * @typedef {Object} MySession
 * @property {string} userId
 * @property {string} role
 */

/**
 * @param {import('express').Request & { session: import('express-session').Session & Partial<MySession> }} req
 */
const signup = async (req, res, next) => {
   try {
      const id = new ObjectId();

      req.session.userId = id.toString();
      req.id = id.toString();
      delete req.confirmPassword;
      next();
   } catch (err) {
      next(err);
   }
};

const login = async (req, res, next) => {
   const db = getDb();
   const userRepository = new UserRepository(db);
   const { email, password } = req.body;

   const user = await userRepository.findByEmail(email);

   if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
   }

   const isValid = await bcrypt.compare(password, user.passwordHash);

   if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials" });
   }

   req.session.regenerate((err) => {
      if (err) {
         return res.status(400).json({
            message: "Login process failed",
         });
      } else {
         req.session.userId = user.id;
         req.session.cookie.maxAge = 1000 * 60 * 60 * 24;
         req.csrfToken();

         return res.status(200).json({
            message: "User logged",
            result: user.toJSON(),
         });
      }
   });
};

const getCSRFToken = (req, res) => {
   res.set("Cache-Control", "no-store");
   res.status(200).json({
      message: "CSRF Token generated",
      result: req.csrfToken(),
   });
};

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

const loginCheck = async (req, res, next) => {
   try {
      const { userId } = req.session;

      if (!userId) {
         return res.status(200).json({
            message: "User did not log in",
            result: false,
         });
      }

      const db = getDb();
      const userRepository = new UserRepository(db);

      const user = await userRepository.findById(userId);

      if (!user) {
         return res.status(401).json({
            message: "Invalid session",
            result: false,
         });
      }

      return res.status(200).json({
         message: "Session check was successful",
         result: user.toJSON(),
      });
   } catch (err) {
      next(err);
   }
};

/**
 * @typedef {Object} MySession
 * @property {string} userId
 * @property {string} role
 */

/**
 * @param {import('express').Request & { session: import('express-session').Session & Partial<MySession> }} req
 */
const enforceSessionLifetime = (req, res, next) => {
   const { createdAt } = req.session;

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

export const AuthenticationFunctions = {
   signup,
   login,
   getCSRFToken,
   logout,
   loginCheck,
   enforceSessionLifetime,
};
