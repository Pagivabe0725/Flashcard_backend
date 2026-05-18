import { validationResult } from "express-validator";

/**
 * Express middleware for handling validation results.
 *
 * - Collects validation errors from express-validator.
 * - If errors exist, responds with HTTP 422 and error details.
 * - Otherwise passes control to the next middleware.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const validate = (req, res, next) => {
   const errors = validationResult(req);

   // Checks if any validation errors were collected during request validation
   if (!errors.isEmpty()) {
      return res.status(422).json({
         errors: errors.array(),
      });
   }

   next();
};
