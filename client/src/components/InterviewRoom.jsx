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
import InterviewerQuestion from "./InterviewerQuestion";
import IntervieweeQuestion from "./IntervieweeQuestion";
import CodeExecutionArea from "./CodeExecutionArea"; // Import the new component

const InterviewRoom = () => {
  const { role } = useRole();
  const { roomId } = useParams(); // Get roomId from URL
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("");
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { user } = useAuth0();

  const [testCases, setTestCases] = useState([{ input: "", expectedOutput: "", output: "", status: "Not Executed", testCasePassed: null }]);

  useEffect(() => {
    if (socket.connected) {
      socket.emit("join-room", { role, roomId });
    } else {
      socket.once("connect", () => {
        socket.emit("join-room", { role, roomId });
      });
    }

    socket.on("room-error", (msg) => {
      alert(msg);
      navigate("/"); // Redirect if there's an error
    });

    socket.on("receive-message", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    socket.on("send-language", (newLanguage) => setLanguage(newLanguage));
    socket.on("send-code", (newCode) => setCode(newCode));

    return () => {
      socket.off("room-error");
      socket.off("receive-message");
      socket.off("send-language");
      socket.off("send-code");
    };
  }, [roomId, role, navigate]);

  const sendMessage = useCallback(
    (e) => {
      e.preventDefault();
      if (newMessage.trim() && roomId) {
        const message = { text: newMessage };
        const senderUserName = user?.name || "Unknown";
  
        socket.emit("send-message", { message, roomId, senderUserName });
  
        setNewMessage("");
      }
    },
    [newMessage, roomId, user]
  );

  const updateCode = useCallback(
    (newCode) => {
      setCode(newCode);
      if (roomId) socket.emit("update-code", { newCode, roomId });
    },
    [roomId]
  );

  const setLanguageExtension = useMemo(() => {
    switch (language) {
      case 'python': return [python()];
      case 'cpp': return [cpp()];
      case 'java': return [java()];
      case 'javascript': return [javascript()];
      default: return [];
    }
  }, [language]);

  const updateLang = useCallback(
    (newLang) => {
      setLanguage(newLang);
      if (roomId) socket.emit("update-language", { language: newLang, roomId });
    },
    [roomId]
  );

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <div className="flex flex-1 p-4 gap-4">
        <div className="flex flex-col gap-4 w-1/3">
          <div className="bg-white p-4 shadow-md rounded-lg h-1/3 flex items-center justify-center">
            Video Chat (Coming Soon...)
          </div>
          <div className="bg-white p-4 shadow-md rounded-lg flex-1">
            {role === "Interviewer" ? (
              <InterviewerQuestion 
                roomId={roomId} 
                testCases={testCases} 
                setTestCases={setTestCases} 
              />
            ) : (
              <IntervieweeQuestion 
                testCases={testCases} 
                setTestCases={setTestCases}
              />
            )}
          </div>
        </div>

        <div className="flex flex-col w-2/3 gap-4">
          <div className="bg-white p-4 shadow-md rounded-lg flex-1 flex flex-col h-full">
            <div className="flex justify-between items-center">
              <p className="font-semibold mb-2">Code Editor</p>
              <p className="font-bold mb-2">Interview Room - {roomId}</p>
            </div>
            
            {/* Language Selector */}
            <select 
              value={language} 
              onChange={(e) => updateLang(e.target.value)} 
              className="p-2 border rounded mb-2"
            >
              <option value="">Select your language</option>
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
            </select>

            {/* CodeMirror Wrapper */}
            <div className="flex-1 border rounded-lg overflow-auto max-h-[400px]">
              <CodeMirror
                value={code}
                extensions={setLanguageExtension}
                onChange={updateCode}
                basicSetup={{
                  lineNumbers: true,
                  lineWrapping: true,
                }}
                className="h-full min-h-[400px]"
              />
            </div>
          </div>

          <div className="flex gap-4">
            {/* Replace placeholder with actual CodeExecutionArea component */}
            <CodeExecutionArea 
              testCases={testCases} 
              code={code} 
              language={language} 
              roomId={roomId}
              setTestCases={setTestCases}
            />
            
            {/* Chat button */}
            <button 
              className="bg-blue-500 text-white p-2 rounded-md shadow-md h-10 self-start"
              onClick={() => setIsChatOpen(!isChatOpen)}
            >
              Chat
            </button>
            
            {/* Chat popup */}
            {isChatOpen && (
              <div className="absolute bottom-10 right-0 w-64 bg-white shadow-lg rounded-md p-4">
                <h2 className="font-bold">Chat</h2>
                <div className="h-32 overflow-y-auto border p-2 mb-2">
                  {messages.map((msg, index) => (
                    <div key={index} className={`text-sm p-1 ${msg.sender === socket.id ? 'text-right' : 'text-left'}`}>
                      <span className="font-bold text-black">{msg.senderUserName || "Unknown User"}</span>
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
                  <button type="submit" className="bg-blue-500 text-white p-2 ml-2 rounded">Send</button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewRoom;