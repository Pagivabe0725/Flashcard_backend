import { UserRepository } from "../classes/User/user-repository.class.js";
import { getDb } from "../database/database.js";

export const emailExistsValidator = () => {
   return async (email) => {
      const db = getDb();
      const userRepository = new UserRepository(db);

      const exist = await userRepository.findByEmail(email);

      if (!exist) throw new Error("EMAIL_DOES_NOT_EXIST");
      return true;
   };
};
