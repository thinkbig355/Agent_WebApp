import { useState, useRef, useEffect } from "react";
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

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleVoiceRecording = async () => {
    try {
      if (isRecording) {
        stopRecording();
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });
      
      streamRef.current = stream;
      setIsRecording(true);
      addProcessLog("Started voice recording", "info");

      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      analyserRef.current = analyser;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        addProcessLog("Processing audio...", "info");
        
        setTimeout(() => {
          addProcessLog("Voice processed successfully!", "success");
          setIsProcessing(false);
          setInputText(prev => prev + " [Voice input processed]");
        }, 1500);
      };

      mediaRecorder.start(100);
      startSilenceDetection();

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Recording Failed",
        description: "Could not access microphone",
      });
      setIsRecording(false);
    }
  };

  const startSilenceDetection = () => {
    if (!analyserRef.current) return;

    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    let silenceStart: number | null = null;
    const SILENCE_THRESHOLD = 10;
    const SILENCE_DURATION = 1500;

    const checkSilence = () => {
      if (!isRecording) return;

      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;

      if (average < SILENCE_THRESHOLD) {
        if (!silenceStart) silenceStart = Date.now();
        else if (Date.now() - silenceStart > SILENCE_DURATION) {
          stopRecording();
          return;
        }
      } else {
        silenceStart = null;
      }

      silenceTimeoutRef.current = setTimeout(checkSilence, 100);
    };

    checkSilence();
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    setIsRecording(false);
    analyserRef.current = null;
    streamRef.current = null;
  };

  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, []);

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
              <motion.button
                onClick={handleVoiceRecording}
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
              <AnimatePresence mode="popLayout">
                {processLogs.map((log) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, height: 0, y: -20 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0, y: 20 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className={`mb-2 p-3 rounded-lg shadow-sm ${
                      log.type === "error"
                        ? "bg-red-100 text-red-700 border-l-4 border-red-500"
                        : log.type === "success"
                        ? "bg-green-100 text-green-700 border-l-4 border-green-500"
                        : "bg-blue-100 text-blue-700 border-l-4 border-blue-500"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{log.message}</span>
                      <span className="text-xs opacity-75 font-mono">
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
