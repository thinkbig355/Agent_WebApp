
import { motion } from "framer-motion";
import type { ResultData } from "./RagSystem";

interface ResultDisplayProps {
  result: ResultData;
}

const ResultDisplay = ({ result }: ResultDisplayProps) => {
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

export default ResultDisplay;
