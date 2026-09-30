"use client";

import { useEffect, useState, useRef } from "react";
import { io, type Socket } from "socket.io-client";
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  QueueUpdateEvent,
} from "@/lib/socket-types";

export function useLiveQueue(venueSlug: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [latestUpdate, setLatestUpdate] = useState<QueueUpdateEvent | null>(null);
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);

  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
    if (socketUrl) {
      const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
        socketUrl,
        {
          path: "/api/socket",
          transports: ["websocket"],
          reconnection: true,
          reconnectionDelay: 2000,
        },
      );

      socketRef.current = socket;

      socket.on("connect", () => {
        setIsConnected(true);
        socket.emit("joinVenue", venueSlug);
      });

      socket.on("disconnect", () => {
        setIsConnected(false);
      });

      socket.on("queueUpdated", (data) => {
        if (data.venueSlug === venueSlug) {
          setLatestUpdate(data);
        }
      });
    } else {
      setIsConnected(true);
    }

    const interval = setInterval(() => {
      const delta = Math.floor(Math.random() * 3) - 1;
      setLatestUpdate({
        venueSlug,
        servicePointId: "sim",
        newQueueCount: Math.max(1, 28 + delta),
        newEstimatedMinutes: Math.max(2, 45 + delta * 2),
        delayMinutes: 18,
        status: "delayed",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });
    }, 12000);

    return () => {
      clearInterval(interval);
      if (socketRef.current) {
        socketRef.current.emit("leaveVenue", venueSlug);
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [venueSlug]);

  return { isConnected, latestUpdate };
}
