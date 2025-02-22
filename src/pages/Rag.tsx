
import { useState } from "react";
import { Loader2, FileText, Send, RefreshCw } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-b from-rag-50 to-rag-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-rag-900">RAG System Interface</h1>
          <p className="text-lg text-rag-600">Ask questions about your documents and get AI-powered answers</p>
        </div>

        <div className="grid gap-6 md:grid-cols-5">
          {/* Left Panel - Document Management */}
          <div className="md:col-span-2 space-y-4">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-rag-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-rag-900">Documents</h2>
                <button
                  onClick={() => {}}
                  disabled={loading}
                  className="inline-flex items-center px-3 py-2 bg-rag-900 text-white rounded-lg 
                           hover:bg-rag-800 transition-colors disabled:opacity-50 text-sm"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sync
                </button>
              </div>
              
              <div className="space-y-3">
                <div className="p-3 bg-rag-50 rounded-lg border border-rag-200">
                  <div className="flex items-center text-rag-600">
                    <FileText className="h-5 w-5 mr-2" />
                    <span>Document_1.pdf</span>
                  </div>
                </div>
                <div className="p-3 bg-rag-50 rounded-lg border border-rag-200">
                  <div className="flex items-center text-rag-600">
                    <FileText className="h-5 w-5 mr-2" />
                    <span>Document_2.pdf</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Processing Logs */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-rag-200">
              <h2 className="text-xl font-semibold text-rag-900 mb-4">Processing Logs</h2>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                <div className="p-2 bg-blue-50 text-blue-700 rounded border-l-4 border-blue-500 text-sm">
                  Documents synchronized successfully
                </div>
                <div className="p-2 bg-green-50 text-green-700 rounded border-l-4 border-green-500 text-sm">
                  Index updated - Ready for queries
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Q&A Interface */}
          <div className="md:col-span-3 bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-rag-200">
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="question" className="block text-sm font-medium text-rag-700">
                  Your Question
                </label>
                <textarea
                  id="question"
                  placeholder="Enter your question here..."
                  disabled={loading}
                  className="w-full min-h-[120px] p-4 rounded-lg border border-rag-200 
                           bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 
                           focus:ring-rag-900 focus:border-transparent resize-none
                           transition-all duration-200 ease-in-out
                           disabled:opacity-50"
                />
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-6 py-3 bg-rag-900 text-white rounded-lg
                           hover:bg-rag-800 transition-all duration-200 ease-in-out
                           disabled:opacity-50 disabled:cursor-not-allowed
                           focus:outline-none focus:ring-2 focus:ring-rag-900 focus:ring-offset-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      Ask Question
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Answer Section */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mt-8 space-y-6"
                >
                  <div className="bg-rag-50 rounded-lg p-6 space-y-4">
                    <h3 className="text-xl font-semibold text-rag-900">Answer</h3>
                    <p className="text-rag-700 leading-relaxed">
                      This is a placeholder answer that would be replaced with the actual AI-generated response. 
                      The answer would be formatted and displayed here with proper spacing and styling for readability.
                    </p>
                    
                    <div className="pt-4 border-t border-rag-200">
                      <h4 className="text-sm font-medium text-rag-900 mb-2">Sources</h4>
                      <ul className="space-y-1 text-sm text-rag-600">
                        <li className="flex items-center">
                          <FileText className="h-4 w-4 mr-2" />
                          Document_1.pdf - Page 12
                        </li>
                        <li className="flex items-center">
                          <FileText className="h-4 w-4 mr-2" />
                          Document_2.pdf - Page 5
                        </li>
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rag;
