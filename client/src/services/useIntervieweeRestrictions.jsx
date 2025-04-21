import { useEffect, useState } from "react";
import socket from "../api/sockets";

export const useIntervieweeRestrictions = (role, roomId) => {

  useEffect(() => {
    if (role !== "Interviewee") return;

    // Tab switch detection
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.warn("Tab switch detected");
        socket.emit("violation", { type: "tab-switch", roomId });
      }
    };

    // Block actions like copy/paste/right-click
    const blockEvent = (e) => {
      e.preventDefault();
      socket.emit("violation", { type: e.type, roomId });
    };

    const blockShortcuts = (e) => {
      if ((e.ctrlKey || e.metaKey) && ["c", "v", "x", "a"].includes(e.key.toLowerCase())) {
        e.preventDefault();
        socket.emit("violation", { type: `shortcut-${e.key}`, roomId });
      }
    };

    // Attach listeners
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("copy", blockEvent);
    document.addEventListener("paste", blockEvent);
    document.addEventListener("cut", blockEvent);
    document.addEventListener("contextmenu", blockEvent);
    window.addEventListener("keydown", blockShortcuts);

    // Cleanup
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("copy", blockEvent);
      document.removeEventListener("paste", blockEvent);
      document.removeEventListener("cut", blockEvent);
      document.removeEventListener("contextmenu", blockEvent);
      window.removeEventListener("keydown", blockShortcuts);
    };
  }, [role, roomId,]); 
};
