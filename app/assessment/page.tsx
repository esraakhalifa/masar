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
    <div className="min-h-screen bg-gradient-to-br from-[#4040F2] via-[#5e5ef7] to-[#FF4A3D] text-white py-12">
      {!showAssessment ? (
        <div className="max-w-md mx-auto p-6 bg-black/30 rounded-lg shadow-lg border border-white/10">
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
                className="w-full px-4 py-2 rounded-lg bg-black/20 border border-white/10 focus:outline-none focus:border-white text-white placeholder-white/50"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-[#FF4B36] text-white rounded-lg hover:bg-[#FF4B36]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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