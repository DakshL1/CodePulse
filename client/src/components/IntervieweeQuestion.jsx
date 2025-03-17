import { useState, useEffect } from "react";
import socket from "../components/sockets"; // Import the socket instance

const IntervieweeQuestion = () => {
  const [receivedQuestion, setReceivedQuestion] = useState(null);

  // Listen for question from interviewer
  useEffect(() => {
    socket.on("receive-question", ({ question, testCases }) => {
      setReceivedQuestion({ question, testCases });
    });

    return () => {
      socket.off("receive-question"); // Cleanup listener
    };
  }, []);

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mt-4 w-full">
      <h2 className="font-bold mb-2">Question</h2>
      {receivedQuestion ? (
        <>
          <p className="mb-2">{receivedQuestion.question}</p>
          <h3 className="font-semibold">Test Cases</h3>
          <ul className="list-disc pl-4">
            {receivedQuestion.testCases.map((testCase, index) => (
              <li key={index} className="bg-gray-100 p-2 rounded-md mt-1">
                Input: <code>{testCase.input}</code>, Expected Output: <code>{testCase.expectedOutput}</code>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p>Waiting for the interviewer to send a question...</p>
      )}
    </div>
  );
};

export default IntervieweeQuestion;
