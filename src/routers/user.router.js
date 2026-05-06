import express from "express";
import { UserFunctions } from "../controllers/user.controller.js";
import { body } from "express-validator";
import { usedEmailValidator } from "../validators/used-email.validator.js";
import { validate } from "../controllers/validator.controller.js";

/** Express router instance for user-related routes. */
const router = express.Router();

/**
 * Validation rules for user creation.
 *
 * - Validates email format and ensures it is not already used.
 * - Ensures password meets minimum length requirements.
 */
const createUserValidator = [
   body("email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .bail()
      .custom(usedEmailValidator()),

   body("password")
      .trim()
      .notEmpty()
      .withMessage("Password is required")
      .bail()
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
];

/**
 * Creates a new user.
 *
 * POST /users
 */
router.post("/", createUserValidator, validate, UserFunctions.createUserHandler);

/**
 * Updates an existing user by its identifier.
 *
 * PATCH /users/:id
 */
router.patch("/:id", UserFunctions.updateUserHandler);

/**
 * Deletes a user by its identifier.
 *
 * DELETE /users/:id
 */
router.delete("/:id", UserFunctions.deleteUserHandler);

export default router;