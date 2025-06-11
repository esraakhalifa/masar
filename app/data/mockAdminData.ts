import { User, Revenue, Log, AdminStats } from "../types/admin";

// Helper function to generate random dates within a range
const randomDate = (start: Date, end: Date) => {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  ).toISOString();
};

// Generate 100 mock users
export const mockUsers: User[] = Array.from({ length: 100 }, (_, i) => ({
  id: (i + 1).toString(),
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  subscriptionType: ["free", "basic", "premium"][
    Math.floor(Math.random() * 3)
  ] as "free" | "basic" | "premium",
  subscriptionStatus: Math.random() > 0.3 ? "active" : "inactive",
  lastLogin: randomDate(new Date("2024-01-01"), new Date()),
  joinDate: randomDate(new Date("2023-01-01"), new Date()),
  country: [
    "United States",
    "Canada",
    "United Kingdom",
    "Australia",
    "Germany",
    "France",
    "Japan",
  ][Math.floor(Math.random() * 7)],
}));

// Generate 200 mock logs
const logActions = [
  "Login",
  "Logout",
  "Profile Update",
  "Password Change",
  "Subscription Update",
  "Assessment Started",
  "Assessment Completed",
  "Payment Processed",
  "Account Created",
  "Settings Changed",
];

export const mockLogs: Log[] = Array.from({ length: 200 }, (_, i) => ({
  id: (i + 1).toString(),
  userId: mockUsers[Math.floor(Math.random() * mockUsers.length)].id,
  action: logActions[Math.floor(Math.random() * logActions.length)],
  timestamp: randomDate(new Date("2024-01-01"), new Date()),
  details: `Details for action ${i + 1}`,
  type: ["info", "warning", "error"][Math.floor(Math.random() * 3)] as
    | "info"
    | "warning"
    | "error",
}));

export const mockRevenue: Revenue[] = [
  {
    amount: 1299.99,
    date: "2024-03-01T00:00:00Z",
    type: "monthly",
    subscriptionType: "premium",
  },
  {
    amount: 899.99,
    date: "2024-03-01T00:00:00Z",
    type: "monthly",
    subscriptionType: "basic",
  },
  {
    amount: 14399.99,
    date: "2024-01-01T00:00:00Z",
    type: "annual",
    subscriptionType: "premium",
  },
  // Add more mock revenue data as needed
];

export const mockStats: AdminStats = {
  totalUsers: mockUsers.length,
  activeUsers: mockUsers.filter((user) => user.subscriptionStatus === "active")
    .length,
  monthlyRevenue: 2199.98,
  annualRevenue: 25999.97,
  userGrowth: 15,
  revenueGrowth: 8.5,
};
