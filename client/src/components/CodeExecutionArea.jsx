import React, { useEffect, useState, useCallback } from 'react';
import createBulkSubmission from '../api/judgeZeroApi';
import socket from '../api/sockets';

const CodeExecutionArea = ({ roomId, testCases, code, language, setTestCases }) => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [selectedTestCase, setSelectedTestCase] = useState(0);
  const [id, setId] = useState(0);

  
  useEffect(() => {
    let newId;
    switch (language) {
      case "python": newId = 92; break;
      case "cpp": newId = 54; break;
      case "java": newId = 91; break;
      case "javascript": newId = 93; break;
      default: newId = null;
    }
    setId(newId);
  }, [language]);

  // Listen for updates from the interviewer/interviewee
  useEffect(() => {
    socket.on("update-output", (updatedTestCases) => {
      setTestCases(updatedTestCases);
    });

    return () => {
      socket.off("update-output"); // Cleanup listener
    };
  }, [setTestCases]);

  const executeCode = useCallback(async () => {
    if (code.trim() === "" || !language) {
      alert("Please enter code and select a language.");
      return;
    }
    setIsExecuting(true);

    // Mark test cases as "Running..."
    setTestCases(prevTestCases => prevTestCases.map(tc => ({
      ...tc,
      status: "Running...",
      output: ""
    })));

    try {
      const response = await createBulkSubmission(id, code, testCases);

      if (response && response.length > 0) {
        const updatedTestCases = testCases.map((tc, index) => ({
          ...tc,
          output: response[index].output || "No Output",
          status: response[index].testCasePassed ? "Success" : "Failed",
          testCasePassed: response[index].testCasePassed
        }));

        // Update the local test case state
        setTestCases(updatedTestCases);

        // Emit the updated results to the room
        socket.emit("send-output", { testCases: updatedTestCases, roomId });
      }
    } catch (error) {
      console.error("Execution error:", error);
      setTestCases(prevTestCases => prevTestCases.map(tc => ({
        ...tc,
        status: "Error",
        output: "Execution failed"
      })));
    } finally {
      setIsExecuting(false);
    }
  }, [code, id, testCases, roomId, setTestCases]);

  return (
<div className="p-4 shadow-md rounded-lg flex-1 flex flex-col text-white" style={{ backgroundColor: "hsl(0, 0%, 6%)" }}>
  {/* Header */}
  <div className="flex justify-between items-center mb-2">
    <h2 className="font-semibold text-white">Code Execution Area</h2>
    <button
      onClick={executeCode}
      disabled={isExecuting || !testCases.length}
      className={`text-white px-3 py-1 rounded text-sm transition-colors ${
        isExecuting || !testCases.length ? "bg-gray-700" : "bg-green-600 hover:bg-green-700"
      }`}
    >
      {isExecuting ? "Running..." : "Run Test"}
    </button>
  </div>

  <div className="flex gap-4 h-full">
    {/* Test Case List */}
    {testCases.length === 0 || testCases[0]?.input.trim() === "" ? (
      <p className="text-gray-400 text-sm italic flex-1 flex items-center justify-center">
        No test cases available.
      </p>
    ) : (
      <>
        <div className="w-1/3 border border-gray-700 rounded-lg p-2 overflow-y-auto bg-[hsl(0,0%,10%)]">
          <h3 className="text-sm font-medium mb-2 text-gray-300">Test Case List</h3>
          <div className="space-y-2">
            {testCases.map((testCase, index) => (
              <div
                key={index}
                className={`p-2 rounded cursor-pointer transition-colors ${
                  selectedTestCase === index
                    ? "bg-[hsl(0,0%,24%)] border border-gray-400"
                    : "bg-[hsl(0,0%,14%)] hover:bg-[hsl(0,0%,18%)]"
                }`}
                onClick={() => setSelectedTestCase(index)}
              >
                <p className="text-xs font-medium text-gray-200">Test Case {index + 1}</p>
                <p
                  className={`text-xs ${
                    testCase.status === "Success"
                      ? "text-green-400"
                      : testCase.status === "Failed"
                      ? "text-red-400"
                      : "text-gray-400"
                  }`}
                >
                  {testCase.status || "Not Executed"}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Test Case Details */}
        <div className="w-2/3 border border-gray-700 rounded-lg p-2 flex flex-col bg-[hsl(0,0%,10%)]">
          <h3 className="text-sm font-medium mb-2 text-gray-300">Test Case Details</h3>
          {testCases.length > 0 && (
            <div className="space-y-2 flex-1">
              <div className="bg-[hsl(0,0%,14%)] p-2 rounded">
                <p className="text-xs font-medium text-gray-300">Input:</p>
                <p className="font-mono text-xs whitespace-pre-wrap text-gray-200">
                  {testCases[selectedTestCase]?.input}
                </p>
              </div>
              <div className="bg-[hsl(0,0%,14%)] p-2 rounded">
                <p className="text-xs font-medium text-gray-300">Expected Output:</p>
                <p className="font-mono text-xs whitespace-pre-wrap text-gray-200">
                  {testCases[selectedTestCase]?.expectedOutput}
                </p>
              </div>

              {testCases[selectedTestCase]?.output && (
                <div className="bg-[hsl(0,0%,14%)] p-2 rounded mt-2 flex-1 overflow-y-auto">
                  <p className="text-xs font-medium text-gray-300">Output:</p>
                  <p className="font-mono text-xs whitespace-pre-wrap text-gray-200">
                    {testCases[selectedTestCase]?.output}
                  </p>
                  <p
                    className={`text-xs font-medium mt-1 ${
                      testCases[selectedTestCase]?.status === "Success" ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {testCases[selectedTestCase]?.status}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </>
    )}
  </div>
</div>

  
  );
};

export default CodeExecutionArea;
