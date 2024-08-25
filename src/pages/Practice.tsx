import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Practice: React.FC = () => {
  const [text, setText] = useState<string>("");
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const navigate = useNavigate();

  const handleStartPractice = () => {
    // In a real application, you would fetch the text from your backend
    const sampleText =
      "IELTS is a standardized test designed to measure the language proficiency of people who want to study or work in environments where English is used as a language of communication. It covers four language skills – Listening, Reading, Writing, and Speaking. The IELTS test is jointly managed by the British Council, IDP: IELTS Australia and Cambridge Assessment English. It was established in 1989 and has since become one of the most widely recognized English language tests globally. IELTS is accepted by most Australian, British, Canadian, Irish, New Zealand and South African academic institutions, over 3,000 academic institutions in the United States, and various professional organizations across the world. It is also a requirement for immigration to some countries such as Australia, New Zealand and Canada. The test is designed to assess the language ability of candidates who need to study or work where English is the language of communication. There are two versions of the IELTS: Academic and General Training. The Academic version is for test takers who want to study at higher education or professional registration level, while the General Training version is for those who want to migrate to an English-speaking country or train or study at below degree level.";
    setText(sampleText);
  };

  const handleWordClick = (word: string) => {
    setSelectedWords((prev) =>
      prev.includes(word) ? prev.filter((w) => w !== word) : [...prev, word]
    );
  };

  const handleSubmitScore = () => {
    navigate("/results", { state: { selectedWords } });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-500 p-4">
      <div className="bg-white bg-opacity-90 p-8 rounded-xl shadow-2xl w-full max-w-4xl flex flex-col">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          雅思练习
        </h1>
        {!text ? (
          <button
            onClick={handleStartPractice}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            开始练习
          </button>
        ) : (
          <div className="flex flex-col flex-grow">
            <div className="mb-4 p-4 border border-gray-300 rounded-md bg-gray-50 overflow-y-auto flex-grow">
              {text.split(" ").map((word, index) => (
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
              onClick={handleSubmitScore}
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              提交评分
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Practice;
