import { ValidationError } from "../classes/Error/validationError.class.js";
import { COMMON_EMAIL_DOMAINS } from "../constants/email-domains.constant.js";
import { EMAIL_REGEX } from "../constants/email-regex.constant.js";

/**
 * Validates whether the provided fields parameter
 * is a non-empty array.
 *
 * @param {unknown} fields
 * @throws {ValidationError}
 */
const assertFieldArray = (fields) => {
   if (!Array.isArray(fields) || fields.length === 0) {
      throw ValidationError.invalidField(
         "Invalid fields parameter (must be a non-empty array)",
         "INVALID_FIELD_ARRAY",
         {
            parameter: fields,
            requiredParameter: "non-empty array",
         },
      );
   }
};

/**
 * Creates a middleware that validates whether
 * all required fields are present in the request body.
 *
 * @param {string[]} fields
 * @returns {import("express").RequestHandler}
 */
const requireFields = (fields) => {
   assertFieldArray(fields);

   return (req, _, next) => {
      const { body } = req;

      const missingFields = [];

      for (const field of fields) {
         if (body[field] === undefined) {
            missingFields.push(field);
         }
      }

      if (missingFields.length > 0) {
         return next(
            ValidationError.invalidField(
               "Missing required field(s)",
               "MISSING_REQUIRED_FIELDS",
               {
                  requiredFields: fields,
                  missingFields,
                  providedFields: Object.keys(body),
               },
            ),
         );
      }

      next();
   };
};

/**
 * Creates a middleware that validates whether
 * forbidden fields are absent from the request body.
 *
 * @param {string[]} fields
 * @returns {import("express").RequestHandler}
 */
const forbidFields = (fields) => {
   assertFieldArray(fields);

   return (req, _, next) => {
      const { body } = req;

      const forbiddenFields = [];

      for (const field of fields) {
         if (body[field] !== undefined) {
            forbiddenFields.push(field);
         }
      }

      if (forbiddenFields.length > 0) {
         return next(
            ValidationError.invalidField(
               "Forbidden field(s) detected",
               "FORBIDDEN_FIELDS",
               {
                  forbiddenFields,
                  providedFields: Object.keys(body),
               },
            ),
         );
      }

      next();
   };
};

/**
 * Creates a middleware that validates whether
 * only allowed fields are present in the request body.
 *
 * @param {string[]} fields
 * @returns {import("express").RequestHandler}
 */
const allowOnlyFields = (fields) => {
   assertFieldArray(fields);

   return (req, _, next) => {
      const { body } = req;

      const providedFields = Object.keys(body);

      const invalidFields = providedFields.filter((field) => !fields.includes(field));

      if (invalidFields.length > 0) {
         return next(
            ValidationError.invalidField("Invalid field(s) provided", "INVALID_FIELDS", {
               allowedFields: fields,
               invalidFields,
               providedFields,
            }),
         );
      }

      next();
   };
};

/**
 * Creates a middleware that validates whether
 * at least one field from the provided list
 * exists in the request body.
 *
 * @param {string[]} fields
 * @returns {import("express").RequestHandler}
 */
const requireAtLeastOneField = (fields) => {
   assertFieldArray(fields);

   return (req, _, next) => {
      const { body } = req;

      const providedFields = Object.keys(body);

      const hasAtLeastOneField = fields.some((field) => body[field] !== undefined);

      if (!hasAtLeastOneField) {
         return next(
            ValidationError.invalidField(
               "At least one required field must be provided",
               "MISSING_AT_LEAST_ONE_FIELD",
               {
                  candidateFields: fields,
                  providedFields,
               },
            ),
         );
      }

      next();
   };
};

/**
 * Creates a middleware that validates field types
 * in the request body.
 *
 * @param {{
 *    field: string,
 *    type: "string" | "number" | "boolean" | "object" | "array"
 * }[]} fieldConfigs
 *
 * @returns {import("express").RequestHandler}
 */
