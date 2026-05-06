import { HTTP_STATUS } from "../../constants/http-status.constant.js";
import { AppError } from "./appError.class.js";

export class MongoError extends AppError {
   constructor(message = "Database error", data = null, entity = null) {
      super({
         message,
         statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
         code: "DATABASE_ERROR",
         data,
         isOperational: false,
      });

      this.entity = entity;

      Error.captureStackTrace(this, this.constructor);
   }

   toJSON() {
      return {
         ...super.toJSON(),
         ...(this.entity && { entity: this.entity }),
      };
   }
}
