export const mockData = {
  score: 7.5,
  unknownWords: [
    { word: "proficiency", meaning: "精通，熟练" },
    { word: "standardized", meaning: "标准化的" },
    { word: "assessment", meaning: "评估，评价" },
    { word: "immigration", meaning: "移民" },
    { word: "academic", meaning: "学术的" },
  ],
  suggestedWords: [
    { word: "eloquent", meaning: "雄辩的，有说服力的" },
    { word: "diligent", meaning: "勤奋的，勤勉的" },
    { word: "comprehensive", meaning: "全面的，综合的" },
    { word: "innovative", meaning: "创新的，革新的" },
    { word: "persistent", meaning: "坚持的，执着的" },
  ],
};

export const fetchMockData = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockData);
    }, 1000); // Simulate 1 second of network delay
  });
};
