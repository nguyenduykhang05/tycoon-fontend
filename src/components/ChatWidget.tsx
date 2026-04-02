import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';

interface Message {
    id: string;
    role: 'user' | 'bot';
    text: string;
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

    const [messages, setMessages] = useState<Message[]>([
        { id: '1', role: 'bot', text: 'Chào bạn! Mình là AI chuyên gia sắc đẹp hệ Tycoon. Có thể hỗ trợ bạn chọn mỹ phẩm hay đặt lịch chăm sóc Spa không?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput('');
        const newMessages = [...messages, { id: Date.now().toString(), role: 'user' as const, text: userMsg }];
        setMessages(newMessages);
        setIsLoading(true);

        try {
            // Gửi kèm lịch sử hội thoại để AI nhớ ngữ cảnh (tối đa 10 tin nhắn gần nhất)
            const history = newMessages.slice(-11, -1);
            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg, history })
            });
            const data = await res.json();

            if (data.success) {
                setMessages(prev => [...prev, { id: Date.now().toString(), role: 'bot', text: data.data.response }]);
            } else {
                setMessages(prev => [...prev, { id: Date.now().toString(), role: 'bot', text: '❌ Hệ thống AI đang bận, vui lòng thử lại sau.' }]);
            }
        } catch {
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'bot', text: '❌ Lỗi kết nối đến máy chủ.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Bot Icon */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-[#ff6b00] to-orange-400 rounded-full flex items-center justify-center text-white shadow-2xl hover:scale-110 transition-transform z-50 overflow-hidden"
                >
                    <div className="absolute inset-0 bg-white opacity-20 animate-ping rounded-full"></div>
                    <Bot size={28} />
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 w-[360px] h-[520px] bg-white rounded-[2.5rem] shadow-soft flex flex-col z-50 border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-5">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-[#005a31] to-emerald-700 px-4 py-3 flex items-center justify-between text-white">
                        <div className="flex items-center gap-2">
                            <Bot size={22} />
                            <span className="font-bold text-[15px]">Tycoon AI Assistant</span>
                        </div>
                        <button onClick={handleClose} className="hover:bg-white/20 p-1 rounded-full transition-colors w-7 h-7 flex items-center justify-center">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[14px] leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-[#005a31] text-white rounded-br-sm' : 'bg-white border text-gray-800 rounded-bl-sm'}`}>
                                    {msg.text.split('\n').map((line, i) => (
                                        <span key={i}>{line}{i < msg.text.split('\n').length - 1 && <br />}</span>
                                    ))}
                                </div>
                            </div>
                        ))}
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
                        <div className="flex items-center gap-2 bg-gray-100 rounded-full p-1 pl-4">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Hỏi Tycoon gì đó..."
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
                    </div>
                </div>
            )}
        </>
    );
}
