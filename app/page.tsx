"use client";

import Layout from "../components/Layout";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  ArrowRight,
  Upload,
  Target,
  Brain,
  LineChart,
  Award,
  Briefcase,
  GraduationCap,
  Users,
  BookOpen,
} from "lucide-react";

export default function HomePage() {
  const { data: session } = useSession();

  return (
    <Layout>
      {/* Hero Section with Animated Background */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#2434B3] to-[#1a237e] text-white pt-12">
        {/* Animated Background Shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-96 h-96 -top-48 -left-48 bg-[#FF4B36] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute w-96 h-96 -top-48 -right-48 bg-[#2434B3] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute w-96 h-96 bottom-48 left-48 bg-[#FF4B36] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        {/* Hero Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              {session ? (
                <>Welcome back to Masar</>
              ) : (
                <>
                  Shape Your Career Path with{" "}
                  <span className="text-[#FF4B36]">AI</span>
                </>
              )}
            </h1>
            <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto text-blue-100">
              {session ? (
                <>
                  Ready to continue your career development journey? Upload your
                  CV or update your profile to get personalized insights.
                </>
              ) : (
                <>
                  Your AI-powered career development platform. Get personalized
                  roadmaps, skill assessments, and expert guidance to achieve
                  your professional goals.
                </>
              )}
            </p>
            <div className="mt-6 flex justify-center space-x-4 mb-8">
              {session ? (
                <Link
                  href="/upload"
                  className="inline-flex items-center px-6 py-2.5 border border-transparent text-base font-medium rounded-lg text-white bg-[#FF4B36] hover:bg-[#ff634f] transition-all duration-200 transform hover:scale-105"
                >
                  Upload Your CV
                  <Upload className="ml-2 -mr-1 w-4 h-4" />
                </Link>
              ) : (
                <Link
                  href="/register"
                  className="inline-flex items-center px-6 py-2.5 border border-transparent text-base font-medium rounded-lg text-white bg-[#FF4B36] hover:bg-[#ff634f] transition-all duration-200 transform hover:scale-105"
                >
                  Get Started
                  <ArrowRight className="ml-2 -mr-1 w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Wave Separator */}
        <div className="relative w-full" style={{ marginBottom: 0 }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 320"
            className="w-full block h-[180px] md:h-[180px]"
            preserveAspectRatio="none"
          >
            <path
              fill="#ffffff"
              fillOpacity="1"
              d="M0,32L48,53.3C96,75,192,117,288,122.7C384,128,480,96,576,80C672,64,768,64,864,96C960,128,1056,192,1152,186.7C1248,181,1344,107,1392,69.3L1440,32L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            ></path>
          </svg>
        </div>
      </div>

      {/* Features Section */}
      <div className="pb-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">
              {session ? "Your Career Development Tools" : "Why Choose Masar?"}
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              {session
                ? "Access powerful tools to advance your career"
                : "Empowering your career journey with AI-driven insights"}
            </p>
          </div>

          <div className="mt-12 grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow">
              <div className="text-[#2434B3]">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="mt-2 text-lg font-semibold text-gray-900">
                {session ? "CV Analysis" : "Smart Career Planning"}
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                {session
                  ? "Get instant feedback on your CV and suggestions for improvement"
                  : "AI-powered career roadmap tailored to your goals"}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow">
              <div className="text-[#FF4B36]">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="mt-2 text-lg font-semibold text-gray-900">
                {session ? "Skill Analysis" : "Skill Development"}
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                {session
                  ? "Identify your key skills and areas for improvement"
                  : "Personalized recommendations for skill enhancement"}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow">
              <div className="text-[#2434B3]">
                <LineChart className="w-6 h-6" />
              </div>
              <h3 className="mt-2 text-lg font-semibold text-gray-900">
                {session ? "Progress Tracking" : "Career Analytics"}
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                {session
                  ? "Monitor your career growth and achievements"
                  : "Data-driven insights for career advancement"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Career Development Process */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">
              {session ? "Your Career Journey" : "How Masar Works"}
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              {session
                ? "Track your progress through these key stages"
                : "Your path to career success"}
            </p>
          </div>

          <div className="mt-12 grid gap-8 grid-cols-1 md:grid-cols-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <Upload className="w-5 h-5 text-[#2434B3]" />
              <h3 className="mt-2 text-base font-semibold text-gray-900">
                Step 1
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                {session
                  ? "Upload your latest CV"
                  : "Submit your CV for analysis"}
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <Brain className="w-5 h-5 text-[#2434B3]" />
              <h3 className="mt-2 text-base font-semibold text-gray-900">
                Step 2
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                {session
                  ? "Review your AI analysis"
                  : "Get AI-powered insights"}
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <Target className="w-5 h-5 text-[#2434B3]" />
              <h3 className="mt-2 text-base font-semibold text-gray-900">
                Step 3
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                {session
                  ? "Set your career goals"
                  : "Receive personalized roadmap"}
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <LineChart className="w-5 h-5 text-[#2434B3]" />
              <h3 className="mt-2 text-base font-semibold text-gray-900">
                Step 4
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                {session ? "Track your progress" : "Start your journey"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">
              {session ? "Your Career Benefits" : "What You'll Gain"}
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              {session
                ? "Make the most of your premium features"
                : "Transform your career with Masar"}
            </p>
          </div>

          <div className="mt-12 grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <Award className="w-5 h-5 text-[#FF4B36]" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  {session ? "Skill Certification" : "Professional Growth"}
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  {session
                    ? "Get certified for your validated skills"
                    : "Develop new skills and competencies"}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <Briefcase className="w-5 h-5 text-[#2434B3]" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  {session ? "Job Matching" : "Career Opportunities"}
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  {session
                    ? "Get matched with relevant job opportunities"
                    : "Access targeted job recommendations"}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <GraduationCap className="w-5 h-5 text-[#FF4B36]" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  {session ? "Learning Paths" : "Educational Guidance"}
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  {session
                    ? "Customized learning recommendations"
                    : "Discover relevant courses and certifications"}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <Users className="w-5 h-5 text-[#2434B3]" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  {session ? "Network Building" : "Professional Network"}
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  {session
                    ? "Connect with industry professionals"
                    : "Build valuable career connections"}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <Target className="w-5 h-5 text-[#FF4B36]" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  {session ? "Goal Tracking" : "Career Planning"}
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  {session
                    ? "Monitor progress towards your goals"
                    : "Set and achieve career milestones"}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <BookOpen className="w-5 h-5 text-[#2434B3]" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  {session ? "Resource Library" : "Knowledge Base"}
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  {session
                    ? "Access premium career resources"
                    : "Comprehensive career development materials"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-16  bg-gradient-to-br from-[#2434B3] to-[#1a237e] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            {session
              ? "Ready to Update Your Career Profile?"
              : "Start Your Career Journey Today"}
          </h2>
          <p className="text-lg text-blue-100 mb-6">
            {session
              ? "Keep your profile current to get the best recommendations"
              : "Join thousands of professionals advancing their careers with AI"}
          </p>
          <Link
            href={session ? "/upload" : "/register"}
            className="inline-flex items-center px-6 py-2.5 border border-transparent text-base font-medium rounded-lg text-[#2434B3] bg-white hover:bg-gray-100 transition-all duration-200"
          >
            {session ? "Upload New CV" : "Create Free Account"}
            <ArrowRight className="ml-2 -mr-1 w-4 h-4" />
          </Link>
        </div>
      </div>
    </Layout>
  );
}
