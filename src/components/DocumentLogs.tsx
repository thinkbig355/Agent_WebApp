
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const DocumentLogs = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  // This would be called from the parent when new logs are available
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

export default DocumentLogs;
