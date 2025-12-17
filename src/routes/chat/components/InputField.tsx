import { Send, Square } from "lucide-react";
import Questions from "./questions/Questions";

const InputField = ({
  input,
  setInput,
  isLoading,
  handleSubmit,
  handleStop,
  handleQuestionClick,
}: {
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  handleStop: () => void;
  handleQuestionClick: (question: string) => void;
}) => {
  return (
    <div className=" p-2 border-2 border-[#f1f1f1] mx-auto rounded-xl w-full md:w-2xl bg-[#F5F5F5]">
      <form
        onSubmit={handleSubmit}
        className="flex border items-center justify-between border-[#F5F5F5] bg-white text-gray-900 p-4  rounded-2xl"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about Buddhist texts..."
          className="  w-full  focus:outline-none"
          disabled={isLoading}
        />
        <button
          type={isLoading ? "button" : "submit"}
          onClick={isLoading ? handleStop : undefined}
          disabled={!input.trim() && !isLoading}
          className={`p-2 rounded transition-colors ${
            isLoading
              ? "text-[#3f3f3f]"
              : "text-[#292929] disabled:opacity-50 disabled:cursor-not-allowed"
          }`}
        >
          {isLoading ? (
            <Square size={20} fill="currentColor" />
          ) : (
            <Send size={20} />
          )}
        </button>
      </form>
      <Questions onQuestionClick={handleQuestionClick} />
    </div>
  );
};

export default InputField;
