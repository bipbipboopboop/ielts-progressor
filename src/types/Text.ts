export interface GeneratedText {
  id: string;
  text: string;
  unkown_words: string[];
  suggested_words: string[];
  uid: string;
  createdAt: number;
  completed: boolean;
}