const validateFieldTypes = (fieldConfigs) => {
   const allowedTypes = ["string", "number", "boolean", "object", "array"];

   if (!Array.isArray(fieldConfigs) || fieldConfigs.length === 0) {
      throw ValidationError.invalidField(
         "Invalid field configuration parameter (must be a non-empty array)",
         "INVALID_FIELD_CONFIGURATION_ARRAY",
         {
            parameter: fieldConfigs,
            requiredParameter: "non-empty array",
         },
      );
   }

   for (const config of fieldConfigs) {
      if (!config || typeof config !== "object" || Array.isArray(config)) {
         throw ValidationError.invalidField(
            "Invalid field configuration object",
            "INVALID_FIELD_CONFIGURATION",
            {
               configuration: config,
            },
         );
      }

      const { field, type } = config;

      if (typeof field !== "string" || field.trim() === "") {
         throw ValidationError.invalidField("Invalid field name", "INVALID_FIELD_NAME", {
            field,
         });
      }

      if (!allowedTypes.includes(type)) {
         throw ValidationError.invalidField(
            `Unsupported field type validator: ${type}`,
            "INVALID_FIELD_TYPE_VALIDATOR",
            {
               providedType: type,
               allowedTypes,
            },
         );
      }
   }

   return (req, _, next) => {
      const { body } = req;

      const invalidFields = [];

      for (const config of fieldConfigs) {
         const { field, type } = config;

         if (body[field] === undefined) {
            continue;
         }

         const value = body[field];

         let isValid = true;

         if (type === "array") {
            isValid = Array.isArray(value);
         } else if (type === "object") {
            isValid =
               typeof value === "object" && value !== null && !Array.isArray(value);
         } else {
            isValid = typeof value === type;
         }

         if (!isValid) {
            invalidFields.push({
               field,
               expectedType: type,
               receivedType: Array.isArray(value)
                  ? "array"
                  : value === null
                    ? "null"
                    : typeof value,
               value,
            });
         }
      }

      if (invalidFields.length > 0) {
         return next(
            ValidationError.invalidField("Invalid field type(s)", "INVALID_FIELD_TYPES", {
               invalidFields,
            }),
         );
      }

      next();
   };
};

/**
 * Creates a middleware that validates whether
 * two request body fields contain equal values.
 *
 * Both fields must exist in the request body.
 *
 * @param {string} field
 * @param {string} compareField
 *
 * @returns {import("express").RequestHandler}
 */
const validateMatchingFields = (field, compareField) => {
   return (req, _, next) => {
      const { body } = req;

      if (body[field] === undefined) {
         return next(
            ValidationError.invalidField(
               `Field '${field}' is required for equality validation`,
               "FIELD_REQUIRED_FOR_COMPARISON",
               {
                  field,
                  compareField,
               },
            ),
         );
      }

      if (body[compareField] === undefined) {
         return next(
            ValidationError.invalidField(
               `Field '${compareField}' is required for equality validation`,
               "FIELD_REQUIRED_FOR_COMPARISON",
               {
                  field,
                  compareField,
               },
            ),
         );
      }

      if (body[field] !== body[compareField]) {
         return next(
            ValidationError.invalidField(
               `Fields '${field}' and '${compareField}' must be equal`,
               "FIELD_MISMATCH",
               {
                  field,
                  compareField,
               },
            ),
         );
      }

      return next();
   };
};

/**
 * Creates a middleware that validates
 * string length constraints for multiple fields.
 *
 * Example:
 *
 * validateFieldLengths([
 *    {
 *       field: "password",
 *       min: 6,
 *       max: 100,
 *    },
 *    {
 *       field: "firstName",
 *       min: 2,
 *       max: 50,
 *    },
 * ])
 *
 * Configuration errors are validated
 * during application startup.
 *
 * @param {Array<{
 *    field: string,
 *    min?: number,
 *    max?: number
 * }>} configs
 *
 * @returns {import("express").RequestHandler}
 */
