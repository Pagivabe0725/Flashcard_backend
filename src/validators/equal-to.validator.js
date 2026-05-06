/**
 * Creates a validator that checks whether a field value matches another field in the request body.
 *
 * Commonly used for confirming fields like passwords (e.g. password confirmation).
 *
 * @param {string} field - The name of the field in `req.body` to compare against.
 * @param {string} [message="Fields do not match"] - Error message thrown when values do not match.
 * @returns {(value: unknown, meta: { req: { body: Record<string, unknown> } }) => boolean} Validator function.
 * @throws {Error} Throws the provided message if the values are not equal.
 */
export const equalTo = (field, message = "Fields do not match") => {
   /**
    * Compares the current value with another field from the request body.
    *
    * @param {unknown} value - The value of the current field.
    * @param {{ req: { body: Record<string, unknown> } }} meta - Validation context containing the request object.
    * @returns {boolean} Returns true if values match.
    * @throws {Error} Throws an error if the values differ.
    */
   return (value, { req }) => {
      if (value !== req.body[field]) {
         throw new Error(message);
      }
      return true;
   };
};
