import bcrypt from "bcrypt";
import { UserService } from "./user.service.js";
import { HttpError } from "../classes/Error/httpError.class.js";

/**
 * Authenticates a user using
 * email and password credentials.
 *
 * On successful authentication:
 * - updates the user's last login timestamp
 * - returns the authenticated user
 *
 * @param {{
 *    email: string,
 *    password: string,
 * }} credentials
 *
 * @param {UserRepository} userRepository
 *
 * @returns {Promise<User>}
 */
const login = async ({ email, password }, userRepository) => {
   const user = await userRepository.findByEmail(email);

   const isValidPassword = await bcrypt.compare(password, user.passwordHash);

   if (!isValidPassword) {
      throw HttpError.unauthorized("Invalid credentials");
   }

   const lastLogin = new Date();

   await userRepository.update(user.id, {
      lastLogin,
   });

   user.lastLogin = lastLogin;

   return user;
};

/**
 * Returns the authenticated user
 * associated with the current session.
 *
 * Ensures that:
 * - the session contains a valid user identifier
 * - the referenced user still exists
 *
 * Invalid sessions are automatically
 * destroyed before an unauthorized
 * error is thrown.
 *
 * @param {{
 *    session: import("express-session").Session
 * }} context
 *
 * @param {UserRepository} userRepository
 *
 * @returns {Promise<User>}
 */
const loginCheck = async ({ session }, userRepository) => {
   const { userId } = session;

   if (!userId || typeof userId !== "string") {
      throw HttpError.unauthorized("Not authenticated");
   }

   const user = await userRepository.findById(userId);

   if (!user) {
      session.destroy?.();

      throw HttpError.unauthorized("Session invalid");
   }

   return user;
};

/**
 * Creates a new user account.
 *
 * Assumes that all request validation
 * has already been completed by the
 * validation middleware chain.
 *
 * @param {object} props
 * @param {UserRepository} userRepository
 *
 * @returns {Promise<User>}
 */
const signup = async (props, userRepository) => {
   const { confirmPassword, ...userData } = props;

   userData.lastLogin = new Date();

   return await UserService.create(userData, userRepository);
};

export const AuthService = {
   login,
   loginCheck,
   signup,
};
