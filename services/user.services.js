import bcrypt from "bcrypt";
import { ObjectId } from "mongodb";

import { User } from "../classes/User/user.class.js";

const createPasswordHash = async (password) => {
   if (!password || typeof password !== "string") {
      throw new Error(`Invalid password type ${typeof password}`);
   }

   const normalized = password.trim();

   if (normalized.length < 6) {
      throw new Error("Password is too short (at least 6 characters)");
   }

   return bcrypt.hash(normalized, 12);
};

const userExists = async (id, userRepository) => {
   const user = await userRepository.findById(id);
   return !!user;
};

const create = async (props, userRepository) => {
   const { password, ...userTemplate } = props;
   userTemplate.passwordHash = await createPasswordHash(password);

   if (!userTemplate.id) {
      userTemplate.id = new ObjectId().toString();
   }

   const user = new User(userTemplate);
   return userRepository.create(user);
};

const update = async ({ body, params }, userRepository) => {
   const { id } = params;
   const { password, ...changes } = body;
   const exist = await userRepository.findById(id);

   if (!exist) {
      throw new Error("User not found");
   }

   return userRepository.update(id, changes);
};

const destroy = async ({ params }, userRepository) => {
   const { id } = params;
   const result = await userRepository.delete(id);

   if (!result) {
      throw new Error("User not found");
   }
};

/**
 *
 * @param {*} props
 * @param {UserRepository} userRepository
 */
const getUserByEmail = async ({ body }, userRepository) => {
   const { email } = body;

   if (!email) {
      throw new Error("Invalid email");
   }

   const user = await userRepository.findByEmail(email);

   if (!user) {
      throw new Error("User not found");
   }

   return user;
};

export const UserService = {
   createPasswordHash,
   create,
   userExists,
   update,
   destroy,
   getUserByEmail,
};