const validateFieldLengths = (configs) => {
   for (const config of configs) {
      const { field, min, max } = config;

      if (min !== undefined && (!Number.isInteger(min) || min < 0)) {
         throw ValidationError.invalidField(
            `Invalid minimum length configuration for field '${field}'`,
            "INVALID_MIN_LENGTH_CONFIGURATION",
            {
               field,
               min,
            },
         );
      }

      if (max !== undefined && (!Number.isInteger(max) || max < 0)) {
         throw ValidationError.invalidField(
            `Invalid maximum length configuration for field '${field}'`,
            "INVALID_MAX_LENGTH_CONFIGURATION",
            {
               field,
               max,
            },
         );
      }

      if (min !== undefined && max !== undefined && min > max) {
         throw ValidationError.invalidField(
            `Minimum length cannot be greater than maximum length for field '${field}'`,
            "INVALID_LENGTH_CONFIGURATION",
            {
               field,
               min,
               max,
            },
         );
      }
   }

   return (req, _, next) => {
      const { body } = req;

      for (const config of configs) {
         const { field, min, max } = config;

         const value = body[field];

         if (value === undefined) {
            return next(
               ValidationError.invalidField(
                  `Field '${field}' is required for length validation`,
                  "FIELD_NOT_FOUND",
                  {
                     field,
                  },
               ),
            );
         }

         if (typeof value !== "string") {
            return next(
               ValidationError.invalidField(
                  `Field '${field}' must be a string`,
                  "INVALID_FIELD_TYPE",
                  {
                     field,
                     actualType: typeof value,
                     expectedType: "string",
                  },
               ),
            );
         }

         if (min !== undefined && value.length < min) {
            return next(
               ValidationError.invalidField(
                  `Field '${field}' must be at least ${min} characters long`,
                  "FIELD_TOO_SHORT",
                  {
                     field,
                     min,
                     actualLength: value.length,
                  },
               ),
            );
         }

         if (max !== undefined && value.length > max) {
            return next(
               ValidationError.invalidField(
                  `Field '${field}' must be at most ${max} characters long`,
                  "FIELD_TOO_LONG",
                  {
                     field,
                     max,
                     actualLength: value.length,
                  },
               ),
            );
         }
      }

      next();
   };
};

/**
 * Creates a middleware that validates
 * whether a request body field contains
 * a valid email address from an allowed domain.
 *
 * @param {string} field
 * @param {{
 *    optional?: boolean,
 * }} [options]
 *
 * @returns {import("express").RequestHandler}
 */
const validateEmailField = (field, { optional = false } = {}) => {
   return (req, _, next) => {
      const value = req.body[field];

      if (value === undefined) {
         if (optional) {
            return next();
         }

         return next(
            ValidationError.invalidField(
               `Field '${field}' is required for email validation`,
               "FIELD_NOT_FOUND",
               {
                  field,
               },
            ),
         );
      }

      if (typeof value !== "string") {
         return next(
            ValidationError.invalidField(
               `Field '${field}' must be a string`,
               "INVALID_FIELD_TYPE",
               {
                  field,
                  actualType: typeof value,
                  expectedType: "string",
               },
            ),
         );
      }

      if (!EMAIL_REGEX.test(value)) {
         return next(
            ValidationError.invalidField(
               `Field '${field}' must contain a valid email address`,
               "INVALID_EMAIL",
               {
                  field,
                  value,
               },
            ),
         );
      }

      const domain = value.split("@")[1].toLowerCase();

      if (!COMMON_EMAIL_DOMAINS.includes(domain)) {
         return next(
            ValidationError.invalidField(
               `Email domain '${domain}' is not allowed`,
               "EMAIL_DOMAIN_NOT_ALLOWED",
               {
                  field,
                  domain,
                  allowedDomains: COMMON_EMAIL_DOMAINS,
               },
            ),
         );
      }

      return next();
   };
};

/**
 * Creates a middleware that validates
 * field types for each object
 * inside an array request body.
 *
 * @param {{
 *    field: string,
 *    type: "string" | "number" | "boolean" | "object" | "array"
 * }[]} configs
 *
 * @returns {import("express").RequestHandler}
 */
