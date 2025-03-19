import { useState, useEffect } from "react";
import socket from "../components/sockets"; // Import the socket instance

const IntervieweeQuestion = ({ testCases, setTestCases }) => {
  const [receivedQuestion, setReceivedQuestion] = useState(null);

  // Listen for question from interviewer
  useEffect(() => {
    socket.on("receive-question", ({ question, testCases }) => {
      setReceivedQuestion(question);
      setTestCases(testCases);
    });

    socket.on("receive-delete-question" , () => {
      setReceivedQuestion("");
      setTestCases([{ input: "", expectedOutput: "", output: "", status: "Not Executed", testCasePassed: null }]); // Clear test cases

    });

    return () => {
      socket.off("receive-question"); // Cleanup listener
    };
  }, [setTestCases]);

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mt-4 w-full">
      <h2 className="font-bold mb-2">Question</h2>
      {receivedQuestion ? (
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="mb-2 whitespace-pre-wrap">{receivedQuestion}</p>
        </div>
      ) : (
        <p className="text-gray-500">Waiting for the interviewer to send a question...</p>
      )}
    </div>
  );
};

export default IntervieweeQuestion;