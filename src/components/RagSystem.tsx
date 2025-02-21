
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import QuestionInput from "./QuestionInput";
import ResultDisplay from "./ResultDisplay";
import DocumentLogs from "./DocumentLogs";

export interface ResultData {
  answer: string;
  sources: string[];
  chunks_used: number;
}

const RagSystem = () => {
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

export default RagSystem;
