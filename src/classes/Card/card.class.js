import { CARD_FIELDS } from "../../constants/card.constant.js";

import { ClassError } from "../Error/classError.class.js";

import { CardSide } from "./cardSide.class.js";

export class Card {
   id;
   deckId;
   createdAt;
   updatedAt;
   front;
   back;

   /**
    * Creates a Card entity.
    *
    * @param {object} props
    * @param {string|import("mongodb").ObjectId} [props.id]
    * @param {string|import("mongodb").ObjectId} props.deckId
    * @param {Date} [props.createdAt]
    * @param {Date} [props.updatedAt]
    * @param {object|CardSide} props.front
    * @param {object|CardSide} props.back
    */
   constructor(props) {
      Card.validate(props);

      const {
         id,
         deckId,
         createdAt = new Date(),
         updatedAt = new Date(),
         front,
         back,
      } = props;

      this.id = id;

      this.deckId = deckId;

      this.createdAt = createdAt;

      this.updatedAt = updatedAt;

      this.front = front instanceof CardSide ? front : new CardSide(front);

      this.back = back instanceof CardSide ? back : new CardSide(back);

      Object.freeze(this);
   }

   /**
    * Validates a Card payload.
    *
    * @param {object} props
    *
    * @throws {ClassError}
    */
   static validate(props) {
      if (!props || typeof props !== "object") {
         throw ClassError.invalid("Invalid card payload", null, "Card");
      }

      for (const field of CARD_FIELDS.CONSTRUCTOR) {
         if (props[field] === undefined) {
            throw ClassError.required(`${field} is required`, null, "Card");
         }
      }

      try {
         new CardSide(props.front);

         new CardSide(props.back);
      } catch (err) {
         throw err;
      }

      if (
         props.createdAt &&
         (!(props.createdAt instanceof Date) || Number.isNaN(props.createdAt.getTime()))
      ) {
         throw ClassError.invalid("createdAt must be a valid Date", null, "Card");
      }

      if (
         props.updatedAt &&
         (!(props.updatedAt instanceof Date) || Number.isNaN(props.updatedAt.getTime()))
      ) {
         throw ClassError.invalid("updatedAt must be a valid Date", null, "Card");
      }
   }

   /**
    * Converts the entity to a plain JSON object.
    *
    * @returns {object}
    */
   toJSON() {
      return {
         id: this.id,
         deckId: this.deckId,
         createdAt: this.createdAt,
         updatedAt: this.updatedAt,
         front: this.front.toJSON(),
         back: this.back.toJSON(),
      };
   }
}
