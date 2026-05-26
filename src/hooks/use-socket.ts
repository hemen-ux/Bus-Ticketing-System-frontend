"use client";

import { useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";

let sharedSocket: Socket | null = null;
let sharedSocketToken: string | null = null;

/**
 * Returns a singleton Socket.IO client connected to the backend.
 * The socket is created once and reused across all components.
 */
export function useSocket(): Socket {
  const socketRef = useRef<Socket | null>(null);

  const token =
    typeof window !== "undefined" ? window.localStorage.getItem("token") : null;

  // Recreate the shared socket if token changed to avoid reusing an authenticated
  // socket from a previous user session.
  if (!sharedSocket || sharedSocketToken !== token) {
    if (sharedSocket) {
      try {
        sharedSocket.disconnect();
      } catch {
        /* ignore */
      }
    }
    sharedSocketToken = token;
    sharedSocket = io(
      process.env.NEXT_PUBLIC_SOCKET_URL ||
        process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
        "https://bus-ticketing-system-backend-1.onrender.com",
      {
        transports: ["websocket", "polling"],
        autoConnect: true,
        auth: token ? { token } : undefined,
      },
    );
  }

  socketRef.current = sharedSocket;

  return socketRef.current;
}

export function disconnectSharedSocket() {
  if (sharedSocket) {
    try {
      sharedSocket.disconnect();
    } catch {
      /* ignore */
    }
    sharedSocket = null;
    sharedSocketToken = null;
  }
}
