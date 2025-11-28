import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Menu, 
  Search, 
  MessageSquare, 
  Folder, 
  MoreHorizontal, 
  Home, 
  FlaskConical,
  ClipboardList,
  PackagePlus,
  ShoppingCart,
  LayoutDashboard,
  LogOut,
  ChevronRight,
  Clock
} from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { MessageBubble } from './MessageBubble';
import { Message } from '../types';

// --- TYPES ---
interface User {
  name: string;
  avatar?: string;
}

interface ChatInterfaceProps {
  user?: User;
  onLogout?: () => void;
}

interface ActionCardType {
  title: string;
  description: string;
  icon: React.ElementType;
  url: string;
  color: string;
}

interface ChatSession {
  id: string;
  title: string;
  timestamp: number;
  messages: Message[];
}

// --- Constants & Data ---

// 1. Placeholders
const PLACEHOLDERS = [
  "Tolong update Status Order ORD-XXX-001 menjadi Pending",
  "Bagaimana penanganan pertama jika aseton terkena mata?",
  "Apa klasifikasi bahaya aseton menurut regulasi EC No 1272/2008",
  "Tolong list apa saja reagen dan consumable yang stoknya menipis?",
  "Berapa hari lagi aseton akan expired? Sisa berapa Stok?"
];

// 2. Action Cards (Forms)
const ACTION_CARDS: ActionCardType[] = [
  {
    title: "Item Receipt",
    description: "Input penerimaan barang baru ke inventory",
    icon: PackagePlus,
    url: "https://airtable.com/appyhbedlTyTgOBCB/pagbiDDluZm2ww1hD/form",
    color: "bg-blue-100 text-blue-600"
  },
  {
    title: "Usage Log",
    description: "Catat penggunaan bahan kimia/alat",
    icon: ClipboardList,
    url: "https://airtable.com/appyhbedlTyTgOBCB/pag4ygzHonoUgo1ez/form",
    color: "bg-teal-100 text-teal-600"
  },
  {
    title: "Prep Log",
    description: "Form log persiapan larutan/sampel",
    icon: FlaskConical,
    url: "https://airtable.com/appyhbedlTyTgOBCB/pag0Gd5dq5g1xrijH/form",
    color: "bg-purple-100 text-purple-600"
  },
  {
    title: "Request Order",
    description: "Buat permintaan pembelian baru",
    icon: ShoppingCart,
    url: "https://airtable.com/appyhbedlTyTgOBCB/pagD8bWjDLCeoVjpX/form",
    color: "bg-orange-100 text-orange-600"
  }
];

// --- Helper Functions ---

const generateSmartTitle = (text: string): string => {
  let cleanText = text;
  
  // Only remove polite fillers or command starters. 
  // We KEEP question words (How, What, Bagaimana, Apa) so the title reflects the question.
  const prefixesToRemove = [
    // Indonesian fillers
    "tolong jelaskan", "tolong buatkan", "tolong cari", "tolong",
    "bisakah anda", "bisakah kamu", "bisa bantu", "bisa",
    "saya ingin bertanya mengenai", "saya ingin bertanya", "saya ingin", "saya butuh",
    "beritahu saya", "kasih tahu", "coba sebutkan", "sebutkan",
    // English fillers
    "please explain", "please tell me", "please",
    "can you help", "can you",
    "i want to ask about", "i want to ask", "i need",
    "tell me about"
  ];

  for (const prefix of prefixesToRemove) {
    const regex = new RegExp(`^${prefix}\\s+`, 'i');
    if (regex.test(cleanText)) {
      cleanText = cleanText.replace(regex, '');
      break; 
    }
  }

  // Remove redundant whitespace
  cleanText = cleanText.replace(/\s+/g, ' ').trim();
  
  // Capitalize first letter
  cleanText = cleanText.charAt(0).toUpperCase() + cleanText.slice(1);

  // Increased limit to 80 characters to capture full questions like "How should I treat acetone in my eyes?"
  if (cleanText.length > 80) {
    cleanText = cleanText.substring(0, 80) + '...';
  }

  return cleanText;
};

// --- Helper Components ---

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  color?: string;
  onClick?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ 
  icon: Icon, 
  label, 
  active = false, 
  color, 
  onClick 
}) => (
  <div 
    onClick={onClick}
    className={`
    flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all group
    ${active 
      ? 'bg-zinc-800 text-white' 
      : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
    }
  `}>
    <Icon className={`w-4 h-4 ${color || (active ? 'text-teal-400' : 'text-zinc-500 group-hover:text-zinc-400')}`} />
    <span className="text-sm font-medium">{label}</span>
    {active && <div className="ml-auto w-1 h-1 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.5)]"></div>}
  </div>
);

