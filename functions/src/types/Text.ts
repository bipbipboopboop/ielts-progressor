export interface GeneratedText {
  id: string;
  text: string;
  unkown_words: string[];
  suggested_words: string[];
  score: number;
  uid: string;
  createdAt: number;
  completed: boolean;
}
