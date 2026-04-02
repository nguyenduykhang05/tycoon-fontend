import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Headset, User, Clock, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ChatMessage {
    id: number;
    session_id: number;
    sender_id: number;
    sender_role: string;
    message: string;
    created_at: string;
}

interface ChatWidgetProps {
    isOpenExternally?: boolean;
    onCloseExternal?: () => void;
}

export default function ChatWidget({ isOpenExternally, onCloseExternal }: ChatWidgetProps) {
    const [isOpen, setIsOpen] = useState(false);
    
    useEffect(() => {
        if (isOpenExternally) setIsOpen(true);
    }, [isOpenExternally]);

    const handleClose = () => {
        setIsOpen(false);
        if (onCloseExternal) onCloseExternal();
    };

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState<number | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const token = localStorage.getItem('tycoon_token') || '';
    const user = (() => { try { return JSON.parse(localStorage.getItem('tycoon_user')||'null'); } catch { return null; } })();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchMessages = (sid: number) => {
        if (!token) return;
        fetch(`/api/chat/messages/${sid}`, { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json()).then(d => {
                if (d.success) {
                    setMessages(d.data);
                    scrollToBottom();
                }
            });
    };

    useEffect(() => {
        if (!isOpen || !token) return;
        
        if (!sessionId) {
            fetch('/api/chat/my-session', { headers: { Authorization: `Bearer ${token}` } })
                .then(r => r.json()).then(d => {
                    if (d.success && d.data?.session_id) {
                        setSessionId(d.data.session_id);
                        fetchMessages(d.data.session_id);
                    }
                });
        }
    }, [isOpen, token, sessionId]);

    useEffect(() => {
        if (isOpen && sessionId && token) {
            const interval = setInterval(() => fetchMessages(sessionId), 5000);
            return () => clearInterval(interval);
        }
    }, [isOpen, sessionId, token]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;
        if (!token) {
            alert('Vui lòng đăng nhập để chat với nhân viên hỗ trợ.');
            return;
        }

        const userMsg = input.trim();
        setInput('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/chat/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ session_id: sessionId, message: userMsg, sender_role: user?.role || 'customer' })
            });
            const data = await res.json();

            if (data.success) {
                const sid = data.data.session_id;
                if (!sessionId) setSessionId(sid);
                fetchMessages(sid);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Widget Icon */}
            {!isOpen && (
                <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-[#005a31] to-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-2xl z-50 overflow-hidden border border-white/10"
                >
                    <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full"></div>
                    <Headset size={28} className="relative z-10" />
                    <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-[#005a31]"></div>
                </motion.button>
            )}

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, x: 100, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 100, scale: 0.9 }}
                        className="fixed bottom-6 right-6 w-[400px] h-[640px] bg-white rounded-[2.5rem] shadow-[0_25px_60px_rgba(0,0,0,0.15)] flex flex-col z-50 border border-emerald-50 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-[#005a31] via-[#00703c] to-emerald-800 px-6 py-5 flex items-center justify-between text-white shadow-md relative">
                            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5"></div>
                            <div className="flex items-center gap-4 relative z-10">
                                <div className="p-2.5 bg-white/10 rounded-2xl border border-white/20">
                                    <Headset size={24} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-extrabold text-[16px] tracking-tight">Hỗ Trợ Trực Tuyến</span>
                                    <span className="text-[10px] opacity-80 font-bold uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
                                        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                                        Đội ngũ Tycoon sẵn sàng
                                    </span>
                                </div>
                            </div>
                            <button onClick={handleClose} className="hover:bg-white/20 p-2 rounded-full transition-all active:scale-90">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Messages Content */}
                        <div className="flex-grow overflow-y-auto p-6 space-y-5 bg-[#fcfdfc]">
                            {messages.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 px-8">
                                    <div className="w-16 h-16 bg-emerald-50 rounded-3xl flex items-center justify-center">
                                        <MessageCircle size={32} className="text-emerald-500" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800 text-[16px]">Xin chào! ✨</h4>
                                        <p className="text-[13px] text-gray-500 mt-2 leading-relaxed">
                                            Vui lòng để lại thắc mắc của bạn, đội ngũ chuyên viên Tycoon sẽ phản hồi sớm nhất có thể.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 py-2 px-4 bg-emerald-50 rounded-full border border-emerald-100 mt-2">
                                        <ShieldCheck size={14} className="text-emerald-600" />
                                        <span className="text-[11px] font-bold text-emerald-700 uppercase">Bảo mật & Tận tâm</span>
                                    </div>
                                </div>
                            )}
                            
                            <div className="space-y-6">
                                {messages.map((msg) => {
                                    const isUser = msg.sender_role === 'customer';
                                    return (
                                        <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                                            <div className={`max-w-[85%] flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                                                {!isUser && (
                                                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-1">
                                                        <User size={14} className="text-emerald-600" />
                                                    </div>
                                                )}
                                                <div className={`shadow-sm px-4 py-3 text-[14px] leading-relaxed flex flex-col ${isUser ? 'bg-[#005a31] text-white rounded-2xl rounded-tr-none font-medium' : 'bg-white border border-emerald-100 text-gray-800 rounded-2xl rounded-tl-none'}`}>
                                                    <div className="flex flex-col">
                                                        {msg.message.split('\n').map((line, i) => (
                                                            <p key={i}>{line}</p>
                                                        ))}
                                                    </div>
                                                    <div className={`flex items-center gap-1 mt-2 self-end text-[9px] font-bold opacity-60 ${isUser ? 'text-emerald-100' : 'text-gray-400'}`}>
                                                        <Clock size={10} />
                                                        {new Date(msg.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white border border-emerald-50 rounded-2xl rounded-tl-none px-5 py-4 shadow-sm flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"></span>
                                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-6 bg-white border-t border-gray-100">
                            {!user ? (
                                <div className="text-center bg-orange-50 border border-orange-100 rounded-2xl p-4">
                                    <p className="text-[13px] text-orange-700 font-bold">
                                        Vui lòng đăng nhập để được chuyên viên hỗ trợ trực tiếp.
                                    </p>
                                </div>
                            ) : (
                                <div className="relative group/input">
                                    <div className="flex items-center gap-2 bg-gray-50 rounded-2xl p-2 border border-gray-200 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-50 transition-all">
                                        <input
                                            type="text"
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                            placeholder="Gõ lời nhắn của bạn..."
                                            className="flex-grow bg-transparent text-[14px] px-3 py-2 focus:outline-none placeholder-gray-400 font-medium"
                                        />
                                        <button
                                            onClick={handleSend}
                                            disabled={!input.trim() || isLoading}
                                            className="w-10 h-10 rounded-xl bg-[#005a31] text-white flex items-center justify-center hover:bg-emerald-800 disabled:opacity-50 disabled:grayscale transition-all shadow-md active:scale-95 group"
                                        >
                                            <Send size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            )}
                            <p className="text-[10px] text-gray-400 text-center mt-4 uppercase tracking-[0.2em] font-bold opacity-60">
                                Tycoon Customer Care Center
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
