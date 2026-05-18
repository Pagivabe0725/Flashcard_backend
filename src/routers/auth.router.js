import express from "express";
import { emailExistsValidator } from "../validators/email-exists.validator.js";
import { body } from "express-validator";
import { equalTo } from "../validators/equal-to.validator.js"; 
import { AuthenticationFunctions } from "../controllers/authentication.controller.js"; 
import { validate } from "../controllers/validator.controller.js";
import { usedEmailValidator } from "../validators/used-email.validator.js";
import { handleResponse } from "../controllers/response.controller.js";

/**
 * Validation rules for user login.
 *
 * - Validates email format and existence in the system.
 * - Ensures password is provided and meets minimum length requirements.
 */
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

/**
 * Validation rules for user signup.
 *
 * - Validates email format and ensures it is not already used.
 * - Ensures password meets requirements.
 * - Confirms password matches confirmPassword field.
 */
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

/** Express router instance for authentication-related routes. */
const router = express.Router();

/**
 * Returns a CSRF token for client-side usage.
 */
router.get("/csrf-token", AuthenticationFunctions.getCSRFToken, handleResponse);

/**
 * Handles user login with validation middleware.
 */
router.post("/login", loginValidator, validate, AuthenticationFunctions.loginHandler, handleResponse);

/**
 * Handles user signup with validation middleware.
 */
router.post("/signup", signupValidator, validate, AuthenticationFunctions.signupHandler, handleResponse);

/**
 * Handles user logout.
 */
router.post("/logout", AuthenticationFunctions.logout, handleResponse);
/**
 * Returns the currently authenticated user (session check).
 */
router.get("/me", AuthenticationFunctions.loginCheckHandler, handleResponse);

export default router;
