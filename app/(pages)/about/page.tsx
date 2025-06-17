"use client";

import Layout from "../../../components/Layout";
import { motion } from "framer-motion";
import { Users, Target, Lightbulb, Award } from "lucide-react";

export default function AboutPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <Layout>
      <main className="min-h-screen bg-gradient-to-br from-purple-50 to-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-16"
          >
            {/* Hero Section */}
            <motion.div variants={itemVariants} className="text-center">
              <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
                About Masar
              </h1>
              <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
                Empowering professionals with AI-driven career insights and
                personalized learning roadmaps.
              </p>
            </motion.div>

            {/* Mission Section */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-2xl shadow-xl p-8"
            >
              <div className="max-w-3xl mx-auto">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Our Mission
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  At Masar, we believe in empowering individuals to take control
                  of their professional journey. Our mission is to revolutionize
                  career development by leveraging artificial intelligence to
                  provide personalized guidance, skill assessments, and learning
                  pathways that align with industry demands and individual
                  aspirations.
                </p>
              </div>
            </motion.div>

            {/* Values Section */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <Users className="w-12 h-12 text-purple-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  User-Centric
                </h3>
                <p className="text-gray-600">
                  We put our users first, ensuring every feature and
                  recommendation is tailored to individual needs.
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <Target className="w-12 h-12 text-purple-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Precision
                </h3>
                <p className="text-gray-600">
                  Our AI-powered analysis provides accurate and actionable
                  insights for career development.
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <Lightbulb className="w-12 h-12 text-purple-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Innovation
                </h3>
                <p className="text-gray-600">
                  We continuously evolve our platform with cutting-edge
                  technology and industry best practices.
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <Award className="w-12 h-12 text-purple-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Excellence
                </h3>
                <p className="text-gray-600">
                  We strive for excellence in every aspect of our service and
                  user experience.
                </p>
              </div>
            </motion.div>

            {/* Team Section */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-2xl shadow-xl p-8 text-center"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Our Team
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                We are a dedicated team of professionals passionate about career
                development and technology. Our diverse expertise spans
                artificial intelligence, career counseling, and professional
                development, allowing us to provide comprehensive solutions for
                your career journey.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </main>
    </Layout>
  );
}
