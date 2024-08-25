export interface GeneratedText {
  id: string;
  text: string;
  unkown_words: string[];
  suggested_words: string[];
  uid: string;
  score: number;
  createdAt: number;
  completed: boolean;
}
