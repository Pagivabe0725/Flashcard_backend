/**
 * Validation schema used when creating a card.
 */
export const CREATE_CARD_SCHEMA = {
   allowedFields: ["deckId", "front", "back"],

   requiredFields: ["deckId", "front", "back"],

   fieldTypes: [
      {
         field: "deckId",
         type: "string",
      },
      {
         field: "front",
         type: "object",
      },
      {
         field: "back",
         type: "object",
      },
   ],
};

/**
 * Validation schema used when updating a single card.
 */
export const UPDATE_CARD_SCHEMA = {
   allowedFields: ["front", "back"],
   fieldTypes: [
      {
         field: "deckId",
         type: "string",
      },
      {
         field: "front",
         type: "object",
      },
      {
         field: "back",
         type: "object",
      },
   ],
};

/**
 * Validation schema used when updating multiple cards
 * in a single bulk operation.
 */
export const UPDATE_MANY_CARDS_SCHEMA = {
   allowedFields: ["id", "deckId", "front", "back"],

   requiredFields: ["id", "deckId"],

   fieldTypes: [
      {
         field: "id",
         type: "string",
      },
      {
         field: "deckId",
         type: "string",
      },
      {
         field: "front",
         type: "object",
      },
      {
         field: "back",
         type: "object",
      },
   ],
};
