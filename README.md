# 🚀 CodePulse

**CodePulse** is a real-time coding interview and competitive programming platform built for interactive, AI-proctored technical assessments. It enables live code collaboration, video calls, and intelligent monitoring in two unique modes: **Interview Mode** and **Game Mode**.

[**View Live Website**](https://code-pulse-pi.vercel.app/)

---

### 📌 Table of Contents

- [🔍 Overview](#-overview)  
- [🎯 Features](#-features)  
- [🧠 Tech Stack](#-tech-stack)  
- [🛠 Installation](#-installation)  
- [📄 License](#-license)  

---

### 🔍 Overview

**CodePulse** is an innovative platform designed to facilitate technical interviews and competitive coding in real-time. It offers:

- Real-time code collaboration using CodeMirror and Socket.io  
- Live video calls via WebRTC  
- AI-based proctoring with MediaPipe  
- Multi-language code execution with Judge0  
- Secure authentication via Auth0  
- Two distinct modes for different use cases:  
  - **Interview Mode** (AI-monitored 1:1 interviews)  
  - **Game Mode** (competitive coding battles)  

---

### 🎯 Features

#### 👨‍💻 Interview Mode
- One-on-one coding interview sessions  
- AI proctoring (face detection, eye tracking, tab switch detection)  
- Fullscreen enforcement for interviewees  
- Secure video call between interviewer and interviewee  
- Real-time code editor with Judge0 integration  

#### 🕹 Game Mode
- Competitive coding battle between two users  
- Real-time multiplayer code editor syncing  
- Countdown timer with real-time updates  
- Question sharing and integrated chat  
- AI proctoring (optional for future versions)  

#### 🧠 AI Proctoring (MediaPipe)
- Multiple face detection  
- Head and eye movement tracking  
- Alerts on tab switching or suspicious activity  
- No face verification required  

---

### 🧠 Tech Stack

- **Frontend:** React, Tailwind CSS, CodeMirror  
- **Backend:** Node.js, Express, Socket.io  
- **Authentication:** Auth0  
- **Code Execution:** Judge0 API  
- **Video Calls:** WebRTC  
- **AI Proctoring:** MediaPipe (Face Mesh + WASM)  
- **Real-time Communication:** Socket.io  
- **UI Animations:** Framer Motion  

---

### 🛠 Installation

1. Clone the repository and install dependencies:
    ```bash
    git clone https://github.com/DakshL1/CodePulse.git
    cd CodePulse

    # Client dependencies
    cd client
    npm install

    # Server dependencies (in a new terminal)
    cd ../server
    npm install
    ````

2. Modify the server port in **server/app.js** (line 15):

    ```js
    const SOCKET_PORT = 3000;
    ```

3. Set environment variables:

    - In **client/.env**:

    ```bash
    VITE_BACKEND_URL=http://localhost:3000
    ```
    - In **server/.env** (create this file if missing):

    ```
    JUDGE0_API_KEY=your_judge0_api_key_here
    ```

4. Update Auth0 provider in **client/src/main.jsx** according to [Auth0 docs](https://auth0.com/docs).

5. Start the development servers:

    ```bash
    # Start client
    cd client
    npm run dev

    # Start server (in another terminal)
    cd ../server
    node app.js
    # or use nodemon for hot reload
    nodemon app.js
    ```

---

### 📄 License


This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
