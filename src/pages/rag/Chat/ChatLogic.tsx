import { useState, useEffect, useRef } from "react";
import ChatUI from "./ChatUI";

interface ResultData {
  answer: string;
  sources: string[];
  chunks_used: number;
  niches_used?: string[];
  error?: string;
}

interface NicheOption { value: string; label: string }
interface ChatOption { chatId: string; chatName: string }
interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: string | Date;
  sources?: string[];
  niches_used?: string[];
  chunks_used?: number;
  isLoading?: boolean;
  showDetails?: boolean;
}

export const useChatLogic = () => {
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [availableNiches, setAvailableNiches] = useState<NicheOption[]>([]);
  const [selectedNiches, setSelectedNiches] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chats, setChats] = useState<ChatOption[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [newChatName, setNewChatName] = useState("");
  const [showNewChatModal, setShowNewChatModal] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const savedChatId = localStorage.getItem('currentChatId');
    if (savedChatId) setCurrentChatId(savedChatId);
    fetchNiches();
    fetchChats();
  }, []);

  useEffect(() => { if (currentChatId) loadChatHistory(currentChatId); scrollToBottom(); }, [currentChatId]);
  useEffect(() => { scrollToBottom(); }, [messages]);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  const setCurrentChatIdAndPersist = (chatId: string | null) => {
    setCurrentChatId(chatId);
    chatId ? localStorage.setItem('currentChatId', chatId) : localStorage.removeItem('currentChatId');
  };

  const fetchNiches = async () => {
    try {
      const res = await fetch("https://ushapangeni.com.np/get-niches");
      const data = await res.json();
      data.success ? setAvailableNiches(data.niches) : setError(data.error || "Failed to fetch niches");
    } catch (err: any) { setError(err.message || "Error fetching niches"); }
  };

  const fetchChats = async () => {
    try {
      const res = await fetch("https://ushapangeni.com.np/get-chats");
      const data = await res.json();
      if (data.success) {
        setChats(data.chats);
        if (data.chats.length > 0 && !currentChatId) setCurrentChatIdAndPersist(data.chats[0].chatId);
      } else setError(data.error || "Failed to fetch chats");
    } catch (err: any) { setError(err.message || "Error fetching chats"); }
  };

  const loadChatHistory = async (chatId: string) => {
    setLoading(true);
    setMessages([]);
    try {
      const res = await fetch("https://ushapangeni.com.np/get-chat-history", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chatId }),
      });
      const data = await res.json();
      const loadedMessages = data.success ? data.messages.map((msg: Message) => ({
        ...msg, timestamp: new Date(msg.timestamp), showDetails: false
      })) : [];
      setMessages([{
        id: `welcome-${chatId}`, type: "bot",
        content: `Hello Ishan! You're in chat "${chats.find(c => c.chatId === chatId)?.chatName || chatId}". Ask me anything!`,
        timestamp: new Date(), showDetails: false
      }, ...loadedMessages]);
      if (!data.success) setError(data.error || "Failed to load chat history");
    } catch (err: any) { setError(err.message || "Error loading chat history"); } finally { setLoading(false); }
  };

  const createNewChat = async () => {
    if (!newChatName.trim()) return setError("Chat name is required");
    try {
      const res = await fetch("https://ushapangeni.com.np/create-chat", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chatName: newChatName }),
      });
      const data = await res.json();
      if (data.success) {
        setChats(prev => [...prev, { chatId: data.chatId, chatName: data.chatName }]);
        setCurrentChatIdAndPersist(data.chatId);
        setMessages([{ id: `welcome-${data.chatId}`, type: "bot", content: `Hello Ishan! New chat "${data.chatName}" created. Ask me anything!`, timestamp: new Date(), showDetails: false }]);
        setNewChatName("");
        setShowNewChatModal(false);
      } else setError(data.error || "Failed to create chat");
    } catch (err: any) { setError(err.message || "Error creating chat"); }
  };

  const deleteChat = async (chatId: string) => {
    if (!window.confirm("Are you sure you want to delete this chat?")) return;
    try {
      const res = await fetch("https://ushapangeni.com.np/delete-chat", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chatId }),
      });
      const data = await res.json();
      if (data.success) {
        setChats(prev => prev.filter(chat => chat.chatId !== chatId));
        if (currentChatId === chatId) {
          const nextChatId = chats.length > 1 ? chats.filter(chat => chat.chatId !== chatId)[0].chatId : null;
          setCurrentChatIdAndPersist(nextChatId);
          nextChatId ? loadChatHistory(nextChatId) : setMessages([]);
        }
      } else setError(data.error || "Failed to delete chat");
    } catch (err: any) { setError(err.message || "Error deleting chat"); }
  };

  const askQuestion = async () => {
    if (!question.trim() || !currentChatId) return;
    setLoading(true);
    setError(null);
    const messageId = Date.now().toString();
    const userMessage: Message = { id: `user-${messageId}`, type: 'user', content: question, timestamp: new Date() };
    const pendingBotMessage: Message = { id: `bot-${messageId}`, type: 'bot', content: '', timestamp: new Date(), isLoading: true, showDetails: false };
    setMessages(prev => [...prev, userMessage, pendingBotMessage]);
    setQuestion("");
    try {
      const res = await fetch("https://ushapangeni.com.np/query-with-history", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: userMessage.content, selectedNiches, chatId: currentChatId }),
      });
      const data = await res.json();
      setMessages(prev => prev.map(msg => msg.id === `bot-${messageId}` ? {
        ...msg, content: data.error ? `Error: ${data.error}` : data.answer, sources: data.sources, niches_used: data.niches_used,
        chunks_used: data.chunks_used, isLoading: false, showDetails: false
      } : msg));
      if (data.error) setError(data.error);
    } catch (err: any) { setError(err.message); setMessages(prev => prev.map(msg => msg.id === `bot-${messageId}` ? { ...msg, content: `Error: ${err.message}`, isLoading: false } : msg)); }
    finally { setLoading(false); setTimeout(() => inputRef.current?.focus(), 100); }
  };

  const toggleNiche = (niche: string) => setSelectedNiches(prev => prev.includes(niche) ? prev.filter(item => item !== niche) : [...prev, niche]);
  const toggleMessageDetails = (messageId: string) => setMessages(prev => prev.map(msg => msg.id === messageId ? { ...msg, showDetails: !msg.showDetails } : msg));
  const getSelectedNichesText = () => !selectedNiches.length ? "General Search" : selectedNiches.length <= 2 ? selectedNiches.map(niche => availableNiches.find(n => n.value === niche)?.label).filter(Boolean).join(", ") : `${selectedNiches.length} niches selected`;
  const formatTime = (date: Date | string) => (typeof date === 'string' ? new Date(date) : date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return {
    loading, question, setQuestion, error, setError, availableNiches, selectedNiches, dropdownOpen, setDropdownOpen,
    messages, chats, currentChatId, newChatName, setNewChatName, showNewChatModal, setShowNewChatModal,
    messagesEndRef, inputRef, toggleNiche, getSelectedNichesText, askQuestion, toggleMessageDetails, createNewChat,
    deleteChat, setCurrentChatIdAndPersist, formatTime, handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); askQuestion(); } },
    handleTextareaChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => { setQuestion(e.target.value); e.target.style.height = 'auto'; e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`; }
  };
};

const Chat = () => <ChatUI />;
export default Chat;