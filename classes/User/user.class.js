import { USER_FIELDS } from "../../constants/user.constant.js";

const requiredFields = USER_FIELDS.CONSTRUCTOR.filter(
   (element) => element !== "nickName",
);

export class User {
   constructor(props) {
      User.validate(props);

      const {
         id,
         email,
         passwordHash,
         firstName,
         lastName,
         learningStyle,
         experience,
         motivation,
         ageGroup,
         language,
         aim,
         nickName,
         deckNumber = 0,
         cardNumber = 0,
      } = props;

      this.id = id;
      this.email = email;
      this.passwordHash = passwordHash;
      this.firstName = firstName;
      this.lastName = lastName;
      this.learningStyle = learningStyle;
      this.experience = experience;
      this.motivation = motivation;
      this.ageGroup = ageGroup;
      this.language = language;
      this.aim = aim;
      this.nickName = nickName;
      this.deckNumber = deckNumber;
      this.cardNumber = cardNumber;
   }

   static validate(props) {
      for (const field of requiredFields) {
         if (props[field] === undefined || props[field] === null) {
            throw new Error(`${field} is required`);
         }
      }
   }

   getFullName() {
      return `${this.firstName} ${this.lastName}`;
   }

   toJSON() {
      return {
         id: this.id,
         email: this.email,
         firstName: this.firstName,
         lastName: this.lastName,
         learningStyle: this.learningStyle,
         experience: this.experience,
         motivation: this.motivation,
         ageGroup: this.ageGroup,
         language: this.language,
         aim: this.aim,
         nickName: this.nickName,
         deckNumber: this.deckNumber,
         cardNumber: this.cardNumber,
      };
   }
}
