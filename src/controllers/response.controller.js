/**
 * Middleware that sends a standardized HTTP JSON response.
 *
 * Builds the final API response object using values
 * stored in `res.locals` by previous middleware or controllers.
 *
 * Default values:
 * - status: 200
 * - message: "Success"
 * - result: null
 *
 * Optional values:
 * - meta
 *
 * @param {import("express").Request} _req - Unused Express request object.
 * @param {import("express").Response} res - Express response object.
 *
 * @returns {void}
 */
export const handleResponse = (_req, res) => {
   const status = res.locals.status ?? 200;

   const message = res.locals.message ?? "Success";

   const result = res.locals.result ?? null;

   const meta = res.locals.meta ?? null;

   res.status(status).json({
      message,
      result,

      ...(meta && { meta }),
   });
};
