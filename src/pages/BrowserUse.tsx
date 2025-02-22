
import { useState } from "react";
import { motion } from "framer-motion";
import { Mic, MicOff, Loader2 } from "lucide-react";

const BrowserUse = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-rag-50 to-rag-100">
      <div className="max-w-4xl mx-auto pt-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg p-6 space-y-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <motion.button
                onClick={() => setIsRecording(!isRecording)}
                disabled={isProcessing}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={isRecording ? {
                  scale: [1, 1.1, 1],
                  transition: {
                    repeat: Infinity,
                    duration: 1.5,
                  }
                } : {}}
                className={`p-4 rounded-full transition-all duration-200 ${
                  isRecording
                    ? "bg-red-500 text-white shadow-lg"
                    : "bg-rag-100 hover:bg-rag-200 text-rag-600"
                }`}
              >
                {isRecording ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
              </motion.button>
              
              <textarea
                placeholder="Type your text here or use voice input..."
                disabled={isRecording || isProcessing}
                className="flex-1 min-h-[120px] p-4 rounded-lg border border-rag-200 
                         bg-white/50 backdrop-blur-sm resize-none
                         focus:outline-none focus:ring-2 focus:ring-rag-900 
                         focus:border-transparent transition-all disabled:opacity-50"
              />
            </div>
            
            <button
              onClick={() => {}}
              disabled={isProcessing}
              className="w-full py-3 bg-rag-900 text-white rounded-lg
                       hover:bg-rag-800 transition-all duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed
                       focus:outline-none focus:ring-2 focus:ring-rag-900 
                       focus:ring-offset-2"
            >
              {isProcessing ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                  Processing...
                </span>
              ) : (
                "Start"
              )}
            </button>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-rag-900">Process Logs</h3>
            <div className="bg-rag-50 rounded-lg p-4 max-h-[300px] overflow-y-auto">
              <div className="mb-2 p-3 rounded-lg shadow-sm bg-blue-100 text-blue-700 border-l-4 border-blue-500">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Placeholder for process logs</span>
                  <span className="text-xs opacity-75 font-mono">00:00:00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowserUse;
