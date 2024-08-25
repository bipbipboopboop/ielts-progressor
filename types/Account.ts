import { UserCredential } from "firebase/auth";
import { Vocabulary } from "./Word";

export interface Account extends UserCredential {
  score: number;
  unknownWords: Vocabulary[];
}
