'use client';

import { useState, useRef, useEffect } from 'react';
import { useSocket } from '@/lib/socket';
import { useGameStore } from '@/lib/store';
import { Button, Input } from '@/components/ui';

export const ChatBox = () => {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { sendChatMessage } = useSocket();
  const chatMessages = useGameStore((state) => state.chatMessages);
  const playerId = useGameStore((state) => state.playerId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      await sendChatMessage(message.trim());
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-800/50 rounded-lg">
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <h4 className="font-semibold text-gray-700 dark:text-gray-300">Chat</h4>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-50 max-h-75">
        {chatMessages.length === 0 ? (
          <p className="text-gray-400 text-center text-sm">No messages yet</p>
        ) : (
          chatMessages.map((msg, index) => (
            <div
              key={`${msg.playerId}-${msg.timestamp}-${index}`}
              className={`flex flex-col ${msg.playerId === playerId ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-3 py-2 ${
                  msg.playerId === playerId
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}
              >
                {msg.playerId !== playerId && (
                  <p className="text-xs font-semibold text-blue-500 dark:text-blue-400 mb-0.5">
                    {msg.username}
                  </p>
                )}
                <p className="text-sm">{msg.message}</p>
              </div>
              <span className="text-xs text-gray-400 mt-0.5">
                {formatTime(msg.timestamp)}
              </span>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button type="submit" disabled={!message.trim()}>
            Send
          </Button>
        </div>
      </form>
    </div>
  );
};
