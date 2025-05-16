import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import socket from "../api/sockets";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { cpp } from "@codemirror/lang-cpp";
import { java } from "@codemirror/lang-java";
import VideoCall from "./VideoCall";
import axios from 'axios';
import { useAuth0 } from "@auth0/auth0-react";
import Chat from "./Chat";
import { dracula } from '@uiw/codemirror-theme-dracula';


const GameMode = () => {
  const [roomId, setRoomID] = useState("");
  const [isRoomJoined, setIsRoomJoined] = useState(false);
  const [playerCode, setPlayerCode] = useState("");
  const [opponentCode, setOpponentCode] = useState("");
  const [language, setLanguage] = useState("");
  const [timerValue, setTimerValue] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [playerInput, setPlayerInput] = useState("");
  const [playerOutput, setPlayerOutput] = useState("");
  const [opponentInput, setOpponentInput] = useState("");
  const [opponentOutput, setOpponentOutput] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [opponentName, setOpponentName] = useState("");
  const [question, setQuestion] = useState("");
  const [questionInput, setQuestionInput] = useState("");
  const [id, setId] = useState(0);
  const timerRef = useRef(null);
  const { user } = useAuth0();
  const Backend_URl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    socket.on("receive-opponent-code", ({ code }) => setOpponentCode(code));
    socket.on("receive-run-output", ({ output }) => setOpponentOutput(output));
    socket.on("opponent-input", ({ input}) => {
      setOpponentInput(input);

    });
    socket.on("opponent-left", () => {
      setOpponentName("");
      setOpponentCode("");
      setOpponentInput("");
      setOpponentOutput("");
    });
    socket.on("receive-question-game", ({ question }) => setQuestion(question));

   
    socket.on("start-timer", ({ timeLeft }) => {
      setTimerValue(timeLeft);
      setTimerRunning(true);
  
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimerValue((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    });

    socket.on("stop-timer", () => {
      clearInterval(timerRef.current);
      setTimerRunning(false);
    });
    
    socket.on("reset-timer", () => {
      clearInterval(timerRef.current);
      setTimerRunning(false);
      setTimerValue(0);
    });

    socket.on("clear-question", ()=>{
      setQuestion("");
    });
    

    return () => {
      socket.off("receive-opponent-code");
      socket.off("receive-run-output");
      socket.off("opponent-io");
      socket.off("opponent-left");
      socket.off("receive-question");
      socket.off("start-timer");
      socket.off("stop-timer");
      socket.off("reset-timer");

    };
  }, []);

  const setLanguageExtension = useMemo(() => {
    switch (language) {
      case "python": return [python()];
      case "cpp": return [cpp()];
      case "java": return [java()];
      case "javascript": return [javascript()];
      default: return [];
    }
  }, [language]);

  const joinRoom = useCallback(() => {
    if (roomId.trim() === "") alert("Please enter a Room ID!");
    else {
      setIsRoomJoined(true);
      socket.emit("join-game-room", { roomId });
    }
  }, [roomId]);

  const leaveRoom = useCallback(() => {
    socket.emit("leave-game-room", { roomId });
    setIsRoomJoined(false);
    setRoomID("");
    setOpponentCode("");
    setOpponentInput("");
    setOpponentOutput("");
  }, [roomId]);

  const updateCode = useCallback(
    (newCode) => {
      setPlayerCode(newCode);
      if (roomId) socket.emit("update-player-code", { code: newCode, roomId });
    },
    [roomId]
  );

  const updateLang = useCallback((newLang) => {
    setLanguage(newLang);
    let newId;
    switch (newLang) {
      case "python": newId = 92; break;
      case "cpp": newId = 54; break;
      case "java": newId = 91; break;
      case "javascript": newId = 93; break;
      default: newId = null;
    }
    setId(newId);
  }, []);

  const handleInputChange = (e) => {
    const input = e.target.value;
    setPlayerInput(input);
    socket.emit("update-player-input", {
      input,
      roomId,
    });
  };


  const runCode = useCallback(async () => {
    if (!language) {
      alert("Select a language!");
      return;
    }
  
    if (playerCode.trim() === '') return;
  
    try {
      const input = playerInput.trim();
  
      // Make the API call directly here
      const response = await axios.post(`${Backend_URl}/api/judge0-GM/execute`, {
        id,
        code: playerCode,
        stdinput: input !== "" ? input : null
      });
  
      const result = response.data;
  
      if (result?.output) {
        setPlayerOutput(result.output);
  
        if (roomId !== "") {
          socket.emit("update-output", { output: result.output, roomId });
        }
      }
    } catch (error) {
      console.error("Execution error:", error);
      setPlayerOutput("Error executing code.");
    }
  }, [language, playerCode, playerInput, id, roomId]);
  

  const startTimer = useCallback(() => {
    let timeLeft = parseInt(timerValue, 10) || 0;
    if (timeLeft <= 0) return;
  
    setTimerRunning(true);
    socket.emit("start-timer", { roomId, timeLeft }); 
  
    timerRef.current = setInterval(() => {
      timeLeft -= 1;
      setTimerValue((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [timerValue, roomId]);
  

  const stopTimer = useCallback(() => {
    clearInterval(timerRef.current);
    setTimerRunning(false);
    socket.emit("stop-timer", { roomId });
  }, [roomId]);
  
  const resetTimer = useCallback(() => {
    clearInterval(timerRef.current);
    setTimerRunning(false);
    setTimerValue(0);
    socket.emit("reset-timer", { roomId });
  }, [roomId]);
  
  const sendQuestion = useCallback(() => {
    if(!isRoomJoined) return alert("pls join a room!!")
    socket.emit("send-question-game", { question: questionInput, roomId });
    setQuestion(questionInput);
    setQuestionInput("");
  }, [questionInput, roomId]);
  
  const clearQuestion = useCallback(() => {
    socket.emit("clear-question", { roomId });
    setQuestion("");
  }, [roomId]);

 
  
  return (
<div className="h-screen flex flex-col overflow-hidden bg-black text-white ">
  <div className="flex h-screen overflow-hidden p-4 gap-2 mt-16">

    {/* Player's Section - Left */}
    <div className="w-1/2 flex flex-col gap-2 overflow-hidden">
      <div className="bg-[hsl(0,0%,8%)] p-4 shadow-md rounded-lg flex flex-col flex-1 overflow-hidden">

        {/* Room Join + Language Select */}
        <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            {!isRoomJoined ? (
              <input
                type="text"
                placeholder="Room ID"
                value={roomId}
                onChange={(e) => setRoomID(e.target.value)}
                className="p-2 border border-zinc-600 rounded bg-zinc-700 text-white"
              />
            ) : (
              <p className="font-semibold">
                Joined Room: <span className="font-normal">{roomId}</span>
              </p>
            )}
            {!isRoomJoined ? (
              <button
                onClick={joinRoom}
                className="bg-green-700 text-white p-2 rounded hover:bg-green-800"
              >
                Join Room
              </button>
            ) : (
              <button
                onClick={leaveRoom}
                className="bg-red-700 text-white p-2 rounded hover:bg-red-800"
              >
                Disconnect
              </button>
            )}
          </div>
          <select
            value={language}
            onChange={(e) => updateLang(e.target.value)}
            className="p-2 border border-zinc-600 rounded bg-zinc-700 text-white"
          >
            <option value="">Select Language</option>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="cpp">C++</option>
            <option value="java">Java</option>
          </select>
        </div>

        {/* CodeMirror */}
        <div className="flex-1 flex flex-col gap-2 overflow-hidden">
          <p className="font-semibold">Your Code</p>
          <div className="flex-1 border border-zinc-600 rounded-lg overflow-auto">
            <CodeMirror
              value={playerCode}
              extensions={setLanguageExtension}
              onChange={updateCode}
              basicSetup={{ lineNumbers: true, lineWrapping: true }}
              className="h-full w-full"
              theme={dracula}
            />
          </div>
        </div>

        {/* Input / Output / Buttons */}
        <div className="flex gap-2 mt-4">
          <div className="flex-1 bg-[hsl(0,0%,8%)] p-4 shadow-md rounded-lg">
            <p className="font-semibold">Input</p>
            <textarea
              className="w-full h-16 border p-2 rounded resize-none bg-zinc-700 text-white"
              value={playerInput}
              onChange={handleInputChange}
            />
          </div>
          <div className="flex-1 bg-[hsl(0,0%,8%)] p-4 shadow-md rounded-lg">
            <p className="font-semibold">Output</p>
            <pre className="overflow-auto h-16 border p-2 rounded bg-zinc-700 text-white">{playerOutput}</pre>
          </div>
          <div className="flex flex-col justify-center items-end gap-2">
            <button onClick={runCode} className="bg-green-700 text-white p-2 rounded w-24 hover:bg-green-800">
              Run Code
            </button>
            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className="bg-zinc-700 text-white p-2 rounded w-24 hover:bg-zinc-600"
            >
              {isChatOpen ? "Close Chat" : "Open Chat"}
            </button>
          </div>
        </div>

        {/* Chat Box */}
        <Chat isChatOpen={isChatOpen} roomId={roomId} />
      </div>
    </div>

    {/* Opponent + Video + Question Section */}
    <div className="w-1/2 flex flex-col gap-2 overflow-hidden">
      <div className="flex h-[60%] w-full gap-2 flex-1 overflow-hidden">
        <div className="flex flex-col flex-1 gap-2 overflow-hidden">
          <div className="bg-[hsl(0,0%,8%)] p-4 shadow-md rounded-lg flex items-center gap-2 flex-wrap">
            {!timerRunning && (
              <input
                type="number"
                placeholder="Timer (seconds)"
                value={timerValue}
                onChange={(e) => setTimerValue(e.target.value)}
                className="p-2 border border-zinc-600 rounded-lg w-32 bg-zinc-700 text-white"
              />
            )}
            <button onClick={startTimer} disabled={timerRunning} className="bg-green-700 text-white p-2 rounded hover:bg-green-800">
              Start
            </button>
            <button onClick={stopTimer} className="bg-yellow-700 text-white p-2 rounded hover:bg-yellow-800">
              Stop
            </button>
            <button onClick={resetTimer} className="bg-red-700 text-white p-2 rounded hover:bg-red-800">
              Reset
            </button>
            {timerRunning && (
              <span className="text-lg font-bold ml-auto">Time: {timerValue}s</span>
            )}
          </div>
          <div className="bg-zinc-700 p-4 shadow-md rounded-lg flex-1 overflow-auto">
            <p className="font-semibold mb-2">Question:</p>
            <p className="mb-2 whitespace-pre-wrap">{question || "No question yet. Please add one."}</p>
            
            {!question ? (
              <div className="flex gap-2">
                <textarea
                  value={questionInput}
                  onChange={(e) => setQuestionInput(e.target.value)}
                  placeholder="Enter a question to send"
                  className="p-2 flex-1 border border-zinc-400 rounded bg-zinc-00 text-white"
                />
                <button onClick={sendQuestion} className="bg-zinc-800 text-white px-4 py-2 rounded hover:bg-zinc-600">
                  Send
                </button>
              </div>
            ) : (
              <button
                onClick={clearQuestion}
                className="bg-red-700 text-white px-4 py-2 rounded mt-2 hover:bg-red-800"
              >
                Clear Question
              </button>
            )}
          </div>
        </div>

        <div className="w-[40%] h-[100%]">
          <VideoCall layout="vertical" />
        </div>
      </div>

      <div className="flex h-[40%] w-full gap-2">
        <div className="w-[70%] bg-[hsl(0,0%,8%)] p-4 shadow-md rounded-lg overflow-auto">
          <p className="font-semibold">Opponent's Code</p>
          <CodeMirror
            value={opponentCode}
            readOnly
            basicSetup={{ lineNumbers: true, lineWrapping: true }}
            className="h-[85%] border border-zinc-600 rounded-lg w-full overflow-auto"
            theme={dracula}
          />
        </div>
        <div className="w-[30%] bg-[hsl(0,0%,8%)] p-4 shadow-md rounded-lg overflow-auto">
          <p className="font-semibold">Opponent's Input</p>
          <textarea
            className="overflow-auto h-[35%] border p-2 rounded mb-2 w-full bg-zinc-700 text-white resize-none"
            value={opponentInput}
            readOnly
          />
          <p className="font-semibold">Opponent's Output</p>
          <textarea
            className="overflow-auto h-[35%] border p-2 rounded w-full bg-zinc-700 text-white resize-none"
            value={opponentOutput}
            readOnly
          />
        </div>
      </div>
    </div>
  </div>
</div>

  );

};

export default GameMode;
