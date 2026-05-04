import bcrypt from "bcrypt";
import { UserService } from "./user.services.js";

const login = async ({ email, password }, userRepository) => {
   const invalidCredentialsError = new Error("Invalid credentials");

   if (!email || typeof email !== "string") {
      throw invalidCredentialsError;
   }

   if (!password || typeof password !== "string") {
      throw invalidCredentialsError;
   }

   const user = await userRepository.findByEmail(email);

   if (!user) {
      throw invalidCredentialsError;
   }

   const isValidPassword = await bcrypt.compare(password, user.passwordHash);

   if (!isValidPassword) {
      throw invalidCredentialsError;
   }

   const lastLogin = new Date();

   await userRepository.update(user.id, { lastLogin });

   user.lastLogin = lastLogin;

   return user;
};

const loginCheck = async ({ session }, userRepository) => {
   const { userId } = session;

   if (!userId || typeof userId !== "string") {
      throw new Error("Not authenticated");
   }

   const user = await userRepository.findById(userId);

   if (!user) {
      session.destroy?.();
      throw new Error("Session invalid");
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
      throw new ValidationError("Password is required");
   }

   if (!confirmPassword) {
      throw new ValidationError("Confirm password is required");
   }

   if (confirmPassword !== userData.password) {
      throw new ValidationError("Passwords do not match");
   }

   userData.lastLogin = new Date()
   return UserService.create(userData, userRepository);
};

export const AuthService = {
   login,
   loginCheck,
   signup,
};
