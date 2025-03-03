import { useState, useEffect, useRef } from "react";
import { Loader2, Check, Send, ChevronDown, Bot, User, Filter, X, ExternalLink, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ResultData {
  answer: string;
  sources: string[];
  chunks_used: number;
  niches_used?: string[];
  error?: string;
}

interface NicheOption {
  value: string;
  label: string;
}

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
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [availableNiches, setAvailableNiches] = useState<NicheOption[]>([]);
  const [selectedNiches, setSelectedNiches] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "bot",
      content: "Hello Ishan! Ask me anything about your knowledge base.",
      timestamp: new Date(),
      showDetails: false
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetchNiches();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchNiches = async () => {
    try {
      const response = await fetch("https://ushapangeni.com.np/get-niches");
      const data = await response.json();
      if (data.success) {
        const niches = data.niches.map((niche: string) => ({
          value: niche,
          label: niche.charAt(0).toUpperCase() + niche.slice(1).replace('_', ' ')
        }));
        setAvailableNiches(niches);
        // No default niche selection
      } else {
        setError(data.error || "Failed to fetch niches");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching niches");
    }
  };

  const toggleNiche = (niche: string) => {
    setSelectedNiches(prev => {
      if (prev.includes(niche)) return prev.filter(item => item !== niche);
      return [...prev, niche];
    });
  };

  const getSelectedNichesText = () => {
    if (!selectedNiches.length) return "General Search";
    if (selectedNiches.length <= 2) {
      return selectedNiches
        .map(niche => availableNiches.find(n => n.value === niche)?.label)
        .filter(Boolean)
        .join(", ");
    }
    return `${selectedNiches.length} niches selected`;
  };

  const askQuestion = async () => {
    if (!question.trim()) return;

    setLoading(true);
    setError(null);

    const messageId = Date.now().toString();

    const userMessage: Message = {
      id: `user-${messageId}`,
      type: 'user',
      content: question,
      timestamp: new Date()
    };

    const pendingBotMessage: Message = {
      id: `bot-${messageId}`,
      type: 'bot',
      content: '',
      timestamp: new Date(),
      isLoading: true,
      showDetails: false
    };

    setMessages(prev => [...prev, userMessage, pendingBotMessage]);
    setQuestion("");

    try {
      let response;
      let data;

      if (selectedNiches.length === 0) {
        response = await fetch("https://ushapangeni.com.np/raw-query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: userMessage.content }),
        });
        data = await response.json();

         if (data.error) {
            setError(data.error);
             setMessages(prev => prev.map(msg => msg.id === `bot-${messageId}` ? { ...msg, content: `Error: ${data.error}`, isLoading: false } : msg));
         } else {
            setMessages(prev => prev.map(msg => msg.id === `bot-${messageId}` ? { ...msg, content: data.answer, isLoading: false } : msg));
         }

      } else {
        response = await fetch("https://ushapangeni.com.np/query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: userMessage.content,
            selectedNiches
          }),
        });
        data = await response.json();
        if (data.error) {
            setError(data.error);
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
      }


    } catch (err: any) {
      const errorMessage = err.message || "An error occurred while processing your request.";
      setError(errorMessage);
        setMessages(prev => prev.map(msg => msg.id === `bot-${messageId}` ? { ...msg, content: `Error: ${errorMessage}`, isLoading: false } : msg));

    } finally {
      setLoading(false);
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      askQuestion();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    setQuestion(textarea.value);
    textarea.style.height = 'auto';
    const newHeight = Math.min(textarea.scrollHeight, 150);
    textarea.style.height = `${newHeight}px`;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#FFF5F5] via-[#B8C5E9] to-[#5B6BA9]">
      <header className="bg-white/90 backdrop-blur-xl border-b border-[#B8C5E9]/50 py-4 px-6 flex items-center justify-between shadow-sm sticky top-16 z-40">
        <div className="flex items-center space-x-3">
          <div className="bg-[#F0F4FF] p-2 rounded-full">
            <Bot className="h-6 w-6 text-[#5B6BA9]" />
          </div>
          <h1 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#1E2A5A] to-[#5B6BA9]">Document Assistant</h1>
        </div>

        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-2 px-3 py-2 bg-white border border-[#B8C5E9] rounded-md text-sm font-medium text-[#1E2A5A] hover:bg-[#F0F4FF] focus:outline-none focus:ring-2 focus:ring-[#5B6BA9] focus:ring-offset-2 shadow-sm transition-all"
          >
            <Filter className="h-4 w-4" />
            <span>{getSelectedNichesText()}</span>
            <ChevronDown className="h-4 w-4" />
          </button>

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

      <div className="flex-1 overflow-y-auto pt-4 pb-24">
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
                    {/* Show "Looking..." if niches are selected, otherwise show general loading */}
                    {selectedNiches.length > 0 ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-[#1E2A5A]" />
                        <span className="text-[#1E2A5A]">Looking Your Documents...</span>
                      </>
                    ) : (
                      <Loader2 className="h-4 w-4 animate-spin text-[#1E2A5A]" />
                    )}
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