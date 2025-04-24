import React, { useEffect, useState, useCallback } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import socket from "../api/sockets"; 
const Chat = ({ isChatOpen, roomId }) => {
  const { user } = useAuth0();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    socket.on("receive-message", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off("receive-message");
    };
  }, [roomId]);

  const sendMessage = useCallback(
    (e) => {
      e.preventDefault();
      if (newMessage.trim() && roomId) {
        const senderUserName = user?.name || "Unknown";
        const message = {
          text: newMessage,
          senderUserName,
          sender: socket.id,
        };

        setMessages((prevMessages) => [...prevMessages, message]);
        socket.emit("send-message", { message, roomId, senderUserName });
        setNewMessage("");
      }
    },
    [newMessage, roomId, user]
  );

  return (
<>
  {isChatOpen && (
    <div className="fixed bottom-16 right-4 w-64 bg-zinc-800 shadow-lg rounded-md p-4 text-white">
      <h2 className="font-bold mb-2">Chat</h2>
      
      <div className="h-32 overflow-y-auto border border-zinc-700 p-2 mb-2 rounded">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`text-sm p-1 ${
              msg.sender === socket.id ? "text-right" : "text-left"
            }`}
          >
            <span className="font-bold text-gray-200">
              {msg.senderUserName || "Unknown"}
            </span>
            <br />
            <span className="text-gray-300">{msg.text}</span>
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="w-full p-2 bg-zinc-700 border border-zinc-600 rounded text-white placeholder-gray-400"
        />
        <button
          type="submit"
          className="bg-[hsl(0,0%,14%)] hover:bg-[hsl(0,0%,18%)] text-white px-3 rounded"
        >
          Send
        </button>
      </form>
    </div>
  )}
</>

  );
};

export default Chat;
