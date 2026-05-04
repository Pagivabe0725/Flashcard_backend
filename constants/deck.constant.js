/**
 * Defines the available and allowed field sets for the Deck entity.
 *
 * Used across validation, mapping, and update logic to ensure
 * consistent handling of deck properties.
 */
export const DECK_FIELDS = {
   /** All available fields of the Deck entity. */
   ALL_FIELDS: [
      "id",
      "authorId",
      "title",
      "shortDescription",
      "fullDescription",
      "createdAt",
      "updatedAt",
      "isPublic",
      "category",
      "tags",
      "coverImageUrl",
   ],

   /** Fields required during Deck construction. */
   CONSTRUCTOR: ["id", "authorId", "title", "category"],

   /**
    * Fields allowed to be updated after creation.
    *
    * Note:
    * - `updatedAt` is typically managed by the system (repository layer),
    *   but is included here to allow controlled overrides if needed.
    */
   UPDATE: [
      "title",
      "shortDescription",
      "fullDescription",
      "updatedAt",
      "isPublic",
      "category",
      "tags",
      "coverImageUrl",
   ],
};