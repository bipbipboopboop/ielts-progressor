import { Vocabulary } from "./Word";

export interface Account {
  uid: string;
  email: string | null;
  displayName: string;
  score: number;
  unknownWords: Vocabulary[];
}
