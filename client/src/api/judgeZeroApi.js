import axios from 'axios';

// import KEY from './judgeZeroKey';
const KEY = 'df275444c3mshe175bad7459e6f1p16a68ejsn8ae31e5fe911';

const createBulkSubmission = async (id, code, testCases) => {
  console.log("Creating bulk submission:", id, code, testCases);

  const submissions = testCases.map((testCase) => ({
    language_id: id,
    source_code: btoa(code),
    stdin: btoa(testCase.input),
    expected_output: btoa(testCase.expectedOutput),
  }));

  const options = {
    method: 'POST',
    url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
    params: {
      base64_encoded: 'true',
      wait: 'false',
      fields: '*',
    },
    headers: {
      'x-rapidapi-key': KEY,
      'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
      'Content-Type': 'application/json',
    },
    data: { submissions },
  };

  try {
    const response = await axios.request(options);
    const tokens = response.data.map(submission => submission.token);

    if (!tokens.length) {
      console.error("Error: No tokens received from Judge0 API.");
      return [];
    }

    console.log("Fetching bulk submission results for tokens:", tokens);
    
    // Poll for completion of all submissions
    return await pollBulkSubmissions(tokens);

  } catch (error) {
    console.error("Error creating bulk submission:", error);
    return [];
  }
};

// Polling function to check submission statuses until all are complete
const pollBulkSubmissions = async (tokens) => {
  while (true) {
    const results = await getBulkSubmissions(tokens);

    if (!results || results.length === 0) {
      console.error("Error: Failed to fetch bulk submission results.");
      return [];
    }

    // Check if all submissions are completed
    const pending = results.filter(res => res.status_id === 1 || res.status_id === 2);
    if (pending.length === 0) {
      return results;
    }

    console.log(`Waiting for ${pending.length} submissions to complete...`);
    await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms before retrying
  }
};

const getBulkSubmissions = async (tokens) => {
  const options = {
    method: 'GET',
    url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
    params: {
      tokens: tokens.join(','),
      base64_encoded: 'true',
      fields: '*',
    },
    headers: {
      'x-rapidapi-key': KEY,
      'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
    },
  };

  try {
    const response = await axios.request(options);
    
    if (!response.data || !response.data.submissions) {
      console.error("Invalid response format:", response.data);
      return [];
    }

    // Parsing the submissions array
    const parsedResults = response.data.submissions.map(sub => ({
      input: sub.stdin ? atob(sub.stdin) : null,
      output: sub.stdout ? atob(sub.stdout) : null,
      expectedOutput: sub.expected_output ? atob(sub.expected_output) : null,
      error: sub.stderr ? atob(sub.stderr) : null,
      status: sub.status ? sub.status.description : "Unknown",
      status_id: sub.status ? sub.status.id : null,
      compiledOutput: sub.compile_output ? atob(sub.compile_output) : "No compile output",
      testCasePassed: sub.stdout && sub.expected_output ? atob(sub.stdout) === atob(sub.expected_output) : false,
    }));

    console.log("Parsed Bulk Submission Results:", parsedResults);
    return parsedResults;

  } catch (error) {
    console.error("Error fetching bulk submissions:", error);
    return [];
  }
};

export default createBulkSubmission;
