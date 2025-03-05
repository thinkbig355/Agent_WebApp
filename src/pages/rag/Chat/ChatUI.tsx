import { Loader2, Check, Send, ChevronDown, Bot, User, Filter, X, ExternalLink, ChevronRight, Plus, Trash2, Menu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useChatLogic } from "./ChatLogic";
import { Avatar } from "@/components/ui/avatar";
import { useState } from "react";

const ChatUI = () => {
  const {
    loading,
    question,
    setQuestion,
    error,
    setError,
    availableNiches,
    selectedNiches,
    dropdownOpen,
    setDropdownOpen,
    messages,
    chats,
    currentChatId,
    newChatName,
    setNewChatName,
    showNewChatModal,
    setShowNewChatModal,
    messagesEndRef,
    inputRef,
    toggleNiche,
    getSelectedNichesText,
    askQuestion,
    toggleMessageDetails,
    createNewChat,
    deleteChat,
    setCurrentChatIdAndPersist,
    formatTime,
    handleKeyDown,
    handleTextareaChange,
  } = useChatLogic();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Sidebar hidden by default

  return (
    <div className="flex flex-col min-h-screen w-full bg-gray-900 text-white">
      {/* Navigation Bar - Fixed at Top (Placeholder) */}
      <div className="fixed top-0 left-0 right-0 h-16 glass z-20 border-b border-white/10">
        <div className="flex items-center justify-between p-4">
          <span className="font-medium">Navigation</span>
          {/* Replace with your actual Navigation component if needed */}
        </div>
      </div>

      {/* Main Content Area - Starts Below Navigation */}
      <div className="flex flex-1 pt-16 w-full bg-gray-900">
        {/* Sidebar (Chats Section) - Toggleable */}
        <div
          className={`w-80 glass flex flex-col gap-4 border-r border-white/10 transition-all duration-300 ${
            isSidebarOpen ? "block" : "hidden"
          }`}
        >
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <Avatar className="w-8 h-8">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/10337/10337609.png"
                  alt="Me"
                  className="object-cover"
                />
              </Avatar>
              <span className="font-medium">Chats</span>
            </div>
            <button
              onClick={() => setShowNewChatModal(true)}
              className="p-2 hover:bg-white/5 rounded-full transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-4">
            {chats.map((chat) => (
              <div
                key={chat.chatId}
                className={`flex items-center justify-between gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                  currentChatId === chat.chatId ? "bg-white/10" : "hover:bg-white/5"
                }`}
                onClick={() => setCurrentChatIdAndPersist(chat.chatId)}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{chat.chatName}</div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteChat(chat.chatId);
                  }}
                  className="p-1 text-red-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area - Adjusts Width Dynamically */}
        <div className="flex-1 flex flex-col w-full bg-gray-900">
          {/* Chat Header - Sticky Below Navigation */}
          <div className="glass p-4 flex items-center justify-between border-b border-white/10 sticky top-16 z-10">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 hover:bg-white/5 rounded-full transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              <Avatar className="w-10 h-10">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/13330/13330989.png"
                  alt="Assistant"
                  className="object-cover"
                />
              </Avatar>
              <div>
                <div className="font-medium">
                  Document Assistant - {currentChatId ? chats.find((c) => c.chatId === currentChatId)?.chatName : "No Chat"}
                </div>
                <div className="text-sm text-muted-foreground">Active now</div>
              </div>
            </div>
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-2 hover:bg-white/5 rounded-full transition-colors"
              >
                <Filter className="w-5 h-5" />
                <span>{getSelectedNichesText()}</span>
                <ChevronDown className="w-5 h-5" />
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                  <div className="p-2 border-b border-white/20">
                    <h3 className="text-xs font-semibold uppercase tracking-wider">Filter by niche</h3>
                  </div>
                  {availableNiches.map((niche) => (
                    <div
                      key={niche.value}
                      className="flex items-center px-4 py-2 hover:bg-white/10 cursor-pointer transition-colors"
                      onClick={() => toggleNiche(niche.value)}
                    >
                      <div className="w-5 h-5 border border-white/20 rounded flex items-center justify-center mr-3">
                        {selectedNiches.includes(niche.value) && <Check className="w-4 h-4 text-white" />}
                      </div>
                      <span className="text-sm">{niche.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide pb-20">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-end gap-2 ${message.type === "user" ? "flex-row-reverse" : ""}`}
              >
                <Avatar className="w-8 h-8">
                  <img
                    src={
                      message.type === "user"
                        ? "https://cdn-icons-png.flaticon.com/512/10337/10337609.png"
                        : "https://cdn-icons-png.flaticon.com/512/13330/13330989.png"
                    }
                    alt={message.type === "user" ? "Me" : "Assistant"}
                    className="object-cover"
                  />
                </Avatar>
                <div className="flex flex-col gap-1 max-w-[70%]">
                  <div
                    className={`message-bubble ${
                      message.type === "user" ? "sent" : "received"
                    }`}
                  >
                    {message.isLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {selectedNiches.length > 0 ? (
                          <span>Looking Your Documents...</span>
                        ) : null}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        {message.type === "bot" && message.sources?.length > 0 && (
                          <div>
                            <button
                              onClick={() => toggleMessageDetails(message.id)}
                              className="flex items-center text-xs text-muted-foreground hover:text-white transition-colors"
                            >
                              <span className="mr-1">
                                {message.showDetails ? "Hide details" : "Show details"}
                              </span>
                              <ChevronRight
                                className={`w-3 h-3 transition-transform ${
                                  message.showDetails ? "rotate-90" : ""
                                }`}
                              />
                            </button>
                            <AnimatePresence>
                              {message.showDetails && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="mt-2 pt-2 border-t border-white/20 overflow-hidden text-xs"
                                >
                                  {message.niches_used?.length > 0 && (
                                    <div className="mb-2">
                                      <h4 className="font-medium mb-1">Niches Used:</h4>
                                      <div className="flex flex-wrap gap-1">
                                        {message.niches_used.map((niche, i) => (
                                          <span
                                            key={i}
                                            className="px-2 py-1 bg-white/10 rounded-full"
                                          >
                                            {niche}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  <div>
                                    <h4 className="font-medium mb-1 flex items-center">
                                      <ExternalLink className="w-3 h-3 mr-1" /> Sources:
                                    </h4>
                                    <ul className="space-y-1">
                                      {message.sources.map((source, i) => (
                                        <li key={i} className="truncate hover:text-white/80">
                                          {source}
                                        </li>
                                      ))}
                                    </ul>
                                    {message.chunks_used && (
                                      <p className="mt-1">Chunks used: {message.chunks_used}</p>
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
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-2 rounded-lg flex items-start justify-between"
                >
                  <div className="flex items-center">
                    <span className="mr-2">⚠️</span>
                    <span>{error}</span>
                  </div>
                  <button
                    onClick={() => setError(null)}
                    className="text-red-300 hover:text-red-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Input Section - Fixed at Bottom, Moves with Sidebar */}
          <div className={`fixed bottom-0 ${isSidebarOpen ? "left-80" : "left-0"} right-0 p-4 bg-gray-900/50 z-10 transition-all duration-300`}>
            <div className="glass rounded-full p-2 flex items-center gap-2">
              <textarea
                ref={inputRef}
                value={question}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                placeholder="Type your question here..."
                disabled={loading || !currentChatId}
                rows={1}
                className="flex-1 bg-transparent outline-none px-2 resize-none max-h-20"
              />
              <button
                onClick={askQuestion}
                disabled={loading || !question.trim() || !currentChatId}
                className="p-2 hover:bg-white/5 rounded-full transition-colors"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="glass rounded-lg p-6 w-96 shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Create New Chat</h3>
            <input
              type="text"
              value={newChatName}
              onChange={(e) => setNewChatName(e.target.value)}
              placeholder="Enter chat name"
              className="w-full p-2 bg-white/5 border border-white/20 rounded-md focus:ring-1 focus:ring-white/20"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowNewChatModal(false)}
                className="px-4 py-2 hover:bg-white/5 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={createNewChat}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-md"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatUI;