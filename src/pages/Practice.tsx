import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { collection, query, where, orderBy, limit } from "firebase/firestore";
import { auth, firestore } from "../services/firebase"; // Adjust this import based on your Firebase setup
import { GeneratedText } from "../types/Text";

const Practice: React.FC = () => {
  const [user, loading, error] = useAuthState(auth);
  const navigate = useNavigate();

  const [currentText, setCurrentText] = useState<GeneratedText | null>(null);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const functions = getFunctions();
  const generatePracticeText = httpsCallable(functions, "generatePracticeText");
  const processSelectedWords = httpsCallable(functions, "processSelectedWords");

  // Query for the most recent uncompleted generated text
  console.log({ user });
  const generatedTextsQuery = query(
    collection(firestore, `accounts/${user?.uid}/generatedText`),
    where("completed", "==", false),
    orderBy("createdAt", "asc"),
    limit(1)
  );

  const [generatedTexts, generatedTextsLoading] =
    useCollectionData(generatedTextsQuery);
  console.log({ generatedTexts });

  useEffect(() => {
    if (generatedTexts && generatedTexts.length > 0) {
      setCurrentText(generatedTexts[0] as GeneratedText);
    }
  }, [generatedTextsLoading]);

  const handleStartPractice = async () => {
    if (!user) return;

    setIsGenerating(true);
    try {
      const result = await generatePracticeText();
      console.log({ result });
      const newText = result.data as GeneratedText;
      setCurrentText(newText);
    } catch (error) {
      console.error("Error generating practice text:", error);
      // Handle error (show error message to user)
    } finally {
      setIsGenerating(false);
    }
  };

  const handleWordClick = (word: string) => {
    setSelectedWords((prev) =>
      prev.includes(word) ? prev.filter((w) => w !== word) : [...prev, word]
    );
  };

  const handleSubmit = async () => {
    if (!currentText || !user) return;

    setIsSubmitting(true);
    try {
      const result = await processSelectedWords({
        selectedWords: selectedWords,
        generatedTextId: currentText.id,
      });

      const { newScore, unknownWords } = result.data as {
        newScore: number;
        unknownWords: Record<string, string>;
      };

      // Navigate to results page with the new data
      navigate("/results", {
        state: {
          score: newScore,
          unknownWords: unknownWords,
          practiceText: currentText.text,
        },
      });
    } catch (error) {
      console.error("Error processing selected words:", error);
      // Handle error (show error message to user)
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || generatedTextsLoading) return <div>加载中...</div>;
  if (error) return <div>错误: {error.message}</div>;
  if (!user) {
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-500 p-4">
      <div className="bg-white bg-opacity-90 p-8 rounded-xl shadow-2xl w-full max-w-4xl flex flex-col h-[80vh]">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          雅思练习
        </h1>
        {!currentText ? (
          <button
            onClick={handleStartPractice}
            disabled={isGenerating}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isGenerating ? "生成中..." : "开始练习"}
          </button>
        ) : (
          <div className="flex flex-col flex-grow">
            <div className="mb-4 p-4 border border-gray-300 rounded-md bg-gray-50 overflow-y-auto flex-grow">
              {currentText?.text?.split(" ").map((word, index) => (
                <span
                  key={index}
                  onClick={() => handleWordClick(word)}
                  className={`cursor-pointer inline-block ${
                    selectedWords.includes(word) ? "bg-yellow-200" : ""
                  } hover:bg-yellow-100 transition-colors duration-200 mr-1 mb-1`}
                >
                  {word}
                </span>
              ))}
            </div>
            <p className="mb-4 text-sm text-gray-600">
              点击您不理解的单词。它们将被高亮显示。
            </p>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {isSubmitting ? "提交中..." : "提交评分"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Practice;
