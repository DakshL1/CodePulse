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
    <div className="bg-white p-4 rounded-lg shadow-md w-full">
      <h2 className="font-bold mb-2">Set Question</h2>
      <textarea
        className="w-full p-2 border rounded"
        placeholder="Enter your question..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />

      <h3 className="font-semibold mt-2">Test Cases</h3>
      {testCases.map((testCase, index) => (
        <div key={index} className="flex gap-2 items-center mt-2">
          <input
            type="text"
            className="p-2 border rounded w-1/3"
            placeholder="Input"
            value={testCase.input}
            onChange={(e) => updateTestCase(index, "input", e.target.value)}
          />
          <input
            type="text"
            className="p-2 border rounded w-1/3"
            placeholder="Expected Output"
            value={testCase.expectedOutput}
            onChange={(e) => updateTestCase(index, "expectedOutput", e.target.value)}
          />
          <button
            onClick={() => removeTestCase(index)}
            className="bg-red-500 text-white p-2 rounded"
          >
            Remove
          </button>
        </div>
      ))}

      <div className="mt-4 flex gap-2">
        <button onClick={addTestCase} className="bg-gray-500 text-white p-2 rounded">
          Add Test Case
        </button>
        <button onClick={sendQuestion} className="bg-blue-500 text-white p-2 rounded">
          Send Question
        </button>
        <button onClick={deleteQuestion} className="bg-red-600 text-white p-2 rounded">
          Delete Question
        </button>
      </div>

      {/* AI Proctoring Alert Log */}
      {alerts.length > 0 && (
        <div className="mt-6 border-t pt-4">
          <h3 className="text-red-600 font-bold mb-2">AI Proctoring Alerts</h3>
          <div className="max-h-40 overflow-y-auto space-y-2">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className="bg-red-100 border border-red-300 text-red-800 p-2 rounded text-sm flex justify-between"
              >
                <span>{alert.message}</span>
                <span className="text-xs text-gray-500">{alert.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewerQuestion;
