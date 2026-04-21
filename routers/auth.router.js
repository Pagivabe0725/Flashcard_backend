import express from "express";
import { emailExistsValidator } from "../validators/email-exists.validator.js";
import { body } from "express-validator";
import { equalTo } from "../validators/equal-to.validator.js";
import { AuthenticationFunctions } from "../controllers/authentication.controller.js";
import { validate } from "../controllers/validator.controller.js";
import { usedEmailValidator } from "../validators/used-email.validator.js";
import { UserFunctions } from "../controllers/user.controller.js";

const loginValidator = [
   body("email").trim().isEmail().normalizeEmail().bail().custom(emailExistsValidator()),

   body("password")
      .trim()
      .notEmpty()
      .withMessage("Password is required")
      .bail()
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
];

const signupValidator = [
   body("email").trim().isEmail().normalizeEmail().bail().custom(usedEmailValidator()),
   body("password")
      .trim()
      .notEmpty()
      .withMessage("Password is required")
      .bail()
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
   body("confirmPassword")
      .trim()
      .notEmpty()
      .withMessage("Confirm password is required")
      .bail()
      .custom(equalTo("password")),
];

const router = express.Router();

router.get("/csrf-token", AuthenticationFunctions.getCSRFToken);

router.post("/login", loginValidator, validate, AuthenticationFunctions.login);

router.post(
   "/signup",
   signupValidator,
   validate,
   AuthenticationFunctions.signup,
   UserFunctions.createUser,
);

router.post("/logout", AuthenticationFunctions.logout);

router.get('/me', AuthenticationFunctions.loginCheck)

export default router;
