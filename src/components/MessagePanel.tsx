import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Image, Smile, Phone, Calendar, CheckCheck, MapPin, 
  User, MessageSquare, Shield, AlertTriangle, ArrowLeft, Loader2, Info
} from 'lucide-react';
import { api } from '../lib/api';
import { ChatRoom, Message, User as UserType } from '../types';

interface MessagePanelProps {
  currentUser: UserType | null;
  initialRoomId?: string | null;
}

export default function MessagePanel({ currentUser, initialRoomId }: MessagePanelProps) {
  const [rooms, setRooms] = useState<any[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<any | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [textInput, setTextInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showEmojiTray, setShowEmojiTray] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const testEmojis = ['👋', '🤝', '👍', '👌', '💎', '🔥', '🚘', '🏠', '✨', '😂', '❓'];

  useEffect(() => {
    if (currentUser) {
      loadChatRooms();
    }
  }, [currentUser]);

  useEffect(() => {
    if (selectedRoom) {
      loadMessages(selectedRoom.id);
    }
  }, [selectedRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const loadChatRooms = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const data = await api.getChatRooms(currentUser.id);
      setRooms(data);
      if (initialRoomId) {
        const findRoom = data.find(r => r.id === initialRoomId);
        if (findRoom) setSelectedRoom(findRoom);
      } else if (data.length > 0 && !selectedRoom) {
        setSelectedRoom(data[0]);
      }
    } catch (err) {
      console.error('Error loading chats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (roomId: string) => {
    if (!currentUser) return;
    try {
      const list = await api.getMessages(roomId, currentUser.id);
      setMessages(list);
    } catch (err) {
      console.error('Error loading messages:', err);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent, customImage?: string) => {
    if (e) e.preventDefault();
    if (!selectedRoom || (!textInput.trim() && !customImage) || !currentUser) return;

    setIsSending(true);
    const messageText = textInput;
    setTextInput('');
    setShowEmojiTray(false);

    try {
      const sent = await api.sendMessage(selectedRoom.id, currentUser.id, {
        text: customImage ? '' : messageText,
        image: customImage || undefined
      });

      // Update state instantly
      setMessages(prev => [...prev, sent]);
      
      // Update sidebar room text
      setRooms(prev => prev.map(r => {
        if (r.id === selectedRoom.id) {
          return { ...r, lastMessage: sent, lastMessageText: sent.text || '📷 Image' };
        }
        return r;
      }));

      // Simulate a highly smart organic response from the other user!
      setIsTyping(true);
      setTimeout(async () => {
        setIsTyping(false);
        const responderId = currentUser.id === selectedRoom.buyerId ? selectedRoom.sellerId : selectedRoom.buyerId;
        const responderName = currentUser.id === selectedRoom.buyerId ? selectedRoom.seller?.name : selectedRoom.buyer?.name;
        
        let responseText = "Excellent! Let me verify the details and I will write you back shortly.";
        if (messageText.toLowerCase().includes('price') || messageText.toLowerCase().includes('negotiable')) {
          responseText = `Hello! Regarding the price of the listing, I have some slight room for negotiation. What is your offer?`;
        } else if (messageText.toLowerCase().includes('condition') || messageText.toLowerCase().includes('mint')) {
          responseText = `The item is in absolutely pristine condition, as described. You are welcome to view it in person!`;
        } else if (customImage) {
          responseText = `Wow, thanks for sharing this image! Let me look into this.`;
        }

        const autoResponse = await api.sendMessage(selectedRoom.id, responderId, {
          text: responseText
        });

        setMessages(prev => [...prev, autoResponse]);
        loadChatRooms(); // refresh sidebar stats
      }, 1800);

    } catch (err) {
      console.error('Failed to send:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleSendEmoji = (emoji: string) => {
    setTextInput(prev => prev + emoji);
    setShowEmojiTray(false);
  };

  const handleUploadImageMock = () => {
    // Simulate picking a high quality image attachment
    const mockImageUrls = [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=300',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=300',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=300'
    ];
    const picked = mockImageUrls[Math.floor(Math.random() * mockImageUrls.length)];
    handleSendMessage(undefined, picked);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getPartner = (room: any) => {
    if (!currentUser) return null;
    return room.buyerId === currentUser.id ? room.seller : room.buyer;
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      <div className="bg-white rounded-2xl border border-gray-150 shadow-sm overflow-hidden h-[620px] flex">
        
        {/* Left Side: Inbox List */}
        <div className={`w-full md:w-80 shrink-0 border-r border-gray-150 flex flex-col h-full ${selectedRoom ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-display font-extrabold text-lg text-gray-900 flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              <span>Studio Messages</span>
            </h3>
            <span className="text-[10px] font-mono text-gray-400 block mt-0.5 uppercase tracking-wider">
              {rooms.length} Conversation channels
            </span>
          </div>

          <div className="flex-grow overflow-y-auto divide-y divide-gray-50">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center p-12 text-gray-400">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500 mb-2" />
                <span className="text-xs">Accessing channels...</span>
              </div>
            ) : rooms.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40 text-gray-400" />
                <p className="text-xs">No active chats found. Initiate a conversation from any ad details page!</p>
              </div>
            ) : (
              rooms.map((room) => {
                const partner = getPartner(room);
                const isSelected = selectedRoom?.id === room.id;
                return (
                  <div
                    key={room.id}
                    onClick={() => setSelectedRoom(room)}
                    className={`p-4 text-left cursor-pointer transition-all hover:bg-gray-50 flex items-center space-x-3 select-none ${isSelected ? 'bg-blue-50/40 border-l-4 border-blue-600' : ''}`}
                  >
                    <img 
                      src={partner?.avatar} 
                      alt={partner?.name} 
                      className="w-10 h-10 rounded-full object-cover shrink-0 ring-2 ring-gray-100" 
                    />
                    <div className="overflow-hidden flex-grow">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-800 line-clamp-1">{partner?.name}</span>
                        {room.unreadCount > 0 && (
                          <span className="w-4.5 h-4.5 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white">
                            {room.unreadCount}
                          </span>
                        )}
                      </div>
                      <span className="block text-[11px] font-medium text-blue-600 mt-0.5 line-clamp-1">
                        {room.ad?.title}
                      </span>
                      <p className="text-xs text-gray-400 mt-1 truncate">
                        {room.lastMessageText || 'No messages yet'}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Chat Area */}
        {selectedRoom ? (
          <div className="flex-grow flex flex-col h-full bg-gray-50/30">
            
            {/* Header / Meta bar */}
            <div className="p-4 border-b border-gray-150 bg-white flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => setSelectedRoom(null)}
                  className="p-1 rounded-lg hover:bg-gray-100 md:hidden text-gray-600 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <img 
                  src={getPartner(selectedRoom)?.avatar} 
                  alt={getPartner(selectedRoom)?.name} 
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100" 
                />
                <div>
                  <div className="flex items-center space-x-1">
                    <span className="text-sm font-bold text-gray-800 leading-none">{getPartner(selectedRoom)?.name}</span>
                    {getPartner(selectedRoom)?.isVerified && (
                      <CheckCheck className="w-3.5 h-3.5 text-blue-500 fill-blue-500" />
                    )}
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono mt-1 block">Active classified: {selectedRoom.ad?.title}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <a 
                  href={`tel:${getPartner(selectedRoom)?.phone}`}
                  className="p-2 rounded-xl border border-gray-150 hover:bg-gray-50 text-gray-600 flex items-center space-x-1.5 text-xs font-semibold transition-all"
                >
                  <Phone className="w-4 h-4 text-blue-600" />
                  <span className="hidden sm:inline">Voice Call</span>
                </a>
              </div>
            </div>

            {/* Ad brief attachment bar */}
            <div className="bg-blue-50/40 px-4 py-2.5 border-b border-gray-100 flex items-center justify-between text-xs shrink-0 select-none">
              <div className="flex items-center space-x-2 overflow-hidden">
                <span className="font-bold text-blue-800 uppercase tracking-wider text-[9px] px-1.5 py-0.5 bg-blue-100 rounded">Listing context</span>
                <span className="font-semibold text-gray-700 truncate">{selectedRoom.ad?.title}</span>
              </div>
              <div className="font-bold text-gray-900 whitespace-nowrap pl-4">
                {selectedRoom.ad?.price.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
              </div>
            </div>

            {/* Message Stream */}
            <div className="flex-grow overflow-y-auto p-5 space-y-4">
              {messages.map((msg) => {
                const isMe = msg.senderId === currentUser?.id;
                return (
                  <div 
                    key={msg.id}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none border border-gray-150 shadow-sm'}`}>
                      {msg.text && <p className="font-sans whitespace-pre-wrap">{msg.text}</p>}
                      {msg.image && (
                        <img 
                          src={msg.image} 
                          alt="shared attachment" 
                          className="rounded-lg max-h-48 object-cover mt-1 border border-gray-100" 
                        />
                      )}
                      
                      <div className="flex items-center justify-end space-x-1 mt-1.5 opacity-65 text-[9px] font-mono">
                        <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {isMe && <CheckCheck className="w-3 h-3 text-white" />}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Typing simulation anim */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-150 p-3 rounded-2xl rounded-tl-none flex items-center space-x-1 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Emoji Tray Overlay */}
            {showEmojiTray && (
              <div className="p-3 border-t border-gray-150 bg-white flex flex-wrap gap-2 shrink-0 select-none">
                {testEmojis.map(emoji => (
                  <button 
                    key={emoji}
                    onClick={() => handleSendEmoji(emoji)}
                    className="p-2 text-lg hover:bg-gray-100 rounded-xl transition-all"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-150 bg-white flex items-center space-x-2 shrink-0">
              <button 
                type="button"
                onClick={() => setShowEmojiTray(!showEmojiTray)}
                className="p-2.5 rounded-xl border border-gray-150 hover:bg-gray-50 text-gray-500 transition-colors"
                title="Add emoji"
              >
                <Smile className="w-5 h-5" />
              </button>

              <button 
                type="button"
                onClick={handleUploadImageMock}
                className="p-2.5 rounded-xl border border-gray-150 hover:bg-gray-50 text-gray-500 transition-colors"
                title="Attach photo"
              >
                <Image className="w-5 h-5" />
              </button>

              <input 
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Write a message to trade or negotiate..." 
                className="flex-grow px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-xs"
              />

              <button 
                type="submit"
                disabled={isSending || (!textInput.trim() && !isTyping)}
                className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 transition-all shadow-md active:scale-95 cursor-pointer"
              >
                {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </form>

          </div>
        ) : (
          <div className="flex-grow hidden md:flex flex-col items-center justify-center text-gray-400 bg-gray-50/10">
            <MessageSquare className="w-12 h-12 text-gray-300 mb-2.5 opacity-40 animate-pulse" />
            <h4 className="font-display font-bold text-gray-600 text-sm">Secure Communications Hub</h4>
            <p className="text-xs text-gray-400 mt-1 max-w-xs text-center leading-relaxed">
              Select any thread on the left pane to commence secure negotations or trade details with verified members.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
