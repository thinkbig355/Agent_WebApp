
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ResultData {
  answer: string;
  sources: string[];
  chunks_used: number;
}

const Rag = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResultData | null>(null);
  const { toast } = useToast();

  const handleSync = async () => {
    setLoading(true);
    try {
      const response = await fetch("/process-documents", { method: "POST" });
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Documents Synchronized",
          description: "All documents have been successfully processed.",
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Sync Failed",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuestion = async (question: string) => {
    setLoading(true);
    try {
      const response = await fetch("/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setResult(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Query Failed",
        description: error instanceof Error ? error.message : "Failed to process your question",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rag-50 to-rag-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-8 animate-fade-in">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-rag-900 mb-2">RAG System Interface</h1>
            <p className="text-rag-600">Ask questions and get AI-powered answers from your documents</p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg p-6 space-y-6 border border-rag-200">
            <div className="flex justify-end">
              <button
                onClick={handleSync}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 bg-rag-900 text-white rounded-lg 
                         hover:bg-rag-800 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Sync Documents
              </button>
            </div>
            
            <DocumentLogs />
            
            <QuestionInput onSubmit={handleQuestion} disabled={loading} />
            
            {result && <ResultDisplay result={result} />}
          </div>
        </div>
      </div>
    </div>
  );
};

// Internal Components
const DocumentLogs = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  // This would be called when new logs are available
  const updateLogs = (newLogs: string[]) => {
    setLogs(newLogs);
    setIsVisible(true);
  };

  return (
    <AnimatePresence>
      {isVisible && logs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-rag-50 rounded-lg p-4 border border-rag-200"
        >
          <h4 className="font-medium text-rag-900 mb-2">Document Processing Logs:</h4>
          <ul className="space-y-1">
            {logs.map((log, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-sm text-rag-600"
              >
                {log}
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const QuestionInput = ({ onSubmit, disabled }: { onSubmit: (question: string) => Promise<void>, disabled?: boolean }) => {
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

const ResultDisplay = ({ result }: { result: ResultData }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white/70 backdrop-blur-sm rounded-lg p-6 space-y-4"
    >
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-rag-900">Answer</h3>
        <p className="text-rag-700 leading-relaxed">{result.answer}</p>
      </div>

      <div className="space-y-2">
        <h4 className="font-medium text-rag-900">Sources</h4>
        <ul className="list-disc list-inside space-y-1">
          {result.sources.map((source, index) => (
            <li key={index} className="text-rag-600 text-sm">
              {source}
            </li>
          ))}
        </ul>
      </div>

      <p className="text-sm text-rag-500">
        Chunks used: {result.chunks_used}
      </p>
    </motion.div>
  );
};

export default Rag;
