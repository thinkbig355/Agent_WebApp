import { useState } from "react";
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
                onClick={() => {}}
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
            
            <div className="bg-rag-50 rounded-lg p-4 border border-rag-200">
              <h4 className="font-medium text-rag-900 mb-2">Document Processing Logs:</h4>
              <ul className="space-y-1">
                <li className="text-sm text-rag-600">
                  Placeholder for logs
                </li>
              </ul>
            </div>
            
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              <textarea
                placeholder="Enter your question here..."
                disabled={loading}
                className="w-full min-h-[120px] p-4 rounded-lg border border-rag-200 
                         bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 
                         focus:ring-rag-900 focus:border-transparent resize-none
                         transition-all duration-200 ease-in-out
                         disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-6 py-3 bg-rag-900 text-white rounded-lg
                         hover:bg-rag-800 transition-all duration-200 ease-in-out
                         disabled:opacity-50 disabled:cursor-not-allowed
                         focus:outline-none focus:ring-2 focus:ring-rag-900 focus:ring-offset-2"
              >
                Ask Question
              </button>
            </form>
            
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white/70 backdrop-blur-sm rounded-lg p-6 space-y-4"
              >
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-rag-900">Answer</h3>
                  <p className="text-rag-700 leading-relaxed">Placeholder for answer</p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rag;
