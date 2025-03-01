import { useState, useEffect, useRef } from "react";
import { Loader2, Check, Send, ChevronDown, Bot, User, Filter, X, ExternalLink, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Result data interface
interface ResultData {
  answer: string;
  sources: string[];
  chunks_used: number;
  niches_used?: string[];
  error?: string;
}

// Niche option interface
interface NicheOption {
  value: string;
  label: string;
}

// Message interface
interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  sources?: string[];
  niches_used?: string[];
  chunks_used?: number;
  isLoading?: boolean;
  showDetails?: boolean;
}

const Chat = () => {
  // State variables
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [availableNiches, setAvailableNiches] = useState<NicheOption[]>([]);
  const [selectedNiches, setSelectedNiches] = useState<string[]>(["all"]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "bot",
      content: "Hello! I'm your document assistant. Ask me anything about your knowledge base.",
      timestamp: new Date(),
      showDetails: false
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Fetch niches on component mount
  useEffect(() => {
    fetchNiches();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchNiches = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/get-niches");
      const data = await response.json();

      if (data.success) {
        // Create niche options with proper capitalization
        const niches = data.niches.map((niche: string) => ({
          value: niche,
          label: niche.charAt(0).toUpperCase() + niche.slice(1).replace('_', ' ')
        }));

        // Add the "All" option
        setAvailableNiches([
          { value: "all", label: "All Niches" },
          ...niches
        ]);
      } else {
        setError(data.error || "Failed to fetch niches");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching niches");
    }
  };

  const askQuestion = async () => {
    if (!question.trim()) return;

    setLoading(true);
    setError(null);

    // Generate a unique ID for this message pair
    const messageId = Date.now().toString();

    // Add user message
    const userMessage: Message = {
      id: `user-${messageId}`,
      type: 'user',
      content: question,
      timestamp: new Date()
    };

    // Add loading bot message
    const pendingBotMessage: Message = {
      id: `bot-${messageId}`,
      type: 'bot',
      content: '',
      timestamp: new Date(),
      isLoading: true,
      showDetails: false
    };

    setMessages(prev => [...prev, userMessage, pendingBotMessage]);

    // Clear input
    setQuestion("");

    try {
      const response = await fetch("http://127.0.0.1:5000/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: userMessage.content,
          selectedNiches
        }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
        // Update the pending message with error
        setMessages(prev =>
          prev.map(msg =>
            msg.id === `bot-${messageId}`
              ? {
                  ...msg,
                  content: `Error: ${data.error}`,
                  isLoading: false
                }
              : msg
          )
        );
      } else {
        // Update the pending message with the result
        setMessages(prev =>
          prev.map(msg =>
            msg.id === `bot-${messageId}`
              ? {
                  ...msg,
                  content: data.answer,
                  sources: data.sources,
                  niches_used: data.niches_used,
                  chunks_used: data.chunks_used,
                  isLoading: false,
                  showDetails: false
                }
              : msg
          )
        );
      }
    } catch (err: any) {
      const errorMessage = err.message || "An error occurred while processing your request.";
      setError(errorMessage);

      // Update the pending message with error
      setMessages(prev =>
        prev.map(msg =>
          msg.id === `bot-${messageId}`
            ? {
                ...msg,
                content: `Error: ${errorMessage}`,
                isLoading: false
              }
            : msg
        )
      );
    } finally {
      setLoading(false);
      // Focus the input field after sending
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const toggleMessageDetails = (messageId: string) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId
          ? { ...msg, showDetails: !msg.showDetails }
          : msg
      )
    );
  };

  const toggleNiche = (niche: string) => {
    setSelectedNiches(prev => {
      // If "all" is being selected, only select "all"
      if (niche === "all") {
        return ["all"];
      }

      // If we're selecting something other than "all", remove "all" from selection
      let newSelection = prev.filter(item => item !== "all");

      // Toggle the selected niche
      if (newSelection.includes(niche)) {
        newSelection = newSelection.filter(item => item !== niche);
      } else {
        newSelection.push(niche);
      }

      // If nothing is selected, default to "all"
      if (newSelection.length === 0) {
        return ["all"];
      }

      return newSelection;
    });
  };

  const getSelectedNichesText = () => {
    if (selectedNiches.includes("all")) {
      return "All Niches";
    }

    if (selectedNiches.length <= 2) {
      return selectedNiches
        .map(niche => availableNiches.find(n => n.value === niche)?.label)
        .filter(Boolean) // Ensure no undefined values
        .join(", ");
    }

    return `${selectedNiches.length} niches selected`;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      askQuestion();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    setQuestion(textarea.value);

    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';

    // Set the height to scrollHeight to fit content
    const newHeight = Math.min(textarea.scrollHeight, 150);
    textarea.style.height = `${newHeight}px`;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#FFF5F5] via-[#B8C5E9] to-[#5B6BA9]">
      {/* Header  */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-[#B8C5E9]/50 py-4 px-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
            <div className="bg-[#F0F4FF] p-2 rounded-full">
              <Bot className="h-6 w-6 text-[#5B6BA9]" />
          </div>
          <h1 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#1E2A5A] to-[#5B6BA9]">Document Assistant</h1>
        </div>

        {/* Niche filter button */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-2 px-3 py-2 bg-white border border-[#B8C5E9] rounded-md text-sm font-medium text-[#1E2A5A] hover:bg-[#F0F4FF] focus:outline-none focus:ring-2 focus:ring-[#5B6BA9] focus:ring-offset-2 shadow-sm transition-all"
          >
            <Filter className="h-4 w-4" />
            <span>{getSelectedNichesText()}</span>
            <ChevronDown className="h-4 w-4" />
          </button>

          {/* Niche dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-[#B8C5E9] rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
              <div className="p-2 border-b border-[#B8C5E9]/50">
                <h3 className="text-xs font-semibold text-[#1E2A5A] uppercase tracking-wider">Filter by niche</h3>
              </div>
              {availableNiches.map(niche => (
                <div
                  key={niche.value}
                  className="flex items-center px-4 py-2 hover:bg-[#F0F4FF] cursor-pointer"
                  onClick={() => toggleNiche(niche.value)}
                >
                    <div className="w-5 h-5 border border-[#B8C5E9] rounded flex items-center justify-center mr-3">
                        {selectedNiches.includes(niche.value) && <Check className="w-4 h-4 text-[#5B6BA9]" />}
                  </div>
                  <span className="text-sm text-[#1E2A5A]">{niche.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </header>

       {/* Main content area */}
        <div  className="flex-1 overflow-y-auto pt-16 pb-24">
        <div className="max-w-3xl mx-auto px-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} max-w-full`}
            >
              <div
                className={`
                  max-w-[85%] rounded-lg p-4
                  ${message.type === 'user'
                    ? 'bg-[#5B6BA9] text-white rounded-br-none shadow-md ml-8'
                    : 'bg-white border border-[#B8C5E9]/50 shadow-md rounded-bl-none mr-8'
                  }
                `}
              >
                <div className="flex items-center space-x-2 mb-2">
                    <div className={`p-1 rounded-full ${message.type === 'user' ? 'bg-[#1E2A5A]' : 'bg-[#F0F4FF]'}`}>
                    {message.type === 'user'
                      ? <User className="h-4 w-4 text-white" />
                      : <Bot className="h-4 w-4 text-[#5B6BA9]" />
                    }
                  </div>
                  <span className={`text-xs ${message.type === 'user' ? 'text-[#B8C5E9]' : 'text-[#1E2A5A]'}`}>
                    {message.type === 'user' ? 'You' : 'Assistant'} • {formatTime(message.timestamp)}
                  </span>
                </div>

                {message.isLoading ? (
                    <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin text-[#1E2A5A]" />
                    <span className="text-[#1E2A5A]">Looking Your Documents...</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className={`whitespace-pre-wrap ${message.type === 'user' ? 'text-white' : 'text-[#1E2A5A]'}`}>
                      {message.content}
                    </p>

                    {message.type === 'bot' && message.sources && message.sources.length > 0 && (
                      <div>
                        <button
                          onClick={() => toggleMessageDetails(message.id)}
                          className="mt-2 flex items-center text-xs text-[#5B6BA9] hover:text-[#1E2A5A] transition-colors"
                        >
                          <span className="mr-1">{message.showDetails ? 'Hide details' : 'Show details'}</span>
                          <ChevronRight className={`h-3 w-3 transition-transform ${message.showDetails ? 'rotate-90' : ''}`} />
                        </button>

                        <AnimatePresence>
                          {message.showDetails && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                                  className="mt-3 pt-3 border-t border-[#B8C5E9]/50 overflow-hidden"
                            >
                              {message.niches_used && message.niches_used.length > 0 && (
                                <div className="mb-3">
                                      <h4 className="text-xs font-medium text-[#1E2A5A] mb-1">Niches Used:</h4>
                                  <div className="flex flex-wrap gap-1">
                                    {message.niches_used.map((niche, index) => (
                                        <span key={index} className="px-2 py-1 bg-[#B8C5E9]/30 rounded-full text-[#1E2A5A] text-xs">
                                        {niche}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div>
                                    <h4 className="text-xs font-medium text-[#1E2A5A] mb-1 flex items-center">
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  Sources:
                                </h4>
                                    <ul className="text-xs text-[#1E2A5A] space-y-1">
                                  {message.sources.map((source, index) => (
                                      <li key={index} className="truncate hover:text-[#5B6BA9]">
                                      {source}
                                    </li>
                                  ))}
                                </ul>
                                {message.chunks_used && (
                                    <p className="text-xs text-[#1E2A5A] mt-1">
                                    Chunks used: {message.chunks_used}
                                  </p>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start justify-between shadow-sm"
                role="alert"
              >
                <div className="flex items-center">
                  <span className="mr-2">⚠️</span>
                  <span>{error}</span>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
        <div className="border-t border-[#B8C5E9]/50 py-4 px-4 fixed bottom-0 left-0 right-0 z-10 bg-[#F0F4FF]">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end space-x-3">
                <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={question}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                placeholder="Type your question here..."
                disabled={loading}
                rows={1}
                    className="w-full p-3 bg-white border border-[#B8C5E9] rounded-lg focus:ring-2 focus:ring-[#5B6BA9] focus:border-[#5B6BA9] resize-none min-h-[50px] max-h-[150px] transition-all shadow-sm"
              />
                  <div className="absolute right-3 bottom-3 text-xs text-[#1E2A5A]">
                {loading ? "" : "Press Enter to send"}
              </div>
            </div>
                <button
              onClick={askQuestion}
              disabled={loading || !question.trim()}
                  className="p-3 bg-[#1E2A5A] text-white rounded-lg hover:bg-[#5B6BA9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 shadow-sm"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;