import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import socket from "../api/sockets"; // Import the persistent socket
import { useRole } from "../context/RoleContext";
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript'; 
import { python } from '@codemirror/lang-python'; 
import { cpp } from '@codemirror/lang-cpp';
import { java } from '@codemirror/lang-java'; 
import { useAuth0 } from '@auth0/auth0-react';
import { useIntervieweeRestrictions } from "../services/useIntervieweeRestrictions";
import InterviewerQuestion from "./InterviewerQuestion";
import IntervieweeQuestion from "./IntervieweeQuestion";
import CodeExecutionArea from "./CodeExecutionArea"; // Import the new component
import VideoCall from "./VideoCall";
import Chat from "./chat";


const InterviewRoom = () => {
  const { role } = useRole();
  const { roomId } = useParams(); // Get roomId from URL
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("");
  
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(role === "Interviewee" ? false : true);


  const [testCases, setTestCases] = useState([{ input: "", expectedOutput: "", output: "", status: "Not Executed", testCasePassed: null }]);

  useIntervieweeRestrictions(role, roomId);

  useEffect(() => {
    if (role !== "Interviewee") return;
  
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
  
    document.addEventListener("fullscreenchange", handleFullscreenChange);
  
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [role]);
  

  useEffect(() => {
    if (socket.connected) {
      // socket.emit("join-room", { role, roomId });
    } else {
      socket.once("connect", () => {
        socket.emit("join-room", { role, roomId });
      });
    }

    socket.on("room-error", (msg) => {
      alert(msg);
      navigate("/"); // Redirect if there's an error
    });

  

    socket.on("send-language", (newLanguage) => setLanguage(newLanguage));
    socket.on("send-code", (newCode) => setCode(newCode));

    return () => {
      socket.off("room-error");
     
      socket.off("send-language");
      socket.off("send-code");
    };
  }, [roomId, role, navigate]);


  
  

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
    <>
    {role === "Interviewee" && !isFullscreen && (
     <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md transition-all duration-300 flex items-center justify-center">
        <div className="text-center text-white p-6 rounded-lg bg-black bg-opacity-50 shadow-lg">
          <h1 className="text-2xl font-bold mb-4">Please enter fullscreen mode to continue</h1>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600"
            onClick={() => {
              const elem = document.documentElement;
              if (elem.requestFullscreen) elem.requestFullscreen();
            }}
          >
            Enter Fullscreen
          </button>
        </div>
      </div>
    )}
    

    <div className={`min-h-[calc(100vh-64px)] flex flex-col bg-gray-100 ${
      role === "Interviewee" && !isFullscreen ? "pointer-events-none blur-[1px] select-none" : ""
    }`}>
      <div className="flex flex-1 p-4 gap-4">
        <div className="flex flex-col gap-4 w-1/3">

          <VideoCall 
          layout="horizontal"
          roomId={roomId}
          />

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
            
          {/* Chat button (always at the bottom-right) */}
            <button 
              className="fixed bottom-4 right-4 bg-blue-500 text-white p-2 rounded-md shadow-md h-10"
              onClick={() => setIsChatOpen(!isChatOpen)}
            >
              Chat
            </button>

            <Chat isChatOpen={isChatOpen} roomId={roomId} />

          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default InterviewRoom;