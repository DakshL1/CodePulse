import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import socket from "../api/sockets";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { cpp } from "@codemirror/lang-cpp";
import { java } from "@codemirror/lang-java";

const GameMode = () => {
  const [roomId, setRoomID] = useState("");
  const navigate = useNavigate();
  const [playerCode, setPlayerCode] = useState("");
  const [opponentCode, setOpponentCode] = useState("");
  const [language, setLanguage] = useState("");
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [opponentName, setOpponentName] = useState("");
  const [joinRoomId, setJoinRoomId] = useState("");
  const [timerValue, setTimerValue] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [playerOutput, setPlayerOutput] = useState("");
  const [playerInput, setPlayerInput] = useState("");
  const [opponentInput, setOpponentInput] = useState("");
  const [opponentOutput, setOpponentOutput] = useState("");

  const setLanguageExtension = useMemo(() => {
    switch (language) {
      case "python":
        return [python()];
      case "cpp":
        return [cpp()];
      case "java":
        return [java()];
      case "javascript":
        return [javascript()];
      default:
        return [];
    }
  }, [language]);

  const updateCode = useCallback(
    (newCode) => {
      setPlayerCode(newCode);
      if (roomId) socket.emit("update-player-code", { newCode, roomId });
    },
    [roomId]
  );

  const updateLang = useCallback(
    (newLang) => {
      setLanguage(newLang);
    },
    [roomId]
  );

  const startTimer = () => {
    setTimerRunning(true);
    let timeLeft = parseInt(timerValue, 10) || 0;
    if (timeLeft <= 0) return;
    setTimerValue(timeLeft);
    const intervalId = setInterval(() => {
      if (timeLeft > 0) {
        setTimerValue((prevTime) => prevTime - 1);
        timeLeft -= 1;
      } else {
        clearInterval(intervalId);
        setTimerRunning(false);
      }
    }, 1000);
    return () => clearInterval(intervalId);
  };

  const stopTimer = () => {
    setTimerRunning(false);
  };

  const resetTimer = () => {
    setTimerRunning(false);
    setTimerValue(0);
  };

  const runCode = () => {
    if (roomId) {
      socket.emit("run-code", { code: playerCode, language, roomId });
    } else {
      alert("Please join a room first.");
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Top Section: Timer & Room Controls */}
      <div className="flex justify-between items-center p-4 bg-white shadow-md">
        <div>
          {!timerRunning && (
            <input
              type="text"
              placeholder="Room ID"
              value={joinRoomId}
              onChange={(e) => setJoinRoomId(e.target.value)}
              className="p-2 border rounded"
            />
          )}
          {!timerRunning && (
            <button
              onClick={() => navigate(`/game/${joinRoomId}`)}
              className="bg-blue-500 text-white p-2 ml-2 rounded hover:bg-blue-600"
            >
              Join Room
            </button>
          )}
        </div>

        {/* Timer Controls */}
        <div className="flex items-center gap-2">
          {!timerRunning && (
            <input
              type="number"
              placeholder="Timer (seconds)"
              value={timerValue}
              onChange={(e) => setTimerValue(e.target.value)}
              className="p-2 border rounded w-24"
            />
          )}
          <button
            onClick={startTimer}
            disabled={timerRunning}
            className={`p-2 rounded text-white ${
              timerRunning ? "bg-gray-400" : "bg-green-500 hover:bg-green-600"
            }`}
          >
            Start
          </button>
          <button
            onClick={stopTimer}
            className="bg-yellow-500 text-white p-2 rounded"
          >
            Stop
          </button>
          <button
            onClick={resetTimer}
            className="bg-red-500 text-white p-2 rounded"
          >
            Reset
          </button>
          <span className="ml-2 text-lg font-bold">{timerRunning ? `Time: ${timerValue}s` : ""}</span>
        </div>

        <div className="font-bold">{opponentName && `Opponent: ${opponentName}`}</div>
      </div>

      {/* Main Section */}
      <div className="flex flex-1 p-4 gap-4">
        {/* Player's Code Editor */}
        <div className="w-1/2 flex flex-col gap-4">
          <div className="bg-white p-4 shadow-md rounded-lg flex-1">
            <div className="flex justify-between items-center mb-2">
              <p className="font-semibold">Your Code</p>
              <select
                value={language}
                onChange={(e) => updateLang(e.target.value)}
                className="p-2 border rounded"
              >
                <option value="">Select Language</option>
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="cpp">C++</option>
                <option value="java">Java</option>
              </select>
            </div>

            <CodeMirror
              value={playerCode}
              extensions={setLanguageExtension}
              onChange={updateCode}
              basicSetup={{ lineNumbers: true, lineWrapping: true }}
              className="h-56 border rounded-lg overflow-auto"
            />
          </div>

          {/* Player's Input & Output */}
          <div className="flex gap-4">
            <div className="flex-1 bg-white p-4 shadow-md rounded-lg">
              <p className="font-semibold">Input</p>
              <textarea className="w-full h-16 border p-2 rounded"></textarea>
            </div>
            <div className="flex-1 bg-white p-4 shadow-md rounded-lg">
              <p className="font-semibold">Output</p>
              <pre className="overflow-auto h-16 border p-2 rounded">{playerOutput}</pre>
            </div>

            <div className="flex flex-col items-end gap-2">
            <button onClick={runCode} className="bg-blue-500 text-white p-2 rounded w-24">
              Run Code
            </button>
            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className="bg-gray-300 p-2 rounded w-24"
            >
              {isChatOpen ? "Close Chat" : "Open Chat"}
            </button>
          </div>
        </div>
          </div>

        
          

        {/* Opponent's Code Editor + Input/Output */}
        <div className="w-1/2 flex flex-col gap-4">
        <div className="bg-gray-200 p-4 shadow-md rounded-lg flex-1">
            <p className="font-semibold">Opponent's Code</p>
            <textarea
              value={opponentCode}
              readOnly
              className="h-56 border rounded-lg w-full p-2 font-mono bg-gray-100"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1 bg-gray-200 p-4 shadow-md rounded-lg">
              <p className="font-semibold">Opponent's Input</p>
              <pre className="overflow-auto h-16 border p-2 rounded">{opponentInput}</pre>
            </div>
            <div className="flex-1 bg-gray-200 p-4 shadow-md rounded-lg">
              <p className="font-semibold">Opponent's Output</p>
              <pre className="overflow-auto h-16 border p-2 rounded">{opponentOutput}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameMode;
