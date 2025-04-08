import React, { useEffect, useCallback, useState } from "react";
import ReactPlayer from "react-player";
import peer from "../services/peer";
import socket from "../api/sockets";
import { useNavigate } from "react-router-dom";

const VideoCall = ({ layout = "vertical" }) => {
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [myStream, setMyStream] = useState(null);
  const navigate = useNavigate();

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
      myStream.getTracks().forEach((track) => {
        peer.peer.addTrack(track, myStream);
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
    if (peer.peer) {
      peer.peer.addEventListener("track", (ev) => {
        setRemoteStream(ev.streams[0]);
      });
    }
  }, []);

  const handleIntervieweeSendStream = useCallback(({ from }) => {
    const sendStreamIfReady = () => {
      if (peer.peer.iceGatheringState === "complete") {
        if (myStream) {
          myStream.getTracks().forEach((track) => {
            peer.peer.addTrack(track, myStream);
          });
        }
        peer.peer.removeEventListener("icegatheringstatechange", sendStreamIfReady);
      } else {
        setTimeout(sendStreamIfReady, 500);
      }
    };
    peer.peer.addEventListener("icegatheringstatechange", sendStreamIfReady);
    sendStreamIfReady();
  }, [myStream]);

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
    <div className="relative max-w-4xl bg-gray-800 rounded-lg shadow-lg p-4">
      <div
        className={`flex ${
          layout === "vertical" ? "flex-col gap-4" : "flex-row gap-4"
        } items-center justify-center`}
      >
        {/* Local Video */}
        <div className="w-full md:w-1/2 flex flex-col items-center">
          {myStream ? (
            <ReactPlayer
              url={myStream}
              playing
              muted
              width="100%"
              height="auto"
              className="rounded-lg shadow-md"
            />
          ) : (
            <div className="w-full h-35 bg-gray-900 rounded-lg flex items-center justify-center text-gray-400">
              Waiting for Camera Access...
            </div>
          )}
        </div>

        {/* Remote Video */}
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
  );
};

export default VideoCall;
