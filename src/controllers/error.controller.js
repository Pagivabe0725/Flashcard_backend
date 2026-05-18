/**
 * Global Express error handling middleware.
 *
 * Handles both operational and unexpected errors:
 * - Operational errors return structured error responses.
 * - Unexpected errors are logged and hidden in production.
 *
 * Development mode includes additional debugging information.
 *
 * @param {Error & {
 *    statusCode?: number,
 *    isOperational?: boolean,
 *    code?: string,
 *    data?: unknown,
 *    entity?: string
 * }} error - The thrown application error.
 *
 * @param {import("express").Request} req - Express request object.
 * @param {import("express").Response} res - Express response object.
 * @param {import("express").NextFunction} next - Express next middleware function.
 *
 * @returns {void}
 */
export const errorHandler = (error, req, res, next) => {
   const isDev = process.env.NODE_ENV === "development";

   const status = error.statusCode ?? 500;

   const isOperational = error.isOperational === true;

   if (!isOperational) {
      console.error(error);

      return res.status(500).json({
         message: "Internal Server Error",

         ...(isDev && {
            stack: error.stack,
            originalMessage: error.message,
            code: error.code,

            ...(error.data && {
               data: error.data,
            }),

            ...(error.entity && {
               entity: error.entity,
            }),
         }),
      });
   }

   const response = {
      message: error.message,

      ...(error.code && {
         code: error.code,
      }),

      statusCode: status,

      ...(error.data && {
         data: error.data,
      }),

      ...(error.entity && {
         entity: error.entity,
      }),
   };

   if (isDev) {
      response.stack = error.stack;
   }

   res.status(status).json(response);
};
