import { CARD_FIELDS } from "../../constants/card.constant.js";
import { ClassError } from "../Error/classError.class.js";

export class CardSide {
   text;
   image;
   language;
   textVerticalAlignment;
   textHorizontalAlignment;

   /**
    * Creates a card side value object.
    *
    * @param {object} props
    * @param {string|null} props.text
    * @param {string|null} props.image
    * @param {string} props.language
    * @param {string} props.textVerticalAlignment
    * @param {string} props.textHorizontalAlignment
    */
   constructor(props) {
      CardSide.validate(props);

      const { text, image, language, textVerticalAlignment, textHorizontalAlignment } =
         props;

      this.text = text;
      this.image = image;
      this.language = language;
      this.textVerticalAlignment = textVerticalAlignment;

      this.textHorizontalAlignment = textHorizontalAlignment;

      Object.freeze(this);
   }

   /**
    * Validates a card side payload.
    *
    * @param {object} props
    *
    * @throws {ClassError}
    */
   static validate(props) {
      if (!props || typeof props !== "object") {
         throw ClassError.invalid("Invalid card side payload", null, "CardSide");
      }

      for (const field of CARD_FIELDS.CARD_SIDE_FIELDS) {
         if (props[field] === undefined) {
            throw ClassError.required(`${field} is required`, null, "CardSide");
         }
      }

      const { text, image, language, textVerticalAlignment, textHorizontalAlignment } =
         props;

      // At least one content source is required
      if (text == null && image == null) {
         throw ClassError.invalid(
            "Card side must contain text or image",
            null,
            "CardSide",
         );
      }

      if (text !== null && typeof text !== "string") {
         throw ClassError.invalid("text must be a string or null", null, "CardSide");
      }

      if (image !== null && typeof image !== "string") {
         throw ClassError.invalid("image must be a string or null", null, "CardSide");
      }

      if (CARD_FIELDS.LANGUAGE_ENUM.includes(language) === false) {
         throw ClassError.invalid("Invalid language", null, "CardSide");
      }

      if (CARD_FIELDS.VERTICAL_ALIGNMENT_ENUM.includes(textVerticalAlignment) === false) {
         throw ClassError.invalid("Invalid vertical alignment", null, "CardSide");
      }

      if (
         CARD_FIELDS.HORIZONTAL_ALIGNMENT_ENUM.includes(textHorizontalAlignment) === false
      ) {
         throw ClassError.invalid("Invalid horizontal alignment", null, "CardSide");
      }
   }

   /**
    * Converts the value object to a plain JSON object.
    *
    * @returns {object}
    */
   toJSON() {
      return {
         text: this.text,
         image: this.image,
         language: this.language,
         textVerticalAlignment: this.textVerticalAlignment,

         textHorizontalAlignment: this.textHorizontalAlignment,
      };
   }
}

/**
 * Ensures that:
 * - all requested cards belong to the same deck
 * - all requested cards exist
 *
 * Expects a request body in the following format:
 *
 * [
 *    {
 *       id: string,
 *       deckId: string,
 *       front?: object,
 *       back?: object,
 *    }
 * ]
 *
 * On success:
 * - attaches the target deck identifier to `res.locals.deckId`
 * - attaches the matching card entities to `res.locals.cards`
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 *
 * @returns {Promise<void>}
 */
const requireExistingCards = async (req, res, next) => {
   try {
      const requestedCardIds = [];
      const requestedDeckIds = new Set();

      for (const card of req.body) {
         requestedCardIds.push(card.id);
         requestedDeckIds.add(card.deckId);
      }

      if (requestedDeckIds.size > 1) {
         return next(
            ValidationError.invalidField(
               "Cards from multiple decks are not allowed",
               "MULTIPLE_DECKS_NOT_ALLOWED",
               {
                  deckIds: [...requestedDeckIds],
               },
            ),
         );
      }

      const deckId = [...requestedDeckIds][0];

      const db = getDb();

      const cardRepository = new CardRepository(db);

      const cards = res.locals.cards ?? (await cardRepository.findManyByDeckId(deckId));

      const existingCardIds = new Set(cards.map((card) => card.id.toString()));

      const missingCardIds = [];

      for (const cardId of requestedCardIds) {
         if (!existingCardIds.has(cardId)) {
            missingCardIds.push(cardId);
         }
      }

      if (missingCardIds.length > 0) {
         return next(
            HttpError.notFound(
               `${missingCardIds.length} requested card(s) do not exist in the specified deck`,
               {
                  deckId,
                  missingCardIds,
               },
            ),
         );
      }

      res.locals.deckId = deckId;
      res.locals.cards = cards;

      return next();
   } catch (err) {
      return next(err);
   }
};

/**
 * Ensures that the authenticated user
 * owns the deck associated with the
 * previously validated card collection.
 *
 * Requires:
 * - `res.locals.deckId`
 *
 * Reuses:
 * - `res.locals.deck` when available
 *
 * On success:
 * - attaches the deck entity to
 *   `res.locals.deck`
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 *
 * @returns {Promise<void>}
 */
const requireCardsDeckOwnership = async (req, res, next) => {
   const { userId } = req.session;
   const { deckId } = res.locals;

   try {
      const db = getDb();

      const deckRepository = new DeckRepository(db);

      const deck = res.locals.deck ?? (await deckRepository.findById(deckId));

      if (!deck) {
         return next(
            HttpError.notFound("Deck not found", {
               deckId,
            }),
         );
      }

      if (deck.authorId.toString() !== userId) {
         return next(
            HttpError.forbidden("User does not own the deck", {
               deckId,
               userId,
            }),
         );
      }

      res.locals.deck = deck;

      return next();
   } catch (err) {
      return next(err);
   }
};
