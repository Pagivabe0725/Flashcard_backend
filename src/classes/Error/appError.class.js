import { HTTP_STATUS } from "../../constants/http-status.constant.js";

export class AppError extends Error {
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
