'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

interface Profile {
  id: string;
  fullName: string;
  email: string;
  skills: Array<{
    id: string;
    name: string;
    level: number;
    category: string;
  }>;
  preferences: {
    id: string;
    industry: string;
    preferredSalary: number;
    workType: string;
    location: string;
  };
  education: Array<{
    id: string;
    degree: string;
    fieldOfStudy: string;
    institution: string;
    graduationYear: number;
  }>;
  experience: Array<{
    id: string;
    title: string;
    company: string;
    startDate: string;
    endDate: string | null;
    description: string | null;
  }>;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5
    }
  }
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const email = localStorage.getItem('userEmail');
        if (!email) {
          router.push('/');
          return;
        }

        const response = await fetch(`/api/profile?email=${email}`);
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await response.json();
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center bg-white p-8 rounded-xl shadow-lg"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Profile not found</h1>
          <p className="mt-2 text-gray-600 mb-6">Please complete your profile first.</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/build-profile')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
          >
            Create Profile
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 py-12">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto px-4"
      >
        {/* Header Section */}
        <motion.div 
          variants={itemVariants}
          className="bg-white rounded-xl shadow-lg border border-indigo-100 p-8 mb-8"
        >
          <h1 className="text-4xl font-bold text-indigo-900 mb-2">{profile.fullName}</h1>
          <p className="text-indigo-600 text-lg">{profile.email}</p>
        </motion.div>

        {/* Skills Section */}
        <motion.div 
          variants={itemVariants}
          className="bg-white rounded-xl shadow-lg border border-indigo-100 p-8 mb-8"
        >
          <h2 className="text-2xl font-semibold text-indigo-900 mb-6">Skills</h2>
          <div className="flex flex-wrap gap-3">
            {profile.skills.map((skill) => (
              <motion.span
                key={skill.id}
                whileHover={{ scale: 1.05 }}
                className="px-4 py-2 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium shadow-sm"
              >
                {skill.name} (Level {skill.level})
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* Career Preferences */}
        <motion.div 
          variants={itemVariants}
          className="bg-white rounded-xl shadow-lg border border-indigo-100 p-8 mb-8"
        >
          <h2 className="text-2xl font-semibold text-indigo-900 mb-6">Career Preferences</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-indigo-50 p-4 rounded-lg">
              <p className="text-sm text-indigo-600 font-medium">Industry</p>
              <p className="text-lg text-indigo-900 mt-1">{profile.preferences.industry}</p>
            </div>
            <div className="bg-indigo-50 p-4 rounded-lg">
              <p className="text-sm text-indigo-600 font-medium">Location</p>
              <p className="text-lg text-indigo-900 mt-1">{profile.preferences.location}</p>
            </div>
            <div className="bg-indigo-50 p-4 rounded-lg">
              <p className="text-sm text-indigo-600 font-medium">Work Type</p>
              <p className="text-lg text-indigo-900 mt-1 capitalize">{profile.preferences.workType}</p>
            </div>
            <div className="bg-indigo-50 p-4 rounded-lg">
              <p className="text-sm text-indigo-600 font-medium">Preferred Salary</p>
              <p className="text-lg text-indigo-900 mt-1">${profile.preferences.preferredSalary.toLocaleString()}</p>
            </div>
          </div>
        </motion.div>

        {/* Education */}
        <motion.div 
          variants={itemVariants}
          className="bg-white rounded-xl shadow-lg border border-indigo-100 p-8 mb-8"
        >
          <h2 className="text-2xl font-semibold text-indigo-900 mb-6">Education</h2>
          <div className="space-y-6">
            {profile.education.map((edu) => (
              <motion.div 
                key={edu.id} 
                whileHover={{ scale: 1.02 }}
                className="bg-indigo-50 p-6 rounded-lg border border-indigo-100"
              >
                <h3 className="text-xl font-medium text-indigo-900">{edu.degree} in {edu.fieldOfStudy}</h3>
                <p className="text-indigo-700 mt-2">{edu.institution}</p>
                <p className="text-indigo-600 mt-1">Graduated: {edu.graduationYear}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Experience */}
        <motion.div 
          variants={itemVariants}
          className="bg-white rounded-xl shadow-lg border border-indigo-100 p-8"
        >
          <h2 className="text-2xl font-semibold text-indigo-900 mb-6">Work Experience</h2>
          <div className="space-y-6">
            {profile.experience.map((exp) => (
              <motion.div 
                key={exp.id} 
                whileHover={{ scale: 1.02 }}
                className="bg-indigo-50 p-6 rounded-lg border border-indigo-100"
              >
                <h3 className="text-xl font-medium text-indigo-900">{exp.title}</h3>
                <p className="text-indigo-700 mt-2">{exp.company}</p>
                <p className="text-indigo-600 mt-1">
                  {new Date(exp.startDate).toLocaleDateString()} - {exp.endDate ? new Date(exp.endDate).toLocaleDateString() : 'Present'}
                </p>
                {exp.description && (
                  <p className="mt-3 text-indigo-700 bg-white p-3 rounded-md">{exp.description}</p>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}