const validateArrayObjectFieldTypes = (configs) => {
   const allowedTypes = ["string", "number", "boolean", "object", "array"];

   if (!Array.isArray(configs) || configs.length === 0) {
      throw ValidationError.invalidField(
         "Invalid array object field type configuration parameter (must be a non-empty array)",
         "INVALID_ARRAY_OBJECT_FIELD_TYPE_CONFIGURATION_ARRAY",
         {
            parameter: configs,
            requiredParameter: "non-empty array",
         },
      );
   }

   for (const config of configs) {
      if (!config || typeof config !== "object" || Array.isArray(config)) {
         throw ValidationError.invalidField(
            "Invalid array object field type configuration",
            "INVALID_ARRAY_OBJECT_FIELD_TYPE_CONFIGURATION",
            {
               configuration: config,
            },
         );
      }

      const { field, type } = config;

      if (typeof field !== "string" || field.trim() === "") {
         throw ValidationError.invalidField("Invalid field name", "INVALID_FIELD_NAME", {
            field,
         });
      }

      if (!allowedTypes.includes(type)) {
         throw ValidationError.invalidField(
            `Unsupported field type validator: ${type}`,
            "INVALID_FIELD_TYPE_VALIDATOR",
            {
               providedType: type,
               allowedTypes,
            },
         );
      }
   }

   return (req, _, next) => {
      const { body } = req;

      const invalidObjects = [];

      body.forEach((object, index) => {
         const invalidFields = [];

         for (const config of configs) {
            const { field, type } = config;

            const value = object[field];

            if (value === undefined) {
               continue;
            }

            let isValid = true;

            if (type === "array") {
               isValid = Array.isArray(value);
            } else if (type === "object") {
               isValid =
                  typeof value === "object" && value !== null && !Array.isArray(value);
            } else {
               isValid = typeof value === type;
            }

            if (!isValid) {
               invalidFields.push({
                  field,
                  expectedType: type,
                  receivedType: Array.isArray(value)
                     ? "array"
                     : value === null
                       ? "null"
                       : typeof value,
                  value,
               });
            }
         }

         if (invalidFields.length > 0) {
            invalidObjects.push({
               index,
               invalidFields,
            });
         }
      });

      if (invalidObjects.length > 0) {
         return next(
            ValidationError.invalidField("Invalid field type(s)", "INVALID_FIELD_TYPES", {
               invalidObjects,
            }),
         );
      }

      next();
   };
};

/**
 * Creates a middleware that validates whether
 * all objects inside an array request body
 * contain only allowed fields.
 *
 * @param {string[]} allowedFields
 *
 * @returns {import("express").RequestHandler}
 */
const allowOnlyArrayObjectFields = (allowedFields) => {
   assertFieldArray(allowedFields);

   return (req, _, next) => {
      const { body } = req;

      const invalidObjects = [];

      body.forEach((item, index) => {
         if (typeof item !== "object" || item === null || Array.isArray(item)) {
            return;
         }

         const providedFields = Object.keys(item);

         const invalidFields = providedFields.filter(
            (field) => !allowedFields.includes(field),
         );

         if (invalidFields.length > 0) {
            invalidObjects.push({
               index,
               invalidFields,
               providedFields,
            });
         }
      });

      if (invalidObjects.length > 0) {
         return next(
            ValidationError.invalidField("Invalid field(s) provided", "INVALID_FIELDS", {
               allowedFields,
               invalidObjects,
            }),
         );
      }

      next();
   };
};

/**
 * Creates a middleware that validates whether
 * all objects inside an array request body
 * contain the required fields.
 *
 * @param {string[]} requiredFields
 *
 * @returns {import("express").RequestHandler}
 */
const requireArrayObjectFields = (requiredFields) => {
   assertFieldArray(requiredFields);

   return (req, _, next) => {
      const { body } = req;

      const invalidObjects = [];

      body.forEach((item, index) => {
         if (typeof item !== "object" || item === null || Array.isArray(item)) {
            return;
         }

         const providedFields = Object.keys(item);

         const missingFields = requiredFields.filter(
            (field) => !providedFields.includes(field),
         );

         if (missingFields.length > 0) {
            invalidObjects.push({
               index,
               missingFields,
               providedFields,
            });
         }
      });

      if (invalidObjects.length > 0) {
         return next(
            ValidationError.invalidField(
               "Missing required field(s)",
               "MISSING_REQUIRED_FIELDS",
               {
                  requiredFields,
                  invalidObjects,
               },
            ),
         );
      }

      next();
   };
};

/**
 * Collection of reusable field validation middleware factories.
 *
 * Each validator returns an Express middleware function
 * that validates request body fields according to
 * a specific rule.
 */
export const FieldValidators = {
   requireFields,
   forbidFields,
   allowOnlyFields,
   allowOnlyArrayObjectFields,
   requireAtLeastOneField,
   requireArrayObjectFields,
   validateFieldTypes,
   validateArrayObjectFieldTypes,
   validateMatchingFields,
   validateFieldLengths,
   validateEmailField,
};
