import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface LocationState {
  selectedWords: string[];
}

const Results: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;

  // In a real application, you would calculate the score based on the selected words
  const mockScore = 7.5;

  const handleTryAgain = () => {
    navigate("/practice");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-500 p-4">
      <div className="bg-white bg-opacity-90 p-8 rounded-xl shadow-2xl w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Your IELTS Score
        </h1>
        <div className="text-center mb-6">
          <p className="text-6xl font-bold text-indigo-600">
            {mockScore.toFixed(1)}
          </p>
        </div>
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          Words you didn't know:
        </h2>
        <ul className="mb-6 list-disc list-inside">
          {state?.selectedWords.map((word, index) => (
            <li key={index} className="text-gray-600">
              {word}
            </li>
          ))}
        </ul>
        <button
          onClick={handleTryAgain}
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Try Again
        </button>
      </div>
    </div>
  );
};

export default Results;
