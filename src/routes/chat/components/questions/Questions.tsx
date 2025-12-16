const questions = [
  {
    id: 2,
    question: " what is self?",
  },
  {
    id: 3,
    question: "How one can attain enlightenment?",
  },
];

const Questions = ({ onQuestionClick }) => {
  const handleQuestionClick = (questionText) => {
    if (onQuestionClick) {
      onQuestionClick(questionText);
    }
  };

  const handleKeyDown = (e, questionText) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleQuestionClick(questionText);
    }
  };

  return (
    <div className="flex flex-wrap gap-3 text-sm rounded-2xl p-2">
      {questions.map((question) => (
        <button
          key={question.id}
          onClick={() => handleQuestionClick(question.question)}
          onKeyDown={(e) => handleKeyDown(e, question.question)}
          className="flex items-center border-y border-x border-[#c0c0c0] bg-white rounded border-dashed p-2 cursor-pointer"
        >
          <span>{question.question}</span>
        </button>
      ))}
    </div>
  );
};

export default Questions;
