import React, { useRef } from "react";
import { FaSquare } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { CiLocationArrow1 } from "react-icons/ci";

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
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="w-screen md:max-w-3xl">
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="flex flex-col items-center justify-between border rounded-4xl shadow-xs bg-[#ffffff] text-gray-900 p-4 w-full"
      >
        <textarea
          value={input}
          rows={3}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              !e.shiftKey &&
              !e.nativeEvent.isComposing
            ) {
              e.preventDefault();

              if (isLoading) {
                handleStop();
                return;
              }

              if (input.trim()) {
                formRef.current?.requestSubmit();
              }
            }
          }}
          placeholder="Ask a question about Buddhist texts..."
          className="w-full p-2 focus:outline-none resize-none"
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
            {isLoading ? (
              <FaSquare size={20} fill="currentColor" />
            ) : (
              <CiLocationArrow1
                size={20}
                className="group-hover:rotate-45 text-faded-grey transition-transform duration-300"
              />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default InputField;
