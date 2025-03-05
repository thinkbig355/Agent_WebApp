import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Loader2, X, ChevronDown, ChevronUp, Play, XCircle, Code, Terminal, Zap } from "lucide-react";

const BrowserUse: React.FC = () => {
  const [tasks, setTasks] = useState<{ main_task: string; followup_task?: string }[]>([{ main_task: "" }]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const resultsContainerRef = useRef<HTMLDivElement>(null);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);

  const addTask = () => setTasks([...tasks, { main_task: "" }]);

  const handleTaskChange = (index: number, field: 'main_task' | 'followup_task', value: string) => {
    const newTasks = [...tasks];
    newTasks[index] = { ...newTasks[index], [field]: value };
    setTasks(newTasks);
  };

  const toggleFollowupTask = (index: number) => {
    setTasks(tasks.map((task, i) => i === index ? { ...task, followup_task: task.followup_task === undefined ? "" : undefined } : task));
  };

  const startTasks = useCallback(() => {
    const cleanedTasks = tasks.map(task => ({
      main_task: task.main_task.trim(),
      followup_task: task.followup_task?.trim(),
    })).filter(task => task.main_task);

    if (cleanedTasks.length === 0) {
      alert("Please enter at least one main task");
      return;
    }

    setIsProcessing(true);
    setResults([]);

    fetch("https://ushapangeni.com.np/browse/run_tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tasks: cleanedTasks }),
    })
    .then(response => response.json())
    .then(data => {
      if (data.status === "success") {
        const newEventSource = new EventSource("https://ushapangeni.com.np/browse/stream_updates");
        setEventSource(newEventSource);
      } else {
        throw new Error(data.error);
      }
    })
    .catch(error => {
      alert("Error: " + error.message);
      setIsProcessing(false);
    });
  }, [tasks]);

  useEffect(() => {
    if (!eventSource) return;

    const handleEvent = (event: MessageEvent) => {
      const data = JSON.parse(event.data);

      if (data.status === 'heartbeat') return;

      if (data.status === "progress" || data.status === "completed") {
        setResults(prevResults => {
          const existingIndex = prevResults.findIndex(r => r.task_num === data.task_num && r.type === data.type);
          return existingIndex > -1
            ? prevResults.map((r, i) => i === existingIndex ? data : r)
            : [...prevResults, data];
        });
      }

      if (data.status === "all_completed" || data.status === 'error') {
        setIsProcessing(false);
        eventSource.close();
        setEventSource(null);
        if (data.status === 'error') {
          alert("Error during task processing: " + data.error);
        }
      }
    };

    eventSource.onmessage = handleEvent;
    eventSource.onerror = () => {
      alert("EventSource failed.");
      setIsProcessing(false);
      eventSource.close();
      setEventSource(null);
    };

    return () => eventSource.close();
  }, [eventSource]);

  useEffect(() => {
    resultsContainerRef.current?.scrollTo(0, resultsContainerRef.current.scrollHeight);
  }, [results]);

  const closeBrowser = useCallback(async () => {
    try {
      const response = await fetch("https://ushapangeni.com.np/browse/close_browser", { method: "POST" });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to close browser");
      }
      if (data.status !== "success") {
        throw new Error(data.message || "Failed to close browser");
      }
      alert("Browser closed successfully");
    } catch (error: any) {
      alert("Error: " + error.message);
    }
  }, []);

  const removeTask = (index: number) => {
    if (tasks.length > 1) {
      setTasks(tasks.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1522] font-sans">
      <div className="max-w-3xl mx-auto pt-8 px-4 sm:px-6 lg:px-8 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-[#1A2233]/90 backdrop-blur-xl rounded-2xl shadow-xl border border-[#2D3A8C]/20"
        >
          <div className="p-6">
            <div className="flex items-center justify-center mb-6 space-x-2">
              <Terminal className="h-6 w-6 text-[#A5B4FC]" />
              <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#A5B4FC] to-[#818CF8]">
                Browser Automation
              </h1>
            </div>

            <div className="space-y-4">
              <div className="bg-[#2A3548] rounded-xl p-4 shadow-inner">
                <div className="flex items-center mb-3">
                  <Code className="h-4 w-4 text-[#A5B4FC] mr-1" />
                  <h2 className="text-lg font-semibold text-[#FFFFFF]">Tasks</h2>
                </div>

                <AnimatePresence>
                  {tasks.map((task, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.2 }}
                      className="bg-[#3C4A61] rounded-lg shadow-md p-3 mb-2 border-l-4 border-[#3A9BA4]"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center">
                          <div className="bg-[#1E2D4D] text-white w-6 h-6 rounded-full flex items-center justify-center mr-1 text-xs font-medium">
                            {index + 1}
                          </div>
                          <h3 className="text-sm font-medium text-[#FFFFFF]">Main Task</h3>
                        </div>
                        {tasks.length > 1 && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => removeTask(index)}
                            className="text-[#E2E8F0] hover:text-red-400 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </motion.button>
                        )}
                      </div>

                      <textarea
                        value={task.main_task}
                        onChange={(e) => handleTaskChange(index, "main_task", e.target.value)}
                        className="w-full px-3 py-2 bg-[#4A5A73] border border-[#3C4A61] rounded-lg shadow-inner text-sm text-[#E2E8F0] focus:outline-none focus:ring-1 focus:ring-[#3A9BA4] focus:border-transparent transition-all duration-200 main-task"
                        rows={2}
                        placeholder="Enter task..."
                      />

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => toggleFollowupTask(index)}
                        className="flex items-center px-3 py-1 mt-2 text-xs font-medium text-white bg-[#3A9BA4] rounded-md hover:bg-[#308C93] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#3C4A61] focus:ring-opacity-50"
                      >
                        {task.followup_task === undefined ? (
                          <>
                            <Plus className="h-3 w-3 mr-1" />
                            Add Follow-up
                          </>
                        ) : (
                          <>
                            <ChevronUp className="h-3 w-3 mr-1" />
                            Remove Follow-up
                          </>
                        )}
                      </motion.button>

                      <AnimatePresence>
                        {task.followup_task !== undefined && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="mt-2 overflow-hidden"
                          >
                            <div className="pl-6 border-l-2 border-dashed border-[#3C4A61]">
                              <textarea
                                value={task.followup_task}
                                onChange={(e) => handleTaskChange(index, "followup_task", e.target.value)}
                                className="w-full px-2 py-1 bg-[#4A5A73]/70 border border-[#3C4A61] rounded-sm shadow-sm text-xs text-[#E2E8F0] focus:outline-none focus:ring-1 focus:ring-[#3A9BA4] focus:border-transparent transition-all duration-200 followup-task"
                                rows={1}
                                placeholder="Follow-up..."
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </AnimatePresence>

                <div className="flex justify-between items-center mt-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={addTask}
                    className="flex items-center px-4 py-1.5 text-white bg-[#3A9BA4] rounded-md hover:bg-[#308C93] shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#3C4A61] focus:ring-offset-2"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Task
                  </motion.button>

                  <div className="flex space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={startTasks}
                      disabled={isProcessing}
                      className="flex items-center px-4 py-2 bg-[#1E2D4D] text-white rounded-md hover:bg-[#2D3E5D] shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#3A9BA4] focus:ring-offset-2"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-1" />
                          Execute
                        </>
                      )}
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={closeBrowser}
                      className="flex items-center px-3 py-2 text-white bg-red-500 rounded-md hover:bg-red-600 shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Close
                    </motion.button>
                  </div>
                </div>
              </div>

              <div className="bg-[#2A3548] rounded-xl p-4 shadow-inner">
                <div className="flex items-center mb-3">
                  <Zap className="h-4 w-4 text-[#A5B4FC] mr-1" />
                  <h3 className="text-lg font-semibold text-[#FFFFFF]">Results</h3>
                </div>

                <div
                  ref={resultsContainerRef}
                  className="bg-[#3C4A61] rounded-lg p-3 max-h-60 overflow-y-auto shadow-inner border border-[#2D3A8C] font-mono text-xs text-[#E2E8F0]"
                >
                  <AnimatePresence>
                    {results.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-4 text-gray-500 flex flex-col items-center"
                      >
                        {isProcessing ? (
                          <>
                            <div className="w-6 h-6 border-4 border-[#3C4A61] border-t-[#3A9BA4] rounded-full animate-spin mb-2"></div>
                            <span className="text-sm text-[#A9B4C2]">Processing...</span>
                          </>
                        ) : (
                          <>
                            <Terminal className="h-8 w-8 text-[#66788A] mb-1" />
                            <span className="text-sm text-[#A9B4C2]">No results yet.</span>
                          </>
                        )}
                      </motion.div>
                    ) : (
                      results.map((result, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                          className={`mb-2 p-3 rounded-lg shadow-sm text-xs ${
                            result.status === 'progress'
                              ? 'bg-[#4A5A73] border-l-4 border-[#3A9BA4]'
                              : 'bg-[#3C4A61] border-l-4 border-green-500'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <div className={`w-2 h-2 rounded-full mr-1 ${
                                result.status === 'progress' ? 'bg-[#3A9BA4] animate-pulse' : 'bg-green-500'
                              }`}></div>
                              <span className="font-medium text-sm text-[#FFFFFF]">
                                Task {result.task_num} {result.type === 'followup' ?
                                  <span className="text-[10px] bg-[#4A5A73] text-[#E2E8F0] px-1 py-0.5 rounded-full ml-1">Follow-up</span> :
                                  ''
                                }
                              </span>
                            </div>
                            <span className={`text-[10px] px-1 py-0.5 rounded-full ${
                              result.status === 'progress'
                                ? 'bg-[#3A9BA4]/20 text-[#3A9BA4]'
                                : 'bg-green-100 text-green-700'
                            }`}>
                              {result.status === "progress" ? "In Progress" : "Completed"}
                            </span>
                          </div>
                          {result.result && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.1 }}
                              className="mt-1 text-xs text-[#E2E8F0] bg-[#4A5A73] p-1 rounded border border-[#3C4A61] overflow-x-auto"
                            >
                              {result.result}
                            </motion.div>
                          )}
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BrowserUse;