'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Layout from '../../../components/Layout';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { User, Mail, Award, Briefcase, GraduationCap, DollarSign, MapPin, Building2, TrendingUp, Handshake } from 'lucide-react';

interface Profile {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
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
  } | null;
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

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        console.warn('User email not found. Redirecting to build-profile page.', { context: 'Profile Fetch' });
        toast.error('User email not found. Please create a profile.');
        router.push('/build-profile');
        return;
      }

      const response = await fetch(`/api/profile?email=${encodeURIComponent(userEmail)}`);
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
      if (data.avatarUrl) {
        setAvatarPreviewUrl(data.avatarUrl);
      }
      console.info('Profile fetched successfully.', { context: 'Profile Fetch', profileId: data.id });
    } catch (err) {
      console.error(err as Error, { context: 'Profile Fetch' });
      toast.error(`Error loading profile: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [router]);

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
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
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
      setAvatarPreviewUrl(profile?.avatarUrl || null);
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
      console.info('Avatar uploaded successfully!', { context: 'Avatar Upload', profileEmail: profile.email, imageUrl: result.avatarUrl });
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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-white">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600"></div>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-white">
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
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-md"
            >
              Create Profile
            </motion.button>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white py-12">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto px-4"
        >
          {/* Header Section */}
          <motion.div 
            variants={itemVariants}
            className="bg-white rounded-xl shadow-lg border border-purple-100 p-8 mb-8 flex items-center space-x-6"
          >
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-purple-200 group">
              <Image
                src={avatarPreviewUrl || "/user-placeholder.png"}
                alt="User Avatar"
                layout="fill"
                objectFit="cover"
              />
              <label htmlFor="avatar-upload" className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <span className="text-white text-sm">Change Photo</span>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{profile.firstName} {profile.lastName}</h1>
              <p className="text-gray-600 text-lg flex items-center"><Mail className="w-5 h-5 mr-2 text-purple-500" />{profile.email}</p>
              {selectedAvatarFile && (
                <button
                  onClick={handleAvatarUpload}
                  disabled={loading}
                  className={`mt-4 px-4 py-2 text-sm font-medium text-white rounded-md ${loading ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'}`}
                >
                  {loading ? 'Uploading...' : 'Save Photo'}
                </button>
              )}
            </div>
          </motion.div>

          {/* Skills Section */}
          <motion.div 
            variants={itemVariants}
            className="bg-white rounded-xl shadow-lg border border-purple-100 p-8 mb-8"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center"><Award className="w-7 h-7 mr-3 text-purple-600" />Skills</h2>
            <div className="flex flex-wrap gap-3">
              {profile.skills.map((skill) => (
                <motion.span
                  key={skill.id}
                  whileHover={{ scale: 1.05 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-medium shadow-sm"
                >
                  {skill.name} ({(() => {
                    switch (skill.level) {
                      case 1:
                        return 'Beginner';
                      case 2:
                        return 'Novice';
                      case 3:
                        return 'Intermediate';
                      case 4:
                        return 'Advanced';
                      case 5:
                        return 'Expert';
                      default:
                        return `Level ${skill.level}`;
                    }
                  })()})
                </motion.span>
              ))}
            </div>
          </motion.div>

          {/* Career Preferences */}
          {profile.preferences && (
            <motion.div 
              variants={itemVariants}
              className="bg-white rounded-xl shadow-lg border border-purple-100 p-8 mb-8"
            >
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center"><TrendingUp className="w-7 h-7 mr-3 text-purple-600" />Career Preferences</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div variants={itemVariants} className="bg-purple-50 p-4 rounded-lg flex items-center space-x-3">
                  <Building2 className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-purple-600 font-medium">Industry</p>
                    <p className="text-lg text-gray-900 mt-1">{profile.preferences.industry}</p>
                  </div>
                </motion.div>
                <motion.div variants={itemVariants} className="bg-purple-50 p-4 rounded-lg flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-purple-600 font-medium">Location</p>
                    <p className="text-lg text-gray-900 mt-1">{profile.preferences.location}</p>
                  </div>
                </motion.div>
                <motion.div variants={itemVariants} className="bg-purple-50 p-4 rounded-lg flex items-center space-x-3">
                  <Handshake className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-purple-600 font-medium">Work Type</p>
                    <p className="text-lg text-gray-900 mt-1 capitalize">{profile.preferences.workType}</p>
                  </div>
                </motion.div>
                <motion.div variants={itemVariants} className="bg-purple-50 p-4 rounded-lg flex items-center space-x-3">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-purple-600 font-medium">Preferred Salary</p>
                    <p className="text-lg text-gray-900 mt-1">EGP {profile.preferences.preferredSalary.toLocaleString()}</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Education */}
          <motion.div 
            variants={itemVariants}
            className="bg-white rounded-xl shadow-lg border border-purple-100 p-8 mb-8"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center"><GraduationCap className="w-7 h-7 mr-3 text-purple-600" />Education</h2>
            <div className="space-y-6">
              {profile.education.map((edu) => (
                <motion.div 
                  key={edu.id} 
                  whileHover={{ scale: 1.02 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-purple-50 p-6 rounded-lg border border-purple-100"
                >
                  <h3 className="text-xl font-medium text-gray-900">{edu.degree} in {edu.fieldOfStudy}</h3>
                  <p className="text-gray-700 mt-2">{edu.institution}</p>
                  <p className="text-gray-600 mt-1">Graduated: {edu.graduationYear}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Experience */}
          <motion.div 
            variants={itemVariants}
            className="bg-white rounded-xl shadow-lg border border-purple-100 p-8"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center"><Briefcase className="w-7 h-7 mr-3 text-purple-600" />Work Experience</h2>
            <div className="space-y-6">
              {profile.experience.map((exp) => (
                <motion.div 
                  key={exp.id} 
                  whileHover={{ scale: 1.02 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-purple-50 p-6 rounded-lg border border-purple-100"
                >
                  <h3 className="text-xl font-medium text-gray-900">{exp.title}</h3>
                  <p className="text-gray-700 mt-2">{exp.company}</p>
                  <p className="text-gray-600 mt-1">
                    {new Date(exp.startDate).toLocaleDateString()} - {exp.endDate ? new Date(exp.endDate).toLocaleDateString() : 'Present'}
                  </p>
                  {exp.description && (
                    <p className="mt-3 text-gray-700 bg-white p-3 rounded-md">{exp.description}</p>
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