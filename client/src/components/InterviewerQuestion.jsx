import { useState, useEffect } from "react";
import socket from "../api/sockets"; // Importing socket instance

const InterviewerQuestion = ({ roomId, testCases, setTestCases }) => {
  const [question, setQuestion] = useState("");
  const [alerts, setAlerts] = useState([]);

  // Socket listener for proctoring alerts
  useEffect(() => {
    socket.on("alert", ({ message, type }) => {
      setAlerts((prev) => [
        {
          message,
          type,
          timestamp: new Date().toLocaleTimeString(),
        },
        ...prev,
      ]);
      
    });

    return () => {
      socket.off("alert");
    };
  }, []);

  // Update test case values
  const updateTestCase = (index, field, value) => {
    const newTestCases = [...testCases];
    newTestCases[index][field] = value;
    setTestCases(newTestCases);
  };

  // Add a new test case
  const addTestCase = () => {
    setTestCases([
      ...testCases,
      {
        input: "",
        expectedOutput: "",
        output: "",
        status: "Not Executed",
        testCasePassed: null,
      },
    ]);
  };

  // Remove a test case
  const removeTestCase = (index) => {
    if (testCases.length > 1) {
      setTestCases(testCases.filter((_, i) => i !== index));
    } else {
      alert("At least one test case is required.");
    }
  };

  // Send question to interviewee
  const sendQuestion = () => {
    if (question.trim()) {
      const resetTestCases = testCases.map((tc) => ({
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        output: "",
        status: "Not Executed",
        testCasePassed: null,
      }));

      setTestCases(resetTestCases);
      socket.emit("send-question", { question, testCases: resetTestCases, roomId });

      alert("Question sent to the interviewee!");
    }
  };

  // Delete question
  const deleteQuestion = () => {
    setQuestion("");
    setTestCases([
      {
        input: "",
        expectedOutput: "",
        output: "",
        status: "Not Executed",
        testCasePassed: null,
      },
    ]);

    socket.emit("delete-question", { roomId });
  };

  return (
    <div className="bg-zinc-800 text-white p-4 rounded-lg shadow-md w-full h-full flex flex-col">
    {/* Upper section: Question and Test Cases */}
    <div className="flex flex-col flex-[70%]  pr-1">
      <h2 className="font-bold mb-2">Set Question</h2>
      <textarea
        className="w-full p-2 rounded bg-zinc-700 border border-zinc-600 text-white font-mono"
        placeholder="Enter your question..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        spellCheck={false}
      />

  
      <h3 className="font-semibold mt-4">Test Cases</h3>
      {testCases.map((testCase, index) => (
        <div key={index} className="flex gap-2 items-center mt-2">
          <input
            type="text"
            className="p-2 rounded bg-zinc-700 border border-zinc-600 text-white w-1/3"
            placeholder="Input"
            value={testCase.input}
            onChange={(e) => updateTestCase(index, "input", e.target.value)}
          />
          <input
            type="text"
            className="p-2 rounded bg-zinc-700 border border-zinc-600 text-white w-1/3"
            placeholder="Expected Output"
            value={testCase.expectedOutput}
            onChange={(e) => updateTestCase(index, "expectedOutput", e.target.value)}
          />
          <button
            onClick={() => removeTestCase(index)}
            className="bg-red-700 text-white p-2 rounded hover:bg-red-800"
          >
            Remove
          </button>
        </div>
      ))}
  
      <div className="mt-4 flex gap-2">
        <button onClick={addTestCase} className="bg-zinc-600 text-white p-2 rounded hover:bg-zinc-500">
          Add Test Case
        </button>
        <button onClick={sendQuestion} className="bg-purple-700 text-white p-2 rounded hover:bg-purple-600">
          Send Question
        </button>
        <button onClick={deleteQuestion} className="bg-red-700 text-white p-2 rounded hover:bg-red-800">
          Delete Question
        </button>
      </div>
    </div>
  
    {/* Lower section: AI Proctoring Alerts */}
    <div className="flex-[30%]">
    <h3 className="text-red-400 font-bold mb-2">AI Proctoring Alerts</h3>
    {alerts.length > 0 && (
      <div className=" overflow-y-auto">
        
        <div className="max-h-full overflow-y-auto space-y-2 pr-1">
          {alerts.map((alert, index) => (
            <div
              key={index}
              className="bg-red-900/30 border border-red-400 text-red-300 p-2 rounded text-sm flex justify-between"
            >
              <span>{alert.message}</span>
              <span className="text-xs text-zinc-400">{alert.timestamp}</span>
            </div>
          ))}
        </div>
      </div>
    )}
    </div>

  </div>
  

  );
};

export default InterviewerQuestion;
