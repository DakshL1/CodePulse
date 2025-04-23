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
        <div className="fixed bottom-16 right-4 w-64 bg-white shadow-lg rounded-md p-4">
          <h2 className="font-bold">Chat</h2>
          <div className="h-32 overflow-y-auto border p-2 mb-2">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`text-sm p-1 ${
                  msg.sender === socket.id ? "text-right" : "text-left"
                }`}
              >
                <span className="font-bold text-black">
                  {msg.senderUserName || "Unknown"}
                </span>
                <br />
                {msg.text}
              </div>
            ))}
          </div>
          <form onSubmit={sendMessage} className="flex">
            <input
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white p-2 ml-2 rounded"
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
