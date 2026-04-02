import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Headset } from 'lucide-react';

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
        
        // Find if user has a session
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
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-[#005a31] to-emerald-600 rounded-full flex items-center justify-center text-white shadow-2xl hover:scale-110 transition-transform z-50 overflow-hidden"
                >
                    <div className="absolute inset-0 bg-white opacity-20 animate-ping rounded-full"></div>
                    <Headset size={28} />
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 w-[360px] h-[520px] bg-white rounded-[2.5rem] shadow-soft flex flex-col z-50 border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-5">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-[#005a31] to-emerald-700 px-4 py-3 flex items-center justify-between text-white">
                        <div className="flex items-center gap-2">
                            <Headset size={22} />
                            <span className="font-bold text-[15px]">Tư Vấn Hợp Tác & Hỗ Trợ</span>
                        </div>
                        <button onClick={handleClose} className="hover:bg-white/20 p-1 rounded-full transition-colors w-7 h-7 flex items-center justify-center">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                        {messages.length === 0 && (
                            <div className="text-center text-sm text-gray-500 py-4 opacity-70">
                                Hãy để lại tin nhắn, nhân viên của Tycoon sẽ hỗ trợ bạn ngay lập tức!
                            </div>
                        )}
                        {messages.map((msg) => {
                            const isUser = msg.sender_role === 'customer';
                            return (
                                <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[14px] leading-relaxed shadow-sm flex flex-col ${isUser ? 'bg-[#005a31] text-white rounded-br-sm' : 'bg-white border text-gray-800 rounded-bl-sm'}`}>
                                        <span>{msg.message}</span>
                                        <span className={`text-[9px] text-right mt-1 opacity-70 ${isUser ? 'text-emerald-200' : 'text-gray-400'}`}>
                                            {new Date(msg.created_at).toLocaleTimeString('vi-VN')}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white border rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex items-center gap-1">
                                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></span>
                                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-100"></span>
                                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-200"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-3 bg-white border-t border-gray-100">
                        {!user ? (
                            <div className="text-center text-xs text-red-500 font-bold p-2">
                                Bạn cần đăng nhập để được hỗ trợ!
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 bg-gray-100 rounded-full p-1 pl-4">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Lời nhắn..."
                                    className="flex-grow bg-transparent text-[14px] focus:outline-none"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!input.trim() || isLoading}
                                    className="w-8 h-8 rounded-full bg-[#005a31] text-white flex items-center justify-center hover:opacity-90 disabled:opacity-50 transition-opacity"
                                >
                                    <Send size={14} className="ml-[-2px] mt-[1px]" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
