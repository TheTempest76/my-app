"use client";

import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useParams } from "next/navigation";

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;  // Changed from Date to string since API returns ISO string
}

interface ChatData {
  id: string;
  postId: string;  // Added this field
  donorId: string;
  receiverId: string;
  messages: Message[];
  donor: {
    id: string;
    name: string;
  };
  receiver: {
    id: string;
    name: string;
  };
}

export default function ChatPage() {
  const params = useParams();
  const postId = params?.postId as string;
  const { user } = useUser();
  const [chatData, setChatData] = useState<ChatData | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const initializeChat = async () => {
      if (!postId || !user) {
        setError("Missing required data");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/chat/${postId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setChatData(data);
        setError(null);
      } catch (error) {
        console.error("Error initializing chat:", error);
        setError("Failed to load chat");
      } finally {
        setLoading(false);
      }
    };

    initializeChat();
    const interval = setInterval(initializeChat, 5000);
    return () => clearInterval(interval);
  }, [postId, user]);

  useEffect(() => {
    scrollToBottom();
  }, [chatData?.messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatData || !user?.id) return;

    try {
      const response = await fetch("/api/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: chatData.id,
          content: newMessage,
          senderId: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setNewMessage("");
      
      // Refresh chat data
      const updatedChat = await fetch(`/api/chat/${postId}`);
      if (!updatedChat.ok) {
        throw new Error(`HTTP error! status: ${updatedChat.status}`);
      }
      const data = await updatedChat.json();
      setChatData(data);
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Failed to send message");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Loading chat...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!chatData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">No chat data available</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 h-screen flex flex-col">
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {chatData.messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.senderId === user?.id ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.senderId === user?.id
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200"
              }`}
            >
              <p>{message.content}</p>
              <p className="text-xs mt-1 opacity-70">
                {new Date(message.createdAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 rounded-lg border border-gray-300 p-2"
          placeholder="Type your message..."
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          disabled={!newMessage.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
}