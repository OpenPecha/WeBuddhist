const questions = [
  {
    id: 1,
    question: "What is emptiness in Buddhism?",
  },
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
    <div className="flex flex-wrap gap-3 mx-auto items-center justify-center p-2">
      {questions.map((question) => (
        <button
          key={question.id}
          onClick={() => handleQuestionClick(question.question)}
          onKeyDown={(e) => handleKeyDown(e, question.question)}
          className="flex items-center border-y border-x border-faded-grey/30 bg-white rounded-2xl border-dashed p-2 cursor-pointer transition-all text-sm  hover:text-primary duration-300 hover:scale-99 text-faded-grey"
        >
          <span>{question.question}</span>
        </button>
      ))}
    </div>
  );
};

export default Questions;
