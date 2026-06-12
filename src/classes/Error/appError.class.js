import { HTTP_STATUS } from "../../constants/http-status.constant.js";

/**
 * Base application error class used to provide
 * consistent error handling across the application.
 */
export class AppError extends Error {
   /**
    * HTTP status code associated with the error.
    *
    * @type {number}
    */
   statusCode;

   /**
    * Additional error details.
    *
    * @type {object | null}
    */
   data;

   /**
    * Application-specific error code.
    *
    * @type {string}
    */
   code;

   /**
    * Indicates whether the error is operational
    * and expected during normal application flow.
    *
    * @type {boolean}
    */
   isOperational;

   /**
    * Creates a new application error instance.
    *
    * @param {object} [options={}] - Error configuration
    * @param {string} [options.message="Internal Server Error"] - Human-readable error message
    * @param {number} [options.statusCode=HTTP_STATUS.INTERNAL_SERVER_ERROR] - Associated HTTP status code
    * @param {object | null} [options.data=null] - Additional error metadata
    * @param {string} [options.code="INTERNAL_ERROR"] - Application-specific error code
    * @param {boolean} [options.isOperational=true] - Indicates whether the error is operational
    */
   constructor({
      message = "Internal Server Error",
      statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR,
      data = null,
      code = "INTERNAL_ERROR",
      isOperational = true,
   } = {}) {
      super(message);

      this.name = this.constructor.name;

      this.statusCode = statusCode;
      this.data = data;
      this.code = code;
      this.isOperational = isOperational;

      Error.captureStackTrace(this, this.constructor);
   }

   /**
    * Serializes the error into a plain object.
    *
    * @returns {{
    *    name: string,
    *    message: string,
    *    code: string,
    *    statusCode: number,
    *    data?: object
    * }} Serializable error representation
    */
   toJSON() {
      return {
         name: this.name,
         message: this.message,
         code: this.code,
         statusCode: this.statusCode,
         ...(this.data && { data: this.data }),
      };
   }
}
