export type QueueUpdateEvent = {
  venueSlug: string;
  servicePointId: string;
  newQueueCount: number;
  newEstimatedMinutes: number;
  delayMinutes: number;
  status: "open" | "closed" | "busy" | "delayed";
  timestamp: string;
};

export type ServerToClientEvents = {
  queueUpdated: (data: QueueUpdateEvent) => void;
  userJoined: (socketId: string) => void;
};

export type ClientToServerEvents = {
  joinVenue: (venueSlug: string) => void;
  leaveVenue: (venueSlug: string) => void;
  reportQueueCount: (data: {
    venueSlug: string;
    servicePointId: string;
    count: number;
  }) => void;
};
