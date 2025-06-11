export interface User {
  id: string;
  name: string;
  email: string;
  subscriptionType: "free" | "basic" | "premium";
  subscriptionStatus: "active" | "inactive" | "expired";
  lastLogin: string;
  joinDate: string;
  country: string;
}

export interface Revenue {
  amount: number;
  date: string;
  type: "monthly" | "annual";
  subscriptionType: "basic" | "premium";
}

export interface Log {
  id: string;
  userId: string;
  action: string;
  timestamp: string;
  details: string;
  type: "info" | "warning" | "error";
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  monthlyRevenue: number;
  annualRevenue: number;
  userGrowth: number;
  revenueGrowth: number;
}
