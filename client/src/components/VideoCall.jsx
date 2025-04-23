import React, { useEffect, useCallback, useState, useRef } from "react";
import ReactPlayer from "react-player";
import peer from "../services/peer";
import socket from "../api/sockets";
import { useNavigate } from "react-router-dom";
import { useRole } from "../context/RoleContext";
import AiProctoring from "../api/AiProctoring";

const VideoCall = ({ layout = "vertical", roomId }) => {
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [myStream, setMyStream] = useState(null);
  const navigate = useNavigate();

  const { role } = useRole();

  const aiStartedRef = useRef(false);
  const aiVideoRef = useRef(null);
  const canvasRef = useRef(null); // <-- Added for drawing

  // Start AI proctoring when the Interviewee is ready
  useEffect(() => {
    if (role === "Interviewee" && myStream && !aiStartedRef.current && aiVideoRef.current && canvasRef.current) {
      aiVideoRef.current.srcObject = myStream;
      aiVideoRef.current.onloadeddata = () => {
        // console.log("[AI PROCTORING] Starting with HTMLVideoElement and Canvas...");
        AiProctoring(aiVideoRef.current, roomId); // <-- Pass canvas
        aiStartedRef.current = true;
      };
      aiVideoRef.current.play();
    }
  }, [role, myStream, roomId]);

  // Stop AI proctoring when the user clicks the stop button
  const handleStopAiProctoring = () => {
    aiStartedRef.current = false;  // Flag to stop AI proctoring
    aiVideoRef.current.srcObject = null; // Stop the video feed
    canvasRef.current.getContext('2d').clearRect(0, 0, canvasRef.current.width, canvasRef.current.height); // Clear the canvas
    console.log("[AI PROCTORING] Stopped.");
  };

  useEffect(() => {
    const intialStreamStart = async () => {
      if (!myStream) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        setMyStream(stream);
      }
    };
    intialStreamStart();
  }, [myStream]);

  const handleUserJoined = useCallback(({ id }) => {
    setRemoteSocketId(id);
    handleCallUser(id);
  }, []);

  const handleCallUser = useCallback(async (id) => {
    try {
      if (!peer.peer || peer.peer.signalingState === "closed") {
        peer.createPeerConnection();
      }
      if (!myStream) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        setMyStream(stream);
      }
      const offer = await peer.getOffer();
      socket.emit("user:call", { to: id, offer });
    } catch (error) {
      console.error("Error accessing media devices:", error);
    }
  }, [myStream]);

  const handleIncomingCall = useCallback(async ({ from, offer }) => {
    try {
      setRemoteSocketId(from);
      if (!myStream) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        setMyStream(stream);
      }
      const answer = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, ans: answer });
    } catch (error) {
      console.error("Error accepting call:", error);
    }
  }, [myStream]);

  const sendStreams = useCallback(() => {
    if (myStream) {
      const existingSenders = peer.peer.getSenders();
      myStream.getTracks().forEach((track) => {
        const alreadyAdded = existingSenders.some((sender) => sender.track === track);
        if (!alreadyAdded) {
          peer.peer.addTrack(track, myStream);
        }
      });
    }
  }, [myStream]);

  const handleCallAccepted = useCallback(({ from, ans }) => {
    peer.setLocalDescription(ans);
    sendStreams();
    socket.emit("initiate:send:streams", { to: from });
  }, [sendStreams]);

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId]);

  useEffect(() => {
    if (peer.peer) {
      peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    }
    return () => {
      if (peer.peer) {
        peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
      }
    };
  }, [handleNegoNeeded]);

  const handleNegoNeedIncoming = useCallback(async ({ from, offer }) => {
    const ans = await peer.getAnswer(offer);
    socket.emit("peer:nego:done", { to: from, ans });
  }, []);

  const handleNegoNeedFinal = useCallback(async ({ ans }) => {
    await peer.setLocalDescription(ans);
  }, []);

  useEffect(() => {
    const trackHandler = (ev) => {
      setRemoteStream(ev.streams[0]);
    };
    if (peer.peer) {
      peer.peer.addEventListener("track", trackHandler);
    }
    return () => {
      if (peer.peer) {
        peer.peer.removeEventListener("track", trackHandler);
      }
    };
  }, []);

  const handleIntervieweeSendStream = useCallback(({ from }) => {
    const sendStreamIfReady = () => {
      if (peer.peer.iceGatheringState === "complete") {
        sendStreams();
        peer.peer.removeEventListener("icegatheringstatechange", sendStreamIfReady);
      } else {
        setTimeout(sendStreamIfReady, 500);
      }
    };
    peer.peer.addEventListener("icegatheringstatechange", sendStreamIfReady);
    sendStreamIfReady();
  }, [sendStreams]);

  const handleEndCall = useCallback(() => {
    if (myStream) {
      myStream.getTracks().forEach((track) => track.stop());
    }
    peer.closeConnection();
    socket.emit("call:ended", { to: remoteSocketId });

    setMyStream(null);
    setRemoteStream(null);
    setRemoteSocketId(null);
    setTimeout(() => navigate("/"), 100);
  }, [remoteSocketId, myStream, navigate]);

  const handleRemoteCallEnd = useCallback(() => {
    alert("Other person left the call!");
    if (myStream) {
      myStream.getTracks().forEach((track) => track.stop());
    }
    peer.closeConnection();
    setMyStream(null);
    setRemoteStream(null);
    setRemoteSocketId(null);
    setTimeout(() => navigate("/"), 100);
  }, [handleEndCall]);

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incoming:call", handleIncomingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeedIncoming);
    socket.on("peer:nego:final", handleNegoNeedFinal);
    socket.on("send:streams", handleIntervieweeSendStream);
    socket.on("endCall", handleRemoteCallEnd);

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incoming:call", handleIncomingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeedIncoming);
      socket.off("peer:nego:final", handleNegoNeedFinal);
      socket.off("send:streams", handleIntervieweeSendStream);
      socket.off("endCall", handleRemoteCallEnd);
    };
  }, [
    handleUserJoined,
    handleIncomingCall,
    handleCallAccepted,
    handleNegoNeedIncoming,
    handleNegoNeedFinal,
    handleIntervieweeSendStream,
    handleRemoteCallEnd,
  ]);

  return (
    <>
      <div className="relative max-w-4xl bg-gray-800 rounded-lg shadow-lg p-4">
        <div
          className={`flex ${layout === "vertical" ? "flex-col gap-4" : "flex-row gap-4"} items-center justify-center`}
        >
          <div className="w-full md:w-1/2 flex flex-col items-center relative">
            {myStream ? (
              <>
                <ReactPlayer
                  url={myStream}
                  playing
                  muted
                  width="100%"
                  height="auto"
                  className="rounded-lg shadow-md"
                />
              </>
            ) : (
              <div className="w-full h-35 bg-gray-900 rounded-lg flex items-center justify-center text-gray-400">
                Waiting for Camera Access...
              </div>
            )}
          </div>

          <div className="w-full md:w-1/2 flex flex-col items-center">
            {remoteStream ? (
              <ReactPlayer
                url={remoteStream}
                playing
                width="100%"
                height="auto"
                className="rounded-lg shadow-md"
              />
            ) : (
              <div className="w-full h-35 bg-gray-900 rounded-lg flex items-center justify-center text-gray-400">
                Waiting for Remote Video...
              </div>
            )}
          </div>
        </div>

        <button
          onClick={handleEndCall}
          className="absolute right-2 px-3 py-1 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition"
        >
          End Call
        </button>
        
      </div>

      <div className="hidden  relative w-[640px] h-[480px] border border-red-500 mt-4">
        <video
          ref={aiVideoRef}
          className="hidden  absolute top-0 left-0 w-full h-full opacity-40 z-10"
          muted
          autoPlay
          playsInline
        />
        <canvas
          ref={canvasRef}
          id="ai-proctor-canvas"
          className="hidden absolute top-0 left-0 w-full h-full z-20"
        />
        
      </div>
      <br />
      <button
          onClick={handleStopAiProctoring}
          className=" hidden absolute left-2 px-3 py-1 bg-yellow-600 text-white rounded-lg shadow-md hover:bg-yellow-700 transition"
        >
          Stop AI Proctoring
        </button>
    </>
  );
};

export default VideoCall;
