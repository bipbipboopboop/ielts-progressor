import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { collection, query, where, orderBy, limit } from "firebase/firestore";
import { auth, firestore } from "../services/firebase";

interface Word {
  word: string;
  meaning: string;
}

interface ResultsData {
  id: string;
  score: number;
  unkown_words: string[];
  suggested_words: Word[];
  text: string;
  completed: boolean;
}

const Results: React.FC = () => {
  const [user, userLoading, userError] = useAuthState(auth);
  const navigate = useNavigate();

  const resultsQuery = user
    ? query(
        collection(firestore, `accounts/${user.uid}/generatedText`),
        where("completed", "==", true),
        orderBy("createdAt", "desc"),
        limit(1)
      )
    : null;

  const [resultsData, resultsLoading, resultsError] =
    useCollectionData(resultsQuery);

  const handleTryAgain = () => {
    navigate("/practice");
  };

  if (userLoading || resultsLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-500">
        <div className="text-white text-2xl">加载中...</div>
      </div>
    );
  }

  if (
    userError ||
    resultsError ||
    !user ||
    !resultsData ||
    resultsData.length === 0
  ) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-500">
        <div className="text-white text-2xl">加载数据时出错。请稍后再试。</div>
      </div>
    );
  }

  const data = resultsData[0] as ResultsData;
  console.log({ data });

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-500 p-4">
      <div className="bg-white bg-opacity-90 p-8 rounded-xl shadow-2xl w-full max-w-2xl overflow-y-auto">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          您的雅思成绩
        </h1>
        <div className="text-center mb-6">
          <p className="text-6xl font-bold text-indigo-600">{data.score}</p>
        </div>
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          您不熟悉的单词：
        </h2>
        <ul className="mb-6 list-disc list-inside">
          {data.unkown_words.map((word, index) => (
            <li key={index} className="text-gray-600 mb-2">
              <span className="font-semibold">{word}</span>
            </li>
          ))}
        </ul>
        {data.suggested_words && data.suggested_words.length > 0 && (
          <>
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              建议学习的单词：
            </h2>
            <ul className="mb-6 list-disc list-inside">
              {data.suggested_words.map((word, index) => (
                <li key={index} className="text-gray-600 mb-2">
                  <span className="font-semibold">{word.word}</span>:{" "}
                  {word.meaning}
                </li>
              ))}
            </ul>
          </>
        )}
        <button
          onClick={handleTryAgain}
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          再试一次
        </button>
      </div>
    </div>
  );
};

export default Results;