interface HistoryItemProps {
  label: string;
  time: string;
  active?: boolean;
  onClick?: () => void;
}

const HistoryItem: React.FC<HistoryItemProps> = ({ label, time, active, onClick }) => (
  <div 
    onClick={onClick}
    className={`group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${active ? 'bg-zinc-800/80 border border-zinc-700/50' : 'hover:bg-zinc-800/50'}`}
  >
    <div className="flex items-center gap-3 overflow-hidden">
      <MessageSquare className={`w-3.5 h-3.5 flex-shrink-0 ${active ? 'text-teal-400' : 'text-zinc-600 group-hover:text-zinc-400'}`} />
      <span className={`text-sm truncate ${active ? 'text-zinc-100' : 'text-zinc-400 group-hover:text-zinc-200'}`}>{label}</span>
    </div>
    <span className="text-[10px] text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap ml-2">{time}</span>
  </div>
);

// --- Main Component ---

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ user: propUser, onLogout: propOnLogout }) => {
  const user = propUser || { name: "Farrel Arya" };
  const onLogout = propOnLogout || (() => { console.log("Logout clicked"); });

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Placeholder Logic
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [fadePlaceholder, setFadePlaceholder] = useState(true);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState<'home' | 'chat'>('home');
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);
  
  // Session State
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Rotating Placeholder Logic with Smooth Fade
  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Start fade out
      setFadePlaceholder(false);

      // 2. Wait for fade out to finish (300ms matches Tailwind duration-300), then change text
      setTimeout(() => {
        setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
        // 3. Start fade in
        setFadePlaceholder(true);
      }, 300);

    }, 4000); // Change every 4 seconds
    return () => clearInterval(interval);
  }, []);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (activeView === 'chat') {
      scrollToBottom();
    }
  }, [messages, isLoading, activeView]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setActiveView('chat');

    let activeSessionId = currentSessionId;
    let updatedSessions = [...sessions];

    if (!activeSessionId) {
      activeSessionId = crypto.randomUUID();
      const smartTitle = generateSmartTitle(userMsg.content);

      const newSession: ChatSession = {
        id: activeSessionId,
        title: smartTitle,
        timestamp: Date.now(),
        messages: [userMsg]
      };
      updatedSessions = [newSession, ...updatedSessions];
      setCurrentSessionId(activeSessionId);
    } else {
      updatedSessions = updatedSessions.map(session => {
        if (session.id === activeSessionId) {
          return {
            ...session,
            messages: [...session.messages, userMsg],
            timestamp: Date.now()
          };
        }
        return session;
      });
    }
    setSessions(updatedSessions);

    try {
      const responseMessages = await geminiService.sendMessage(messages, userMsg.content, user.name);
      setMessages(prev => [...prev, ...responseMessages]);

      setSessions(prevSessions => prevSessions.map(session => {
        if (session.id === activeSessionId) {
          return {
            ...session,
            messages: [...session.messages, ...responseMessages],
            timestamp: Date.now()
          };
        }
        return session;
      }));

    } catch (error) {
      console.error(error);
      const errorMsg: Message = {
        id: crypto.randomUUID(),
        role: 'model',
        content: "Sorry, I encountered a connection error. Please try again.",
        timestamp: Date.now(),
        type: 'text'
      };
      setMessages(prev => [...prev, errorMsg]);
      
      setSessions(prevSessions => prevSessions.map(session => {
        if (session.id === activeSessionId) {
          return {
            ...session,
            messages: [...session.messages, errorMsg],
            timestamp: Date.now()
          };
        }
        return session;
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardClick = (url: string) => {
    window.open(url, '_blank');
  };

  const handleDashboardClick = () => {
    window.open("https://airtable.com/appyhbedlTyTgOBCB", '_blank');
  };

  const handleNewChat = () => {
    setMessages([]);
    setCurrentSessionId(null);
    setActiveView('home');
  };

  const loadSession = (session: ChatSession) => {
    setCurrentSessionId(session.id);
    setMessages(session.messages);
    setActiveView('chat');
  };

  return (
    <>
      {/* --- INJECT DM SANS FONT --- */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap');
      `}</style>

      {/* --- MAIN CONTAINER --- */}
      {/* Menggunakan font-['DM_Sans'] untuk mengaplikasikan font ke seluruh UI */}
      <div className="flex h-screen bg-[#F8FAFC] font-['DM_Sans'] overflow-hidden text-slate-800">
        
        {/* --- SIDEBAR (Dark Theme) --- */}
        <aside 
          className={`${isSidebarOpen ? 'w-[280px]' : 'w-0'} bg-[#0F0F12] text-zinc-400 flex-shrink-0 transition-all duration-300 ease-in-out flex flex-col relative overflow-hidden border-r border-zinc-800`}
        >
          {/* Sidebar Header */}
          <div className="px-6 py-6 flex items-center justify-between relative z-50">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center">
                Lab<span className="text-transparent bg-clip-text bg-gradient-to-br from-teal-400 to-blue-500">Flow</span>
              </h1>
              <p className="text-[10px] font-medium text-zinc-500 tracking-[0.25em] uppercase mt-0.5">
                Inventory
              </p>
            </div>

            {/* Three Dots Menu with Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsHeaderMenuOpen(!isHeaderMenuOpen)}
                className={`p-1 rounded-md transition-colors ${isHeaderMenuOpen ? 'bg-zinc-800 text-white' : 'text-zinc-600 hover:text-white hover:bg-zinc-800/50'}`}
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>

              {/* Dropdown Menu */}
              {isHeaderMenuOpen && (
                <>
                  {/* Invisible backdrop to close menu when clicking outside */}
                  <div 
                    className="fixed inset-0 z-40 cursor-default" 
                    onClick={() => setIsHeaderMenuOpen(false)} 
                  ></div>

                  {/* The Dropdown */}
                  <div className="absolute right-0 top-full mt-2 w-48 bg-[#18181B] border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-50 py-1 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                    <div className="px-3 py-2 text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                      Settings
                    </div>
                    <button 
                      onClick={() => {
                        onLogout?.();
                        setIsHeaderMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-zinc-800/80 hover:text-red-300 transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* New Chat Button */}
          <div className="px-4 mb-6">
            <button 
              onClick={handleNewChat}
              className="w-full flex items-center gap-3 px-4 py-3 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-200 rounded-xl transition-all border border-zinc-700/50 hover:border-zinc-600 group"
            >
              <span className="text-xl font-light">+</span>
              <span className="text-sm font-medium">New Chat</span>
            </button>
          </div>

          {/* Search */}
          <div className="px-4 mb-2">
            <div className="relative group">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500 group-focus-within:text-zinc-300 transition-colors" />
              <input 
                type="text" 
                placeholder="Search" 
                className="w-full bg-transparent border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-zinc-600 transition-colors"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-6 scrollbar-thin scrollbar-thumb-zinc-800">
            
            {/* Main Menu */}
            <div className="space-y-1">
              <SidebarItem 
                icon={LayoutDashboard} 
                label="Home" 
                active={activeView === 'home'} 
                onClick={handleNewChat} 
              />
              <SidebarItem 
                icon={MessageSquare} 
                label="Chats" 
                active={activeView === 'chat'} 
                onClick={() => {
                  if (messages.length > 0) setActiveView('chat');
                }}
              />
            </div>

            {/* Folders */}
            <div>
              <div className="px-3 flex items-center justify-between mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-600">
                Folders
                <span className="hover:text-zinc-400 cursor-pointer">+</span>
              </div>
              <div className="space-y-1">
                <SidebarItem icon={Folder} label="File" color="text-teal-500" />
              </div>
            </div>

            {/* History / Recent Chats */}
            <div>
              <div className="px-3 flex items-center justify-between mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-600">
                Recent Chats
              </div>
              <div className="space-y-1">
                {sessions.length === 0 ? (
                  <div className="px-3 py-2 text-xs text-zinc-600 italic">No recent chats</div>
                ) : (
                  sessions.map((session) => (
                    <HistoryItem 
                      key={session.id}
                      label={session.title} 
                      time={new Date(session.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} 
                      active={currentSessionId === session.id}
                      onClick={() => loadSession(session)}
                    />
                  ))
                )}
              </div>
            </div>
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-zinc-800">
            <div onClick={onLogout} className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800/50 cursor-pointer transition-colors group">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white uppercase">
                {user.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-200 truncate group-hover:text-white transition-colors">{user.name}</p>
                <p className="text-xs text-zinc-500 truncate">Lab User</p>
              </div>
              <LogOut className="w-4 h-4 text-zinc-500 hover:text-red-400 transition-colors" />
            </div>
          </div>
        </aside>

        {/* --- MAIN CONTENT --- */}
        <main className="flex-1 flex flex-col h-full relative bg-white">
          
          {/* Header - Dashboard Button RESTORED */}
          <header className="absolute top-0 w-full z-10 px-6 py-4 flex justify-between items-center bg-transparent pointer-events-none">
            <div className="pointer-events-auto">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex gap-2 pointer-events-auto">
              <button 
                onClick={handleDashboardClick}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#E6F7F5] hover:bg-[#D0F0EB] text-teal-700 rounded-full text-xs font-medium transition-colors border border-teal-100 shadow-sm"
              >
                <Home className="w-3 h-3 fill-current" />
                Dashboard
              </button>
            </div>
          </header>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto w-full relative">
              
              {/* --- VIEW SWITCHER --- */}
              {activeView === 'home' ? (
                // --- HOME VIEW (Empty State) ---
                <div className="flex-1 flex flex-col justify-center items-center px-4 md:px-0 pt-20">
                  
                  {/* Logo & Greeting */}
                  <div className="mb-10 text-center space-y-4 animate-fade-in-up">
                    <div className="w-auto h-auto mx-auto flex items-center justify-center mb-6">
                      <img 
                        src="https://i.postimg.cc/1R7DCsV0/Lab-Flow-Logo-Transparent.png" 
                        alt="Logo" 
                        className="w-24 h-24 object-contain"
                      />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-semibold text-slate-800 tracking-tight">
                      Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">{user.name}</span>
                    </h1>
                    <p className="text-lg text-slate-500 font-light max-w-lg mx-auto leading-relaxed">
                      I'm <span className="font-medium text-slate-700">Flo</span>, your lab assistant! <br/>
                      How can I help you, {user.name}?
                    </p>
                  </div>

                  {/* Quick Action Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full px-8 mb-12">
                    {ACTION_CARDS.map((card, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleCardClick(card.url)}
                        className="group flex flex-col items-start p-4 bg-white/80 hover:bg-white border border-slate-200 hover:border-teal-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 text-left relative overflow-hidden backdrop-blur-sm"
                      >
                        <div className={`p-2 rounded-lg ${card.color} mb-3 group-hover:scale-110 transition-transform`}>
                          <card.icon className="w-5 h-5" />
                        </div>
                        <h3 className="text-sm font-semibold text-slate-800 mb-1">{card.title}</h3>
                        <p className="text-xs text-slate-500 leading-snug">{card.description}</p>
                        
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        </div>
                      </button>
                    ))}
                  </div>

                </div>
              ) : (
                // --- CHAT VIEW (Messages) ---
                <div className="flex-1 px-4 py-24 space-y-2 min-h-full">
                  {messages.length === 0 && (
                    <div className="flex h-full items-center justify-center text-slate-400 text-sm">
                      No messages yet. Start a conversation!
                    </div>
                  )}
                  {messages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} />
                  ))}
                  
                  {isLoading && (
                    <div className="flex gap-4 mb-6 animate-pulse">
                        {/* Loading Logo - Removed Background */}
                        <div className="w-10 h-10 flex items-center justify-center p-0.5">
                          <img 
                            src="https://i.postimg.cc/1R7DCsV0/Lab-Flow-Logo-Transparent.png" 
                            alt="Flo" 
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="bg-white border border-slate-100 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2">
                          <div className="flex gap-1">
                            <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce"></div>
                          </div>
                        </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
          </div>

          {/* --- INPUT AREA --- */}
          <div className="p-6 bg-white/5 backdrop-blur-sm z-20">
            <div className="max-w-4xl mx-auto">
              <form 
                onSubmit={handleSend}
                className="relative flex items-center bg-slate-100/80 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 rounded-full border border-slate-200 focus-within:ring-2 focus-within:ring-teal-100 focus-within:border-teal-300 focus-within:bg-white transition-all duration-300 group"
              >
                {/* Attachment Icon REMOVED */}

                {/* Text Input */}
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={PLACEHOLDERS[placeholderIndex]}
                  disabled={isLoading}
                  // Added pl-6 for left spacing since icon is gone
                  className={`w-full py-4 pl-6 bg-transparent text-slate-700 focus:outline-none text-sm md:text-base truncate disabled:opacity-50 transition-all duration-300 placeholder:transition-colors placeholder:duration-300 ${fadePlaceholder ? 'placeholder-slate-400' : 'placeholder-transparent'}`}
                />

                {/* Right Actions - Voice Input Removed */}
                <div className="pr-2 flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className={`p-2.5 rounded-full flex items-center justify-center transition-all duration-300 ${
                      input.trim() && !isLoading 
                        ? 'bg-slate-900 text-white shadow-lg hover:scale-105 hover:bg-teal-600' 
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Send className="w-4 h-4 ml-0.5" />
                  </button>
                </div>
              </form>
              
              <p className="text-center text-[10px] text-slate-400 mt-3 font-medium">
                LabFlow AI can make mistakes. Verify important MSDS information.
              </p>
            </div>
          </div>

        </main>
      </div>
    </>
  );
};