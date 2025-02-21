
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface QuestionInputProps {
  onSubmit: (question: string) => Promise<void>;
  disabled?: boolean;
}

const QuestionInput = ({ onSubmit, disabled }: QuestionInputProps) => {
  const [question, setQuestion] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim()) {
      await onSubmit(question.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Enter your question here..."
        disabled={disabled}
        className="w-full min-h-[120px] p-4 rounded-lg border border-rag-200 
                 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 
                 focus:ring-rag-900 focus:border-transparent resize-none
                 transition-all duration-200 ease-in-out
                 disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={disabled || !question.trim()}
        className="w-full sm:w-auto px-6 py-3 bg-rag-900 text-white rounded-lg
                 hover:bg-rag-800 transition-all duration-200 ease-in-out
                 disabled:opacity-50 disabled:cursor-not-allowed
                 focus:outline-none focus:ring-2 focus:ring-rag-900 focus:ring-offset-2"
      >
        {disabled ? (
          <>
            <Loader2 className="inline-block animate-spin mr-2" />
            Processing...
          </>
        ) : (
          "Ask Question"
        )}
      </button>
    </form>
  );
};

export default QuestionInput;
