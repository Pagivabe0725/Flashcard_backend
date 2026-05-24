export const CARD_FIELDS = {
   ALL_FIELDS: ["id", "deckId", "createdAt", "updatedAt", "front", "back"],
   CONSTRUCTOR: ["id", "deckId", "front", "back"],
   UPDATE: ["front", "back"],

   CARD_SIDE_FIELDS: [
      "text",
      "image",
      "language",
      "textVerticalAlignment",
      "textHorizontalAlignment",
   ],

   LANGUAGE_ENUM: ["hu", "en", "de", "other"],

   VERTICAL_ALIGNMENT_ENUM: ["center", "top", "bottom", "none"],

   HORIZONTAL_ALIGNMENT_ENUM: ["center", "left", "right", "justify", "none"],
};
