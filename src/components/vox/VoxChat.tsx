import { useState, useEffect, useRef } from "react";
import { Send, User, Cpu, Clock } from "lucide-react";
import { VoxButton } from "./VoxButton";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface Message {
  role: "customer" | "employee";
  content: string;
  ts: string;
}

interface VoxChatProps {
  complaintId: string;
  messages: Message[];
  onSendMessage: (content: string) => Promise<void>;
  currentUserRole: "customer" | "employee";
}

export function VoxChat({ complaintId, messages, onSendMessage, currentUserRole }: VoxChatProps) {
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isSending) return;
    setIsSending(true);
    try {
      await onSendMessage(input.trim());
      setInput("");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/30">
      {/* Message List */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-2 opacity-50 py-10">
            <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
              <Clock className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-sm text-slate-500">No messages yet.</p>
            <p className="text-xs text-slate-400">Start the conversation with the customer.</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.role === currentUserRole;
            return (
              <div 
                key={idx} 
                className={cn(
                  "flex flex-col max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300",
                  isMe ? "ml-auto items-end" : "mr-auto items-start"
                )}
              >
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  {!isMe && (
                    <div className={cn(
                      "h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold",
                      msg.role === "customer" ? "bg-blue-100 text-blue-600" : "bg-emerald-100 text-emerald-600"
                    )}>
                      {msg.role === "customer" ? "C" : "E"}
                    </div>
                  )}
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-tight">
                    {isMe ? "You" : msg.role === "customer" ? "Customer" : "Agent"}
                  </span>
                  <span className="text-[9px] text-slate-300">
                    {formatDistanceToNow(new Date(msg.ts), { addSuffix: true })}
                  </span>
                </div>
                <div 
                  className={cn(
                    "rounded-2xl px-4 py-2.5 text-sm shadow-sm border",
                    isMe 
                      ? "bg-slate-900 text-white border-slate-800 rounded-tr-none" 
                      : "bg-white text-slate-700 border-slate-200 rounded-tl-none"
                  )}
                >
                  {msg.content}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100">
        <div className="relative flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
            className="flex-1 h-10 rounded-full border border-slate-200 bg-slate-50 px-4 pr-12 text-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 transition-all"
            disabled={isSending}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isSending}
            className={cn(
              "absolute right-1 top-1 h-8 w-8 rounded-full flex items-center justify-center transition-all",
              input.trim() 
                ? "bg-slate-900 text-white hover:bg-slate-800" 
                : "bg-slate-100 text-slate-400"
            )}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-2 text-[10px] text-center text-slate-400">
          Messages are visible to the {currentUserRole === 'employee' ? 'customer' : 'assigned resolver'}.
        </p>
      </div>
    </div>
  );
}
