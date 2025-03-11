import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import socket from "./sockets"; // Import the persistent socket
import { useRole } from "../context/RoleContext";
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript'; 
import { python } from '@codemirror/lang-python'; 
import { cpp } from '@codemirror/lang-cpp';
import { java } from '@codemirror/lang-java'; 
import { useAuth0 } from '@auth0/auth0-react';


const InterviewRoom = () => {
  const { role } = useRole();
  const { roomId } = useParams(); // Get roomId from URL
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("");
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const {user}=useAuth0();


  useEffect(() => {
    if (socket.connected) {
      socket.emit("join-room", { role, roomId });
    } else {
      // If not connected, wait for connection
      socket.once("connect", () => {
        socket.emit("join-room", { role, roomId });
      });
    }

    socket.on("room-error", (msg) => {
      alert(msg);
      navigate("/"); // Redirect if there's an error
    });

    // Cleanup socket listeners
    return () => {
      socket.off("room-error");
    };
  }, [roomId, role, navigate]);

  const sendMessage = useCallback(
    (e) => {
      e.preventDefault();
      console.log("Send button clicked");
      console.log("New message:", newMessage);
      console.log("Room ID:", roomId);
  
      if (newMessage.trim() && roomId) {
        const message = { text: newMessage };
        const senderUserName=user.name;
        console.log("Sending message:", { message, roomId , senderUserName}); // Log message details
        console.log("senderUserName:",user.name);
       
        socket.emit("send-message", { message, roomId ,senderUserName });
        setMessages((prevMessages) => [
          ...prevMessages,
          { ...message, sender: socket.id,senderUserName },
        ]);
        setNewMessage(""); // This should clear the input
        console.log("Message sent and input cleared");
      } else {
        console.log("Message or Room ID is invalid");
      }
    },
    [socket, newMessage, roomId]
  );
  

  const updateCode = useCallback((NewCode) => {
    setCode(NewCode);
    if (roomId !== "") socket.emit("update-code", { NewCode, roomId });
  }, [roomId]);

  const SetLanguage = useMemo(() => {
    if (!language) return []; // Prevent undefined errors in CodeMirror
  
    switch (language) {
      case 'python': return [python()];
      case 'cpp': return [cpp()];
      case 'java': return [java()];
      case 'javascript': return [javascript()];
      default: return []; // Prevent errors
    }
  }, [language]);

  const updateLang = useCallback((newLang) => {
    setLanguage(newLang);
    let newId;
  
    switch (newLang) {
      case "python": newId = 92; break;
      case "cpp": newId = 54; break;
      case "java": newId = 91; break;
      case "javascript": newId = 93; break;
      default: newId = null; // No default
    }
    setId(newId);
  
    if (roomId !== "") socket.emit("update-language", { language: newLang, roomId });
  }, [roomId]);


  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <h2 className="text-xl font-bold text-center mt-4">Interview Room - {roomId}</h2>

      {/* Code Editor (Coming Soon) */}
      <div className="flex-1 p-4 bg-white shadow-md">
        
        <p>Code Editor</p>
        <select value={language} onChange={(e) => updateLang(e.target.value)} >
          <option value="">Select your language</option>
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="cpp">C++</option>
          <option value="java">Java</option>
        </select>
        <CodeMirror value={code} extensions={[SetLanguage]} onChange={(value) => updateCode(value)}  />
      </div>

      {/* Video Chat (Coming Soon) */}
      <div className="p-4 mt-2 bg-white shadow-md">
        <p>Video Chat (Coming Soon...)</p>
      </div>

      {/* Chat System (Coming Soon) */}
      <div className="p-4 mt-2 bg-white shadow-md">
        
        <section >
            <h2>Chat</h2>
          <div >
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  
                  alignSelf: msg.sender === socket.id ? "flex-end" : "flex-start",
                }}
              >
                <span style={{color:"black", fontWeight:"bolder"}}>{msg.senderUserName || "Unknown User"}</span>
<br />
                {msg.text}
              </div>
            ))}
          </div>
          <form  onSubmit={sendMessage}>
            <input
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button type="submit">
              Send
            </button>
          </form>
        </section>
      </div>
    </div>
  );
  
};

export default InterviewRoom;
