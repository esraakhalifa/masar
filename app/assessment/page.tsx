"use client";

import React, { useState } from "react";
import Assessment from "../components/Assessment";

export default function AssessmentPage() {
  const [role, setRole] = useState("");
  const [showAssessment, setShowAssessment] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowAssessment(true);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white py-12">
      {!showAssessment ? (
        <div className="max-w-md mx-auto p-6 bg-black rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold mb-6">Skills Assessment</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="role" className="block text-sm font-medium mb-2">
                Enter Job Role
              </label>
              <input
                type="text"
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g., Frontend Developer"
                className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:border-purple-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-600 transition-colors"
              disabled={!role.trim()}
            >
              Start Assessment
            </button>
          </form>
        </div>
      ) : (
        <Assessment role={role} />
      )}
    </div>
  );
}
