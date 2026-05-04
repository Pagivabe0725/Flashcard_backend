/**
 * Defines the available and allowed field sets for the User entity.
 *
 * Used for validation, mapping, and update control across the application.
 */
export const USER_FIELDS = {
   /** All available fields of the User entity. */
   ALL_FIELDS: [
      "id",
      "email",
      "passwordHash",
      "firstName",
      "lastName",
      "learningStyle",
      "experience",
      "motivation",
      "ageGroup",
      "language",
      "aim",
      "nickName",
      "deckNumber",
      "cardNumber",
      "updatedAt",
      "createdAt",
      "lastLogin",
   ],

   /** Fields required during User creation. */
   CONSTRUCTOR: [
      "email",
      "passwordHash",
      "firstName",
      "lastName",
      "learningStyle",
      "experience",
      "motivation",
      "ageGroup",
      "language",
      "aim",
   ],

   /**
    * Fields allowed to be updated after user creation.
    *
    * Note:
    * - Includes both user-editable fields and some system-related fields.
    * - Certain fields (e.g. counters or timestamps) are typically managed
    *   by the backend rather than directly by client input.
    */
   UPDATE: [
      "email",
      "firstName",
      "lastName",
      "learningStyle",
      "experience",
      "motivation",
      "ageGroup",
      "language",
      "aim",
      "nickName",
      "passwordHash",
      "deckNumber",
      "cardNumber",
      "updatedAt",
      "lastLogin",
   ],
};