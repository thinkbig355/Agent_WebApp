
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProcessLog {
  id: string;
  message: string;
  type: "info" | "success" | "error";
  timestamp: Date;
}

const BrowserUse = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputText, setInputText] = useState("");
  const [processLogs, setProcessLogs] = useState<ProcessLog[]>([]);
  const { toast } = useToast();

  const handleVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsRecording(true);
      
      // Add example process log
      addProcessLog("Started voice recording", "info");
      
      // Create MediaRecorder instance
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        addProcessLog("Processing audio...", "info");
        // Here you would send the audioBlob to Whisper API
        // For now, just show a success message
        setTimeout(() => {
          addProcessLog("Voice processed successfully!", "success");
          setIsProcessing(false);
        }, 2000);
      };
      
      // Start recording
      mediaRecorder.start();
      
      // Auto-stop recording after 5 seconds of silence
      // This is a placeholder - you would implement proper silence detection
      setTimeout(() => {
        if (mediaRecorder.state === "recording") {
          mediaRecorder.stop();
          stream.getTracks().forEach(track => track.stop());
          setIsRecording(false);
        }
      }, 5000);
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Recording Failed",
        description: "Could not access microphone",
      });
      setIsRecording(false);
    }
  };

  const addProcessLog = (message: string, type: ProcessLog["type"]) => {
    setProcessLogs(prev => [
      {
        id: Date.now().toString(),
        message,
        type,
        timestamp: new Date()
      },
      ...prev
    ]);
  };

  const handleStart = () => {
    if (!inputText.trim() && !isRecording) {
      toast({
        variant: "destructive",
        title: "Input Required",
        description: "Please enter text or record your voice first",
      });
      return;
    }
    
    setIsProcessing(true);
    addProcessLog("Starting process...", "info");
    // Add more process logs as needed
    setTimeout(() => {
      addProcessLog("Process completed", "success");
      setIsProcessing(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rag-50 to-rag-100">
      <div className="max-w-4xl mx-auto pt-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg p-6 space-y-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <button
                onClick={handleVoiceRecording}
                disabled={isRecording || isProcessing}
                className={`p-4 rounded-full transition-all duration-200 ${
                  isRecording
                    ? "bg-red-500 text-white animate-pulse"
                    : "bg-rag-100 hover:bg-rag-200 text-rag-600"
                }`}
              >
                {isRecording ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
              </button>
              
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isRecording || isProcessing}
                placeholder="Type your text here or use voice input..."
                className="flex-1 min-h-[120px] p-4 rounded-lg border border-rag-200 
                         bg-white/50 backdrop-blur-sm resize-none
                         focus:outline-none focus:ring-2 focus:ring-rag-900 
                         focus:border-transparent transition-all disabled:opacity-50"
              />
            </div>
            
            <button
              onClick={handleStart}
              disabled={isProcessing || (!inputText.trim() && !isRecording)}
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
              <AnimatePresence>
                {processLogs.map((log) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className={`mb-2 p-2 rounded ${
                      log.type === "error"
                        ? "bg-red-100 text-red-700"
                        : log.type === "success"
                        ? "bg-green-100 text-green-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    <div className="flex justify-between">
                      <span>{log.message}</span>
                      <span className="text-xs opacity-75">
                        {log.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowserUse;
