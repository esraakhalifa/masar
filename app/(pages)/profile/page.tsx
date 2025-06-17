'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Layout from '../../../components/Layout';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Mail, Award, Briefcase, GraduationCap, DollarSign, MapPin, Building2, TrendingUp, Handshake, Calendar, Pen } from 'lucide-react';
import { useSession } from 'next-auth/react';

const SKILL_LEVELS = [
  { value: 1, label: 'Beginner' },
  { value: 2, label: 'Novice' },
  { value: 3, label: 'Intermediate' },
  { value: 4, label: 'Advanced' },
  { value: 5, label: 'Expert' }
];

interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  skills: Array<{
    id: string;
    name: string;
    category: string;
    level: number;
  }>;
  preferences?: {
    industry: string;
    location: string;
    workType: string;
    preferredSalary: number;
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
    endDate?: string;
    description?: string;
  }>;
}

export default function ProfilePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      if (!session?.user?.email) {
        console.warn('User email not found in session. Redirecting to build-profile page.', { context: 'Profile Fetch' });
        toast.error('User email not found. Please create a profile.');
        router.push('/build-profile');
        return;
      }

      const response = await fetch(`/api/profile?email=${encodeURIComponent(session.user.email)}`);
      if (!response.ok) {
        if (response.status === 404) {
          console.info('Profile not found for the given email.', { context: 'Profile Fetch' });
          setProfile(null);
          return;
        }
        throw new Error(`Failed to fetch profile: ${response.statusText}`);
      }
      const data: Profile = await response.json();
      console.log('Fetched profile data:', data);
      setProfile(data);
      if (data.avatar) {
        setAvatarPreviewUrl(data.avatar);
      }
      console.info('Profile fetched successfully.', { context: 'Profile Fetch', profileId: data.id });
    } catch (err) {
      console.error(err as Error, { context: 'Profile Fetch' });
      toast.error(`Error loading profile: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [router, session]);

  const initializeCSRFToken = useCallback(async () => {
    try {
      const response = await fetch('/api/csrf', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to initialize CSRF token');
      }

      const { token } = await response.json();
      setCsrfToken(token);
      console.info('CSRF token initialized successfully.', { context: 'CSRF Token Initialization' });
    } catch (error) {
      console.error(error as Error, { context: 'CSRF Token Initialization' });
      toast.error('Failed to initialize security token. Please refresh the page.');
    }
  }, []);

  useEffect(() => {
    fetchProfile();
    initializeCSRFToken();
  }, [fetchProfile, initializeCSRFToken]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const avatarVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2
      }
    }
  };

  const iconVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    hover: {
      scale: 1.2,
      transition: {
        duration: 0.2
      }
    }
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedAvatarFile(null);
      setAvatarPreviewUrl(profile?.avatar || null);
    }
  };

  const handleAvatarUpload = async () => {
    if (!selectedAvatarFile || !profile?.email || !csrfToken) {
      console.warn('Attempted avatar upload without required data.', { 
        context: 'Avatar Upload', 
        hasFile: !!selectedAvatarFile, 
        hasEmail: !!profile?.email, 
        hasToken: !!csrfToken 
      });
      toast.error('Please select an avatar file and ensure your profile email and security token are available.');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('avatar', selectedAvatarFile);
    formData.append('email', profile.email);

    try {
      const response = await fetch('/api/profile/upload-avatar', {
        method: 'POST',
        headers: {
          'x-csrf-token': csrfToken,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload avatar');
      }

      const result = await response.json();
      console.info('Avatar uploaded successfully!', { context: 'Avatar Upload', profileEmail: profile.email, imageUrl: result.avatar });
      toast.success(result.message);
      await fetchProfile();
    } catch (error) {
      console.error(error as Error, { context: 'Avatar Upload' });
      toast.error(error instanceof Error ? error.message : 'An unexpected error occurred during avatar upload.');
    } finally {
      setSelectedAvatarFile(null);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#2434B3]/5 to-white">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#2434B3]"></div>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#2434B3]/5 to-white">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center bg-white p-8 rounded-xl shadow-lg"
          >
            <h1 className="text-3xl font-bold text-[#2434B3] mb-4">Profile not found</h1>
            <p className="mt-2 text-gray-600 mb-6">Please complete your profile first.</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/build-profile')}
              className="px-6 py-3 bg-[#FF4B36] text-white rounded-lg hover:bg-[#FF4B36]/90 transition-colors shadow-md"
            >
              Create Profile
            </motion.button>
          </motion.div>
        </div>
      </Layout>
    );
  }

  // Incomplete profile logic
  const isIncompleteProfile =
    profile &&
    (!profile.skills || profile.skills.length === 0) &&
    (!profile.preferences || !profile.preferences.industry) &&
    (!profile.education || profile.education.length === 0) &&
    (!profile.experience || profile.experience.length === 0);

  if (profile && isIncompleteProfile) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#2434B3]/5 to-white">
          <div className="bg-white rounded-xl shadow-lg border border-[#2434B3]/10 p-10 max-w-md w-full text-center">
            <h1 className="text-3xl font-bold text-[#2434B3] mb-4">Welcome, {profile.firstName} {profile.lastName}!</h1>
            <p className="text-lg text-gray-700 mb-6">{profile.email}</p>
            <p className="text-gray-600 mb-8">Your profile is almost ready. Complete your information to unlock all features!</p>
            <button
              onClick={() => router.push('/build-profile')}
              className="px-8 py-3 bg-[#FF4B36] text-white rounded-lg font-semibold shadow-md hover:bg-[#FF4B36]/90 transition-colors text-lg"
            >
              Complete Your Profile
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-[#2434B3]/5 to-white py-12">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto px-4"
        >
          {/* Header Section */}
          <motion.div 
            variants={itemVariants}
            className="bg-white rounded-xl shadow-lg border border-[#2434B3]/10 p-8 mb-8 flex items-center space-x-6"
          >
            <motion.div 
              variants={avatarVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-[#2434B3]/20 group"
            >
              <Image
                src={avatarPreviewUrl || "/user-placeholder.png"}
                alt="User Avatar"
                layout="fill"
                objectFit="cover"
              />
              <label htmlFor="avatar-upload" className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer">
                <motion.div
                  variants={iconVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                  className="bg-[#FF4B36] p-2 rounded-full"
                >
                  <Pen className="w-5 h-5 text-white" />
                </motion.div>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </motion.div>
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
            >
              <h1 className="text-4xl font-bold text-[#2434B3] mb-2">{profile.firstName} {profile.lastName}</h1>
              <p className="text-gray-600 text-lg flex items-center">
                <Mail className="w-5 h-5 mr-2 text-[#2434B3]" />
                {profile.email}
              </p>
              {selectedAvatarFile && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAvatarUpload}
                  disabled={loading}
                  className={`mt-4 px-4 py-2 text-sm font-medium text-white rounded-md ${
                    loading ? 'bg-[#FF4B36]/50 cursor-not-allowed' : 'bg-[#FF4B36] hover:bg-[#FF4B36]/90'
                  }`}
                >
                  {loading ? 'Uploading...' : 'Save Photo'}
                </motion.button>
              )}
            </motion.div>
          </motion.div>

          {/* Skills Section */}
          <motion.div 
            variants={itemVariants}
            className="bg-white rounded-xl shadow-lg border border-[#2434B3]/10 p-8 mb-8"
          >
            <motion.h2 
              variants={itemVariants}
              className="text-2xl font-semibold text-[#2434B3] mb-6 flex items-center"
            >
              <Award className="w-7 h-7 mr-3 text-[#2434B3]" />Skills
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {profile.skills.map((skill, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  className="bg-[#2434B3]/5 p-4 rounded-lg flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-[#2434B3]">{skill.name}</p>
                    <p className="text-sm text-gray-600">{skill.category}</p>
                  </div>
                  <span className="text-sm font-medium text-[#FF4B36]">
                    {SKILL_LEVELS.find(lvl => lvl.value === skill.level)?.label || skill.level}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Career Preferences */}
          {profile.preferences && (
            <motion.div 
              variants={itemVariants}
              className="bg-white rounded-xl shadow-lg border border-[#2434B3]/10 p-8 mb-8"
            >
              <motion.h2 
                variants={itemVariants}
                className="text-2xl font-semibold text-[#2434B3] mb-6 flex items-center"
              >
                <TrendingUp className="w-7 h-7 mr-3 text-[#2434B3]" />Career Preferences
              </motion.h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { icon: Building2, label: 'Industry', value: profile.preferences.industry },
                  { icon: MapPin, label: 'Location', value: profile.preferences.location },
                  { icon: Handshake, label: 'Work Type', value: profile.preferences.workType },
                  { icon: DollarSign, label: 'Preferred Salary', value: `$${profile.preferences.preferredSalary.toLocaleString()}` }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                    className="bg-[#2434B3]/5 p-4 rounded-lg flex items-center space-x-3"
                  >
                    <item.icon className="w-5 h-5 text-[#2434B3]" />
                    <div>
                      <p className="text-sm text-[#2434B3] font-medium">{item.label}</p>
                      <p className="text-lg text-gray-900 mt-1 capitalize">{item.value}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Education */}
          <motion.div 
            variants={itemVariants}
            className="bg-white rounded-xl shadow-lg border border-[#2434B3]/10 p-8 mb-8"
          >
            <motion.h2 
              variants={itemVariants}
              className="text-2xl font-semibold text-[#2434B3] mb-6 flex items-center"
            >
              <GraduationCap className="w-7 h-7 mr-3 text-[#2434B3]" />Education
            </motion.h2>
            <div className="space-y-6">
              {profile.education.map((edu, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  className="bg-[#2434B3]/5 p-6 rounded-lg"
                >
                  <h3 className="text-xl font-semibold text-[#2434B3]">{edu.degree}</h3>
                  <p className="text-gray-600 mt-1">{edu.fieldOfStudy}</p>
                  <div className="mt-2 flex items-center text-gray-500">
                    <Building2 className="w-4 h-4 mr-2" />
                    <span>{edu.institution}</span>
                  </div>
                  <div className="mt-1 flex items-center text-gray-500">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Graduated {edu.graduationYear}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Experience */}
          <motion.div 
            variants={itemVariants}
            className="bg-white rounded-xl shadow-lg border border-[#2434B3]/10 p-8 mb-8"
          >
            <motion.h2 
              variants={itemVariants}
              className="text-2xl font-semibold text-[#2434B3] mb-6 flex items-center"
            >
              <Briefcase className="w-7 h-7 mr-3 text-[#2434B3]" />Experience
            </motion.h2>
            <div className="space-y-6">
              {profile.experience.map((exp, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  className="bg-[#2434B3]/5 p-6 rounded-lg"
                >
                  <h3 className="text-xl font-semibold text-[#2434B3]">{exp.title}</h3>
                  <div className="mt-2 flex items-center text-gray-600">
                    <Building2 className="w-4 h-4 mr-2" />
                    <span>{exp.company}</span>
                  </div>
                  <div className="mt-1 flex items-center text-gray-500">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>
                      {new Date(exp.startDate).toLocaleDateString()} - {exp.endDate ? new Date(exp.endDate).toLocaleDateString() : 'Present'}
                    </span>
                  </div>
                  {exp.description && (
                    <p className="mt-3 text-gray-600">{exp.description}</p>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </Layout>
  );
}