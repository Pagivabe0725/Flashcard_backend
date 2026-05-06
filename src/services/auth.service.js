import bcrypt from "bcrypt";
import { UserService } from "./user.service.js";
import { HttpError } from "../classes/Error/httpError.class.js";


const login = async ({ email, password }, userRepository) => {
   const invalidCredentials = () => HttpError.unauthorized("Invalid credentials");

   if (typeof email !== "string" || !email || typeof password !== "string" || !password) {
      throw invalidCredentials();
   }

   const user = await userRepository.findByEmail(email);

   if (!user) {
      throw invalidCredentials();
   }

   const isValidPassword = await bcrypt.compare(password, user.passwordHash);

   if (!isValidPassword) {
      throw invalidCredentials();
   }

   const lastLogin = new Date();

   await userRepository.update(user.id, { lastLogin });

   user.lastLogin = lastLogin;

   return user;
};

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
 *
 * @param {*} props
 * @param {UserRepository} userRepository
 */
const signup = async (props, userRepository) => {
   const { confirmPassword, ...userData } = props;

   if (!userData.password) {
      throw HttpError.unprocessable("Password is required");
   }

   if (!confirmPassword) {
      throw HttpError.unprocessable("Confirm password is required");
   }

   if (confirmPassword !== userData.password) {
      throw HttpError.unprocessable("Passwords do not match");
   }

   userData.lastLogin = new Date();
   return UserService.create(userData, userRepository);
};

export const AuthService = {
   login,
   loginCheck,
   signup,
};
