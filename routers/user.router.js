import express from "express";
import { UserFunctions } from "../controllers/user.controller.js";
import { body } from "express-validator";
import { usedEmailValidator } from "../validators/used-email.validator.js";
import { validate } from "../controllers/validator.controller.js";

const router = express.Router();

const createUserValidator = [
   body("email").trim().isEmail().normalizeEmail().bail().custom(usedEmailValidator()),

   body("password")
      .trim()
      .notEmpty()
      .withMessage("Password is required")
      .bail()
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),

];

router.post("/create-user", createUserValidator, validate, UserFunctions.createUser);

router.post("/update-user", UserFunctions.updateUser);

router.post("/delete-user", UserFunctions.deleteUser);

export default router;
