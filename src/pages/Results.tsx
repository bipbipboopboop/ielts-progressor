import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMockData } from "../services/mockData";

interface Word {
  word: string;
  meaning: string;
}

interface MockData {
  score: number;
  unknownWords: Word[];
  suggestedWords: Word[];
}

const Results: React.FC = () => {
  const [data, setData] = useState<MockData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const result = (await fetchMockData()) as MockData;
        setData(result);
      } catch (err) {
        setError("加载数据时出错。请稍后再试。");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTryAgain = () => {
    navigate("/practice");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-500">
        <div className="text-white text-2xl">加载中...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-500">
        <div className="text-white text-2xl">{error || "数据加载失败"}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-500 p-4">
      <div className="bg-white bg-opacity-90 p-8 rounded-xl shadow-2xl w-full max-w-2xl overflow-y-auto">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          您的雅思成绩
        </h1>
        <div className="text-center mb-6">
          <p className="text-6xl font-bold text-indigo-600">
            {data.score.toFixed(1)}
          </p>
        </div>
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          您不熟悉的单词：
        </h2>
        <ul className="mb-6 list-disc list-inside">
          {data.unknownWords.map((word, index) => (
            <li key={index} className="text-gray-600 mb-2">
              <span className="font-semibold">{word.word}</span>: {word.meaning}
            </li>
          ))}
        </ul>
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          建议学习的单词：
        </h2>
        <ul className="mb-6 list-disc list-inside">
          {data.suggestedWords.map((word, index) => (
            <li key={index} className="text-gray-600 mb-2">
              <span className="font-semibold">{word.word}</span>: {word.meaning}
            </li>
          ))}
        </ul>
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
