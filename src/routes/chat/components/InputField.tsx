import { Send, Square } from "lucide-react";
import { Button } from "@/components/ui/button";

const InputField = ({
  input,
  setInput,
  isLoading,
  handleSubmit,
  handleStop,
}: {
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  handleStop: () => void;
}) => {
  return (
    <div className="  pt-2 px-2 border-t-2 border-x-2 border-[#f1f1f1] mx-auto rounded-t-xl w-screen md:max-w-3xl bg-[#F5F5F5]">
      <form
        onSubmit={handleSubmit}
        className="flex shadow flex-col border items-center justify-between border-[#ffffff] bg-[#ffffff] text-gray-900 p-4 w-full rounded-t-2xl  md:rounded-2xl"
      >
        <textarea
          value={input}
          rows={3}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about Buddhist texts..."
          className="  w-full focus:outline-none resize-none"
          disabled={isLoading}
        />
        <div className="flex justify-end w-full">
          <Button
            variant="outline"
            size="icon"
            onClick={isLoading ? handleStop : undefined}
            className="cursor-pointer text-faded-grey"
            disabled={!input.trim() && !isLoading}
          >
            {isLoading ? (
              <Square size={20} fill="currentColor" />
            ) : (
              <Send size={20} />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default InputField;
