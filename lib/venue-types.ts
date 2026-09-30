export type ServicePointItem = {
  _id?: string;
  id?: string;
  name: string;
  type: "registration" | "consultation" | "lab" | "payment" | "counter" | "window" | "general";
  currentQueueCount: number;
  estimatedWaitMinutes: number;
  status: "open" | "closed" | "busy" | "delayed";
  delayMinutes: number;
  lastUpdated?: string;
};

export type QueueReportItem = {
  _id?: string;
  id?: string;
  reportedCount: number;
  reportedWaitMinutes: number;
  servicePointName: string;
  notes: string;
  timeAgo: string;
  isAnonymous: boolean;
};

export type HourlyStatItem = {
  hour: number;
  label: string;
  waitMinutes: number;
  busyness: "low" | "medium" | "high" | "peak";
};

export type VenueItem = {
  _id?: string;
  id?: string;
  slug: string;
  name: string;
  category: "hospital" | "clinic" | "government" | "bank" | "salon" | "repair" | "restaurant" | "university" | "passport";
  address: string;
  city: string;
  distanceKm?: number;
  totalWaitingCount: number;
  averageWaitMinutes: number;
  statusText: string;
  isVerified: boolean;
  isPublished?: boolean;
  gstNumber?: string;
  businessPhone?: string;
  ownerId?: string;
  servicePoints: ServicePointItem[];
  recentReports?: QueueReportItem[];
  hourlyStats?: HourlyStatItem[];
  bestVisitingTime?: string;
};
