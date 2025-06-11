"use client";

import React, { useState, useMemo } from "react";
import {
  mockStats,
  mockUsers,
  mockLogs,
  mockRevenue,
} from "../data/mockAdminData";
import {
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
  }>;
}

interface RevenueTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: {
      date: string;
      amount: number;
    };
  }>;
}

export default function AdminDashboard() {
  // Pagination state
  const [userPage, setUserPage] = useState(1);
  const [logPage, setLogPage] = useState(1);
  const itemsPerPage = 5;

  // Filter state
  const [userStatusFilter, setUserStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [logTypeFilter, setLogTypeFilter] = useState<
    "all" | "info" | "warning" | "error"
  >("all");

  // Filter and paginate users
  const filteredUsers = useMemo(() => {
    return mockUsers.filter((user) =>
      userStatusFilter === "all"
        ? true
        : user.subscriptionStatus === userStatusFilter
    );
  }, [userStatusFilter]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (userPage - 1) * itemsPerPage;
    return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUsers, userPage]);

  // Filter and paginate logs
  const filteredLogs = useMemo(() => {
    return mockLogs.filter((log) =>
      logTypeFilter === "all" ? true : log.type === logTypeFilter
    );
  }, [logTypeFilter]);

  const paginatedLogs = useMemo(() => {
    const startIndex = (logPage - 1) * itemsPerPage;
    return filteredLogs.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredLogs, logPage]);

  // Prepare data for pie chart
  const userDistributionData = [
    { name: "Active Users", value: mockStats.activeUsers },
    {
      name: "Inactive Users",
      value: mockStats.totalUsers - mockStats.activeUsers,
    },
  ];

  const COLORS = ["#2434B3", "#FF4B36"];

  // Prepare data for revenue line chart
  const revenueData = mockRevenue.map((rev) => ({
    date: new Date(rev.date).toLocaleDateString(),
    amount: rev.amount,
    type: rev.type,
  }));

  // Custom tooltip for pie chart
  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-900">{payload[0].name}</p>
          <p className="text-sm text-gray-600">
            {payload[0].value.toLocaleString()} users
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for revenue chart
  const RevenueTooltip = ({ active, payload }: RevenueTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-900">
            ${payload[0].value.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">{payload[0].payload.date}</p>
        </div>
      );
    }
    return null;
  };

  // Pagination controls component with improved styling
  const PaginationControls = ({
    currentPage,
    totalItems,
    onPageChange,
  }: {
    currentPage: number;
    totalItems: number;
    onPageChange: (page: number) => void;
  }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    return (
      <div className="flex items-center justify-between mt-4">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors duration-200 
                   disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white/10
                   flex items-center gap-2 text-sm font-medium"
        >
          ← Previous
        </button>
        <div className="flex items-center gap-2 text-white">
          <span className="px-3 py-1 bg-white/10 rounded-lg text-sm">
            Page {currentPage} of {totalPages}
          </span>
        </div>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors duration-200 
                   disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white/10
                   flex items-center gap-2 text-sm font-medium"
        >
          Next →
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div
            className="relative p-8 rounded-lg"
            style={{
              background:
                "linear-gradient(white, white) padding-box, linear-gradient(to right, #2434B3, #FF4B36) border-box",
              border: "2px solid transparent",
            }}
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#2434B3] to-[#FF4B36] text-transparent bg-clip-text font-display tracking-tight">
              Admin Dashboard
            </h1>
            <p className="mt-2 text-gray-600 text-lg font-medium">
              Monitor your platform&apos;s performance and user activity
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* User Distribution Pie Chart */}
          <div className="p-6 rounded-lg shadow-lg bg-gradient-to-r from-[#2434B3] to-[#4456D7] text-white">
            <h3 className="text-xl font-semibold mb-4">User Distribution</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={userDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={{ stroke: "white", strokeWidth: 2 }}
                  >
                    {userDistributionData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    formatter={(value) => (
                      <span className="text-white">
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-white/90">
                Total Users: {mockStats.totalUsers.toLocaleString()}
              </p>
              <p className="text-sm text-white/90">
                Growth: +{mockStats.userGrowth}%
              </p>
            </div>
          </div>

          {/* Revenue Line Chart */}
          <div className="p-6 rounded-lg shadow-lg bg-gradient-to-r from-[#FF4B36] to-[#FF7366] text-white">
            <h3 className="text-xl font-semibold mb-4">Revenue Overview</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient
                      id="revenueGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="white" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="white" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.1)"
                  />
                  <XAxis
                    dataKey="date"
                    stroke="white"
                    tick={{ fill: "white" }}
                  />
                  <YAxis
                    stroke="white"
                    tick={{ fill: "white" }}
                    tickFormatter={(value) => `$${value.toLocaleString()}`}
                  />
                  <Tooltip
                    content={<RevenueTooltip />}
                    cursor={{ stroke: "white", strokeWidth: 1 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="white"
                    strokeWidth={2}
                    fill="url(#revenueGradient)"
                    isAnimationActive={true}
                  />
                  {revenueData.map((entry, index) => {
                    if (index === 0) return null;
                    const prev = revenueData[index - 1];
                    const isIncrease = entry.amount > prev.amount;

                    return (
                      <text
                        key={`arrow-${index}`}
                        x={index * (100 / (revenueData.length - 1)) + "%"}
                        y={isIncrease ? "20%" : "80%"}
                        fill="white"
                        textAnchor="middle"
                        fontSize="20"
                      >
                        {isIncrease ? "↑" : "↓"}
                      </text>
                    );
                  })}
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-white/90">
                Monthly Revenue: ${mockStats.monthlyRevenue.toLocaleString()}
              </p>
              <p className="text-sm text-white/90">
                Growth: +{mockStats.revenueGrowth}%
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Users Table */}
          <div className="bg-gradient-to-br from-[#2434B3] to-[#4456D7] rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Users</h2>
              <select
                value={userStatusFilter}
                onChange={(e) => {
                  setUserStatusFilter(
                    e.target.value as "all" | "active" | "inactive"
                  );
                  setUserPage(1);
                }}
                className="bg-white text-[#2434B3] border-2 border-white/20 rounded-lg px-3 py-1.5
                         text-sm font-medium focus:outline-none focus:border-white
                         appearance-none cursor-pointer
                         bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20d%3D%22M6%208l4%204%204-4%22%20fill%3D%22none%22%20stroke%3D%22%232434B3%22%20stroke-width%3D%222%22%2F%3E%3C%2Fsvg%3E')]
                         bg-[length:20px] bg-no-repeat bg-[center_right_0.5rem] pr-8"
              >
                <option value="all">All Users</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left py-3 px-4 text-white/80">Name</th>
                    <th className="text-left py-3 px-4 text-white/80">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-white/80">
                      Subscription
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map((user) => (
                    <tr key={user.id} className="border-b border-white/20">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-white">{user.name}</p>
                          <p className="text-sm mb-1.5 text-white/80">
                            {user.email}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.subscriptionStatus === "active"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {user.subscriptionStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="capitalize text-white">
                          {user.subscriptionType}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <PaginationControls
                currentPage={userPage}
                totalItems={filteredUsers.length}
                onPageChange={setUserPage}
              />
            </div>
          </div>

          {/* Activity Logs */}
          <div className="bg-gradient-to-br from-[#FF4B36] to-[#FF7366] rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Activity Logs</h2>
              <select
                value={logTypeFilter}
                onChange={(e) => {
                  setLogTypeFilter(
                    e.target.value as "all" | "info" | "warning" | "error"
                  );
                  setLogPage(1);
                }}
                className="bg-white text-[#FF4B36] border-2 border-white/20 rounded-lg px-3 py-1.5
                         text-sm font-medium focus:outline-none focus:border-white
                         appearance-none cursor-pointer
                         bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20d%3D%22M6%208l4%204%204-4%22%20fill%3D%22none%22%20stroke%3D%22%23FF4B36%22%20stroke-width%3D%222%22%2F%3E%3C%2Fsvg%3E')]
                         bg-[length:20px] bg-no-repeat bg-[center_right_0.5rem] pr-8"
              >
                <option value="all">All Types</option>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
              </select>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left py-3 px-4 text-white/80">
                      Action
                    </th>
                    <th className="text-left py-3 px-4 text-white/80">
                      Details
                    </th>
                    <th className="text-left py-3 px-4 text-white/80">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedLogs.map((log) => (
                    <tr key={log.id} className="border-b border-white/20">
                      <td className="py-3.5 px-4">
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                log.type === "info"
                                  ? "bg-white"
                                  : log.type === "warning"
                                  ? "bg-yellow-400"
                                  : "bg-red-500"
                              }`}
                            />
                            <p className="font-medium text-white">
                              {log.action}
                            </p>
                          </div>
                          <p className="text-sm text-white/70 capitalize">
                            {log.type}
                          </p>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div>
                          <p className="text-sm text-white/80 leading-relaxed">
                            {log.details}
                          </p>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div>
                          <p className="text-sm text-white/80 mb-0.5">
                            {new Date(log.timestamp).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-white/60">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <PaginationControls
                currentPage={logPage}
                totalItems={filteredLogs.length}
                onPageChange={setLogPage}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
