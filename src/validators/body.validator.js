import { ValidationError } from "../classes/Error/validationError.class.js";

/**
 * Validates that the provided value is an array.
 *
 * Used internally by array-related middleware validators
 * to avoid duplicated validation logic.
 *
 * @param {unknown} body - Request body value to validate
 * @throws {ValidationError} If the provided value is not an array
 */
const assertArrayBody = (body) => {

   if (!Array.isArray(body)) {

      throw ValidationError.invalidBody(
         "Request body must be an array",
         "INVALID_ARRAY_BODY",
         {
            body,
         },
      );
   }
};

/**
 * Ensures that the request body exists
 * and is not an empty object.
 *
 * @param {import("express").Request} req - Express request object
 * @param {import("express").Response} _ - Unused express response object
 * @param {import("express").NextFunction} next - Express next middleware function
 * @returns {void}
 */
const requireNonEmptyBody = (req, _, next) => {
   const isEmptyObject =
      typeof req.body === "object" &&
      req.body !== null &&
      !Array.isArray(req.body) &&
      Object.keys(req.body).length === 0;

   if (!req.body || isEmptyObject) {
      return next(
         ValidationError.invalidBody("Request body cannot be empty", "EMPTY_BODY", {
            body: req.body,
         }),
      );
   }

   next();
};

/**
 * Ensures that the request body is a non-null object.
 *
 * Arrays are explicitly rejected.
 *
 * @param {import("express").Request} req - Express request object
 * @param {import("express").Response} _ - Unused express response object
 * @param {import("express").NextFunction} next - Express next middleware function
 * @returns {void}
 */
const requireObjectBody = (req, _, next) => {
   if (typeof req.body !== "object" || req.body === null || Array.isArray(req.body)) {
      return next(
         ValidationError.invalidBody(
            "Request body must be a non-null object",
            "INVALID_OBJECT_BODY",
            {
               body: req.body,
            },
         ),
      );
   }

   next();
};

/**
 * Ensures that the request body is an array.
 *
 * @param {import("express").Request} req - Express request object
 * @param {import("express").Response} _ - Unused express response object
 * @param {import("express").NextFunction} next - Express next middleware function
 * @returns {void}
 */
const requireArrayBody = (req, _, next) => {
   try {
      assertArrayBody(req.body);

      next();
   } catch (err) {
      next(err);
   }
};

/**
 * Ensures that the request body is a non-empty array.
 *
 * @param {import("express").Request} req - Express request object
 * @param {import("express").Response} _ - Unused express response object
 * @param {import("express").NextFunction} next - Express next middleware function
 * @returns {void}
 */
const requireNonEmptyArrayBody = (req, _, next) => {
   try {
      assertArrayBody(req.body);

      if (req.body.length === 0) {
         return next(
            ValidationError.invalidBody(
               "Request body array cannot be empty",
               "EMPTY_ARRAY_BODY",
               {
                  body: req.body,
               },
            ),
         );
      }

      next();
   } catch (err) {
      next(err);
   }
};

/**
 * Creates middleware that validates
 * the maximum allowed array length.
 *
 * @param {number} max - Maximum allowed array length
 * @returns {import("express").RequestHandler} Express middleware function
 */
const validateArrayMaxLength = (max) => {
   return (req, _, next) => {
      try {
         assertArrayBody(req.body);

         if (req.body.length > max) {
            return next(
               ValidationError.invalidBody(
                  `Request array cannot contain more than ${max} elements`,
                  "ARRAY_MAX_LENGTH_EXCEEDED",
                  {
                     max,
                     currentLength: req.body.length,
                  },
               ),
            );
         }

         next();
      } catch (err) {
         next(err);
      }
   };
};

/**
 * Creates middleware that validates
 * the type of items inside an array body.
 *
 * Supported types:
 * - string
 * - number
 * - boolean
 * - object
 * - array
 *
 * @param {"string" | "number" | "boolean" | "object" | "array"} type - Expected array item type
 * @returns {import("express").RequestHandler} Express middleware function
 * @throws {ValidationError} If the provided validator type is unsupported
 */
const validateArrayItemType = (type) => {
   const allowedTypes = ["string", "number", "boolean", "object", "array"];

   if (!allowedTypes.includes(type)) {
      throw new ValidationError(
         `Unsupported array item type validator: ${type}`,
         "INVALID_VALIDATOR_TYPE",
         {
            providedType: type,
            allowedTypes,
         },
         "ValidatorConfig",
      );
   }

   return (req, _, next) => {
      try {
         assertArrayBody(req.body);

         const invalidIndex = req.body.findIndex((item) => {
            if (type === "array") {
               return !Array.isArray(item);
            }

            if (type === "object") {
               return typeof item !== "object" || item === null || Array.isArray(item);
            }

            return typeof item !== type;
         });

         if (invalidIndex !== -1) {
            return next(
               ValidationError.invalidBody(
                  `Invalid array item type at index ${invalidIndex}`,
                  "INVALID_ARRAY_ITEM_TYPE",
                  {
                     expectedType: type,
                     allowedTypes,
                     index: invalidIndex,
                     value: req.body[invalidIndex],
                  },
               ),
            );
         }

         next();
      } catch (err) {
         next(err);
      }
   };
};

/**
 * Collection of reusable request body validation middleware.
 */
export const BodyValidators = {
   requireNonEmptyBody,
   requireObjectBody,
   requireArrayBody,
   requireNonEmptyArrayBody,
   validateArrayMaxLength,
   validateArrayItemType,
};
