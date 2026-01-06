import { Button } from "@/components/ui/button";
import { CiLocationArrow1 } from "react-icons/ci";
import type { FormEvent } from "react";

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  handleStop: () => void;
  formRef?: React.RefObject<HTMLFormElement>;
  placeholder?: string;
  isinitial?: boolean;
}

export const ChatInput = ({
  input,
  setInput,
  isLoading,
  handleSubmit,
  handleStop,
  formRef,
  placeholder = "Ask a question about Buddhist texts...",
  isinitial = false,
}: ChatInputProps) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();

      if (isLoading) {
        handleStop();
        return;
      }

      if (input.trim()) {
        formRef?.current?.requestSubmit();
      }
    }
  };

  const TextAreaComponent = (
    <>
      <textarea
        value={input}
        rows={3}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full p-1 focus:outline-none resize-none"
        disabled={isLoading}
      />

      <div className="flex justify-end w-full">
        <Button
          type={isLoading ? "button" : "submit"}
          variant="outline"
          size="icon"
          onClick={isLoading ? handleStop : undefined}
          className="cursor-pointer text-faded-grey group rounded-full hover:bg-background"
          disabled={!input.trim() && !isLoading}
        >
          <CiLocationArrow1
            size={20}
            className="group-hover:rotate-45 text-faded-grey transition-transform duration-300"
          />
        </Button>
      </div>
    </>
  );

  return (
    <div className="w-full flex justify-center bg-white">
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className={
          isinitial
            ? "flex flex-col items-center justify-between border rounded-3xl w-xl md:w-xl lg:w-3xl p-4 shadow-xs"
            : "w-full max-w-3xl px-4"
        }
      >
        {isinitial ? (
          TextAreaComponent
        ) : (
          <div className="flex flex-col items-center justify-between border rounded-3xl bg-white p-4 w-full">
            {TextAreaComponent}
          </div>
        )}
      </form>
    </div>
  );
};
