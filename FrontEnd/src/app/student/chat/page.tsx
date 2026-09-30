'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { StudentLayout } from '../../../components/layout/StudentLayout';
import { useAuth } from '../../../contexts/AuthContext';
import { classService } from '../../../services/class.service';
import { chatService } from '../../../services/chat.service';
import { getSocket } from '../../../services/socket';
import { ClassItem } from '../../../types/class';
import { ChatMessage, Announcement, OnlineUser } from '../../../types/chat';
import {
  MessageSquare,
  Send,
  Users,
  Bell,
  Sparkles,
  School,
  Pin,
  Circle,
  Loader2,
  Calendar,
} from 'lucide-react';

export default function StudentChatPage() {
  const { user } = useAuth();

  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [onlineCount, setOnlineCount] = useState<number>(1);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [activePanel, setActivePanel] = useState<'chat' | 'announcements'>('chat');
  const [isLoading, setIsLoading] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUsers]);

  // Load classes student has joined
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const data = await classService.getStudentClasses();
        setClasses(data);
        if (data.length > 0) {
          setSelectedClass(data[0]);
        }
      } catch {
        //
      } finally {
        setIsLoading(false);
      }
    };

    fetchClasses();
  }, []);

  // When selected class changes, connect to Socket.IO room & fetch history
  useEffect(() => {
    if (!selectedClass || !user) return;

    const classId = selectedClass.id;
    const socket = getSocket();

    // 1. Fetch message history & announcements from API
    const loadData = async () => {
      try {
        const [msgData, annData] = await Promise.all([
          chatService.getMessageHistory(classId),
          chatService.getAnnouncements(classId),
        ]);
        setMessages(msgData);
        setAnnouncements(annData);
      } catch {
        //
      }
    };
    loadData();

    // 2. Join Socket.IO Room
    socket.emit('join_room', {
      classId,
      userId: user.id,
      userName: user.fullName,
    });

    // 3. Socket Event Listeners
    const handleNewMessage = (msg: ChatMessage) => {
      if (msg.classId === classId) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    const handleOnlineUsers = (data: { classId: number; count: number; users: OnlineUser[] }) => {
      if (data.classId === classId) {
        setOnlineCount(data.count);
      }
    };

    const handleUserTyping = (data: { userId: number; userName: string; classId: number }) => {
      if (data.classId === classId && data.userId !== user.id) {
        setTypingUsers((prev) => {
          if (!prev.includes(data.userName)) return [...prev, data.userName];
          return prev;
        });
      }
    };

    const handleUserStopTyping = (data: { userId: number; classId: number }) => {
      if (data.classId === classId) {
        setTypingUsers([]);
      }
    };

    const handleNewAnnouncement = (ann: Announcement) => {
      if (ann.classId === classId) {
        setAnnouncements((prev) => [ann, ...prev]);
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('room_online_users', handleOnlineUsers);
    socket.on('user_typing', handleUserTyping);
    socket.on('user_stop_typing', handleUserStopTyping);
    socket.on('new_announcement', handleNewAnnouncement);

    return () => {
      socket.emit('leave_room', { classId });
      socket.off('new_message', handleNewMessage);
      socket.off('room_online_users', handleOnlineUsers);
      socket.off('user_typing', handleUserTyping);
      socket.off('user_stop_typing', handleUserStopTyping);
      socket.off('new_announcement', handleNewAnnouncement);
    };
  }, [selectedClass, user]);

  // Handle typing input with debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);

    if (!selectedClass || !user) return;
    const socket = getSocket();

    socket.emit('typing_start', {
      classId: selectedClass.id,
      userId: user.id,
      userName: user.fullName,
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing_stop', {
        classId: selectedClass.id,
        userId: user.id,
      });
    }, 1500);
  };

  // Handle send message
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || !selectedClass || !user) return;

    const socket = getSocket();
    socket.emit('send_message', {
      classId: selectedClass.id,
      senderId: user.id,
      senderName: user.fullName,
      senderRole: user.role,
      message: inputMessage.trim(),
    });

    socket.emit('typing_stop', {
      classId: selectedClass.id,
      userId: user.id,
    });

    setInputMessage('');
  };

  return (
    <StudentLayout pageTitle="Trao đổi lớp học">
      <div className="h-[calc(100vh-140px)] flex flex-col md:flex-row gap-4">
        {/* Left Column: Classes selection */}
        <div className="w-full md:w-72 bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs flex flex-col flex-shrink-0">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <School className="w-4 h-4 text-blue-600" />
              <span>Phòng chat theo lớp</span>
            </h3>
            <span className="text-[11px] font-semibold text-slate-400">
              {classes.length} lớp
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2">
            {classes.length > 0 ? (
              classes.map((cls) => {
                const isSelected = selectedClass?.id === cls.id;
                return (
                  <button
                    key={cls.id}
                    onClick={() => setSelectedClass(cls)}
                    className={`w-full p-3 rounded-2xl text-left border transition-all cursor-pointer flex flex-col gap-1 ${
                      isSelected
                        ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-500/20 shadow-xs'
                        : 'bg-slate-50/70 border-slate-200/60 hover:bg-slate-100/70'
                    }`}
                  >
                    <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                      {cls.name}
                    </span>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Lớp {cls.grade} • {cls.subject}</span>
                      <span className="text-emerald-600 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Online
                      </span>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-6 text-center text-xs text-slate-400">
                Bạn chưa tham gia lớp học nào để vào phòng chat.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Chat Box & Announcements */}
        {selectedClass ? (
          <div className="flex-1 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex flex-col overflow-hidden min-w-0">
            {/* Topbar of the room */}
            <div className="px-6 py-3.5 bg-white border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs flex-shrink-0">
                  {selectedClass.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h2 className="font-bold text-sm sm:text-base text-slate-900 truncate">
                    {selectedClass.name}
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>GV: {selectedClass.teacher?.fullName || 'Thầy/Cô'}</span>
                    <span>•</span>
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>{onlineCount} trực tuyến</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* View Switcher: Chat or Announcements */}
              <div className="flex items-center bg-slate-100 p-1 rounded-2xl gap-1 text-xs font-semibold">
                <button
                  onClick={() => setActivePanel('chat')}
                  className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
                    activePanel === 'chat'
                      ? 'bg-white text-blue-700 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Trò chuyện
                </button>
                <button
                  onClick={() => setActivePanel('announcements')}
                  className={`px-3 py-1 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                    activePanel === 'announcements'
                      ? 'bg-white text-blue-700 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Pin className="w-3 h-3 text-amber-500" />
                  <span>Thông báo ({announcements.length})</span>
                </button>
              </div>
            </div>

            {/* Main Area: Chat stream or Announcements list */}
            {activePanel === 'chat' ? (
              <>
                {/* Messages Container */}
                <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/50">
                  {messages.length > 0 ? (
                    messages.map((msg, idx) => {
                      const isMe = msg.senderId === user?.id;
                      const isTeacher = msg.senderRole === 'GIAO_VIEN';

                      return (
                        <div
                          key={msg._id || idx}
                          className={`flex gap-3 ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                          {!isMe && (
                            <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs flex-shrink-0 mt-1">
                              {msg.senderName.charAt(0).toUpperCase()}
                            </div>
                          )}

                          <div
                            className={`max-w-[75%] space-y-1 ${
                              isMe ? 'items-end text-right' : 'items-start text-left'
                            }`}
                          >
                            {!isMe && (
                              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                                <span className="font-bold text-slate-800">{msg.senderName}</span>
                                {isTeacher && (
                                  <span className="px-1.5 py-0.2 rounded-md bg-purple-100 text-purple-700 font-bold text-[9px]">
                                    Giáo viên
                                  </span>
                                )}
                              </div>
                            )}

                            <div
                              className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                                isMe
                                  ? 'bg-blue-600 text-white rounded-br-none shadow-xs'
                                  : isTeacher
                                  ? 'bg-purple-50 border border-purple-200 text-purple-950 rounded-bl-none shadow-xs'
                                  : 'bg-white border border-slate-200/80 text-slate-800 rounded-bl-none shadow-xs'
                              }`}
                            >
                              {msg.message}
                            </div>

                            <div className="text-[10px] text-slate-400">
                              {new Date(msg.createdAt).toLocaleTimeString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-16 text-center space-y-2 text-slate-400 text-xs">
                      <MessageSquare className="w-10 h-10 mx-auto text-slate-300" />
                      <p>Chưa có tin nhắn nào trong phòng chat.</p>
                      <p className="text-[11px]">Hãy gửi lời chào đầu tiên đến Thầy Cô và các bạn nhé!</p>
                    </div>
                  )}

                  {/* Typing Indicator 3-dots animation */}
                  {typingUsers.length > 0 && (
                    <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-white border border-slate-200/80 max-w-[240px] text-xs text-slate-500 shadow-xs animate-fadeIn">
                      <div className="flex gap-1 pl-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" />
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]" />
                      </div>
                      <span className="truncate">{typingUsers.join(', ')} đang gõ...</span>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input Bar */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-3 bg-white border-t border-slate-200/80 flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={handleInputChange}
                    placeholder="Nhập tin nhắn thảo luận bài học (Nhấn Enter để gửi)..."
                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim()}
                    className="w-10 h-10 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              /* Announcements Tab */
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/50">
                {announcements.length > 0 ? (
                  announcements.map((ann, i) => (
                    <div
                      key={ann._id || i}
                      className={`p-5 rounded-3xl border transition-all ${
                        ann.isPinned
                          ? 'bg-amber-50/60 border-amber-200 shadow-sm'
                          : 'bg-white border-slate-200 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          {ann.isPinned && <Pin className="w-4 h-4 text-amber-500 fill-amber-500" />}
                          <h4 className="font-bold text-sm sm:text-base text-slate-900">
                            {ann.title}
                          </h4>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {new Date(ann.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>

                      <p className="mt-3 text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                        {ann.content}
                      </p>

                      <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                        <span>Đăng bởi: <strong>{ann.authorName}</strong></span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-16 text-center text-xs text-slate-400 space-y-2">
                    <Bell className="w-10 h-10 mx-auto text-slate-300" />
                    <p>Chưa có thông báo nào từ Giáo viên.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 bg-white rounded-3xl border border-slate-200/80 p-12 text-center flex flex-col items-center justify-center text-slate-400 text-xs">
            <School className="w-12 h-12 text-slate-300 mb-2" />
            <p>Vui lòng chọn một lớp học ở danh sách bên trái để vào phòng chat.</p>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
