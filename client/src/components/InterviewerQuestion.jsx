import { useState } from "react";
import socket from "../components/sockets"; // Importing socket instance

const InterviewerQuestion = ({ roomId,testCases,setTestCases }) => {
  const [question, setQuestion] = useState("");
  
 
  
  // Update test case values
  const updateTestCase = (index, field, value) => {
    const newTestCases = [...testCases];
    newTestCases[index][field] = value;
    setTestCases(newTestCases);
  };

  // Add a new test case
  const addTestCase = () => {
    setTestCases([...testCases, { input: "", expectedOutput: "", output: "", status: "Not Executed", testCasePassed: null }]);
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
      // Reset test cases before sending a new question
      const resetTestCases = testCases.map(tc => ({
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        output: "",
        status: "Not Executed",
        testCasePassed: null
      }));
  
      setTestCases(resetTestCases); // Update state
  
      // Emit event with reset test cases
      socket.emit("send-question", { question, testCases: resetTestCases, roomId });
  
      alert("Question sent to the interviewee!");
    }
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
        <div key={index} className="flex gap-2 items-center">
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
      <button onClick={addTestCase} className="bg-gray-500 text-white p-2 mt-2 rounded">
        Add Test Case
      </button>
      <button onClick={sendQuestion} className="bg-blue-500 text-white p-2 mt-2 rounded ml-2">
        Send Question
      </button>
    </div>
  );
};

export default InterviewerQuestion;
