"use client";

import React, { useState, useEffect } from "react";
import Assessment from "../components/Assessment";
import { useSearchParams } from 'next/navigation';
import Layout from '../../components/Layout'
import { FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export default function AssessmentPage() {
  const [role, setRole] = useState("");
  const [showAssessment, setShowAssessment] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const roleFromQuery = searchParams.get('role');
    if (roleFromQuery) {
      setRole(roleFromQuery);
    }
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowAssessment(true);
  };

  if (!role) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <div className="max-w-md w-full mx-auto p-6 bg-white rounded-xl shadow-lg">
            <h1 className="text-2xl font-bold mb-4 text-gray-900">No Job Role Selected</h1>
            <p className="text-gray-600">Please go back and select a job role first.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-[calc(100vh-4rem)]">
        {!showAssessment ? (
          <div className="max-w-2xl w-full mx-auto p-6 bg-white rounded-xl shadow-3xl mt-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2 text-gray-900">Skills Assessment</h1>
              <p className="text-gray-600">Let's evaluate your skills for the {role} position</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">What to Expect</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-[#2434B3] mt-1" />
                  <div>
                    <h3 className="font-medium text-gray-900">Multiple Skills Assessment</h3>
                    <p className="text-gray-600 text-sm">You'll be tested on various skills relevant to {role}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#2434B3] mt-1" />
                  <div>
                    <h3 className="font-medium text-gray-900">Immediate Feedback</h3>
                    <p className="text-gray-600 text-sm">Get instant feedback on your answers</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 mb-8">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-[#2434B3] mt-1" />
                <div>
                  <h3 className="font-medium text-gray-900">Important Notes</h3>
                  <ul className="text-gray-600 text-sm list-disc list-inside mt-2 space-y-1">
                    <li>Each skill will have multiple questions</li>
                    <li>You can't change your answers</li>
                    <li>Complete all questions for accurate assessment</li>
                  </ul>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="text-center">
                <p className="text-gray-700 mb-2">
                  Ready to begin your assessment for <span className="font-semibold text-[#2434B3]">{role}</span>?
                </p>
                <button
                  type="submit"
                  className="w-full px-4 py-3 bg-[#2434B3] text-white rounded-lg hover:bg-[#1e29a3] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  disabled={!role.trim()}
                >
                  Start Assessment
                </button>
              </div>
            </form>
          </div>
        ) : (
          <Assessment role={role} />
        )}
      </div>
    </Layout>
  );
}