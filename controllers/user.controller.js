import { User } from "../classes/User/user.class.js";
import { UserRepository } from "../classes/User/user-repository.class.js";
import bcrypt from "bcrypt";
import { getDb } from "../database/database.js";

const createUser = async (req, res, next) => {
   try {
      const db = getDb();
      const userRepository = new UserRepository(db);

      const userTemplate = { ...req.body };

      // Extract password separately
      const { password } = userTemplate;

      if (!password || password.length < 6) {
         throw new Error("Password must be at least 6 characters");
      }

      // Remove plain password from object
      delete userTemplate.password;

      if (req.id) {
         userTemplate.id = req.id;
      }
      const passwordHash = await bcrypt.hash(password, 12);
      userTemplate.passwordHash = passwordHash;

      const currentUser = new User(userTemplate);

      console.log("template");
      console.log(userTemplate);

      const result = await userRepository.create(currentUser);

      res.status(200).json({
         message: "User created",
         result,
      });
   } catch (err) {
      next(err);
   }
};

const updateUser = async (req, res, next) => {
   try {
      const db = getDb();
      const userRepository = new UserRepository(db);

      const { id } = req.body;
      const changes = { ...req.body };
      delete changes.id;

      const result = await userRepository.update(id, changes);

      res.status(200).json({
         message: "User updated",
         result: result.toJSON(),
      });
   } catch (err) {
      next(err);
   }
};

const deleteUser = async (req, res, next) => {
   try {
      const db = getDb();
      const userRepository = new UserRepository(db);

      const { id } = req.body;
      const result = await userRepository.delete(id);

      if (result) {
         res.status(200).json({
            message: "User deleted successfully",
            result: true,
         });
      } else {
         throw new Error("User delete failed");
      }
   } catch (err) {
      next(err);
   }
};

const getUserByEmail = async (req, res, next) => {
   try {
      const db = getDb();
      const userRepository = new UserRepository(db);
      const { email } = req.body;
      if (!email) {
         throw new Error("Invalid email");
      }

      const user = await userRepository.findByEmail(email);

      if (!user) {
         return res.status(404).json({
            message: "User not found",
         });
      }

      res.status(200).json({
         message: "User found",
         result: user,
      });
   } catch (err) {
      next(err);
   }
};

export const UserFunctions = {
   createUser,
   updateUser,
   deleteUser,
   getUserByEmail,
};
