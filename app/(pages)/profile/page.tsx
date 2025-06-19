'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Layout from '../../../components/Layout';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Mail, Award, Briefcase, GraduationCap, DollarSign, MapPin, Building2, TrendingUp, Handshake, Calendar, Pen, Plus, Save, X, Edit3, Edit } from 'lucide-react';
import { useSession } from 'next-auth/react';

const SKILL_LEVELS = [
  { value: 1, label: 'Beginner' },
  { value: 2, label: 'Intermediate' },
  { value: 3, label: 'Advanced' },
  { value: 4, label: 'Expert' }
];

const SKILL_CATEGORIES = [
  { value: 'Technical', label: 'Technical' },
  { value: 'Interpersonal', label: 'Interpersonal' }
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
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  
  // Edit mode states
  const [editingSkills, setEditingSkills] = useState(false);
  const [editingEducation, setEditingEducation] = useState(false);
  const [editingExperience, setEditingExperience] = useState(false);
  
  // Form states
  const [newSkill, setNewSkill] = useState({ name: '', category: 'Technical', level: 1 });
  const [newEducation, setNewEducation] = useState({ degree: '', fieldOfStudy: '', institution: '', graduationYear: new Date().getFullYear() });
  const [newExperience, setNewExperience] = useState({ title: '', company: '', startDate: '', endDate: '', description: '' });
  
  // Editing states for existing items
  const [editingSkillIndex, setEditingSkillIndex] = useState<number | null>(null);
  const [editingEducationIndex, setEditingEducationIndex] = useState<number | null>(null);
  const [editingExperienceIndex, setEditingExperienceIndex] = useState<number | null>(null);
  
  // Temporary edit states for skills
  const [tempSkillEdit, setTempSkillEdit] = useState<{name: string, category: string, level: number} | null>(null);
  
  // Temporary edit states for education and experience
  const [tempEducationEdit, setTempEducationEdit] = useState<{degree: string, fieldOfStudy: string, institution: string, graduationYear: number} | null>(null);
  const [tempExperienceEdit, setTempExperienceEdit] = useState<{title: string, company: string, startDate: string, endDate: string, description: string} | null>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      if (!session?.user?.email) {
        console.warn('User email not found in session. Waiting for session to load.', { context: 'Profile Fetch' });
        setLoading(false);
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
  }, [session]);

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

  if (loading || status === 'loading') {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#2434B3]/5 to-white">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#2434B3]"></div>
        </div>
      </Layout>
    );
  }

  if (!profile && status === 'authenticated') {
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

  // If we reach here and profile is null, just show loading
  if (!profile) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#2434B3]/5 to-white">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#2434B3]"></div>
        </div>
      </Layout>
    );
  }

  // TypeScript: profile is guaranteed to be non-null from this point
  const userProfile = profile as Profile;

  // Incomplete profile logic
  const isIncompleteProfile =
    userProfile &&
    (!userProfile.skills || userProfile.skills.length === 0) &&
    (!userProfile.education || userProfile.education.length === 0) &&
    (!userProfile.experience || userProfile.experience.length === 0);

  if (userProfile && isIncompleteProfile) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#2434B3]/5 to-white">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl shadow-lg border border-[#2434B3]/10 p-10 max-w-md w-full text-center"
          >
            <div className="mb-6">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="w-20 h-20 rounded-full bg-gradient-to-r from-[#2434B3] to-[#FF4B36] flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4"
              >
                {userProfile.firstName?.charAt(0).toUpperCase()}{userProfile.lastName?.charAt(0).toUpperCase()}
              </motion.div>
              <h1 className="text-3xl font-bold text-[#2434B3] mb-2">Welcome, {userProfile.firstName} {userProfile.lastName}!</h1>
              <p className="text-lg text-gray-600 flex items-center justify-center">
                <Mail className="w-5 h-5 mr-2 text-[#2434B3]" />
                {userProfile.email}
              </p>
            </div>
            <p className="text-gray-600 mb-8">Your profile is almost ready. Complete your information by uploading your CV to unlock all features!</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/upload')}
              className="px-8 py-3 bg-[#FF4B36] text-white rounded-lg font-semibold shadow-md hover:bg-[#FF4B36]/90 transition-colors text-lg w-full"
            >
              Upload Your CV
            </motion.button>
          </motion.div>
        </div>
      </Layout>
    );
  }

  // Handler functions for updating profile data
  const updateProfileData = async (updateData: any) => {
    if (!csrfToken) {
      toast.error('Security token not available. Please refresh the page.');
      return false;
    }

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({
          email: userProfile.email,
          ...updateData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      await fetchProfile();
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
      return false;
    }
  };

  const handleAddSkill = async () => {
    if (!newSkill.name.trim() || !newSkill.category.trim()) {
      toast.error('Please fill in all skill fields');
      return;
    }

    const success = await updateProfileData({
      skills: [...userProfile.skills, { ...newSkill, id: Date.now().toString() }]
    });

    if (success) {
      setNewSkill({ name: '', category: 'Technical', level: 1 });
      setEditingSkills(false);
      toast.success('Skill added successfully');
    }
  };

  const handleUpdateSkill = async (index: number, updatedSkill: any) => {
    const updatedSkills = [...userProfile.skills];
    updatedSkills[index] = { ...updatedSkills[index], ...updatedSkill };

    const success = await updateProfileData({ skills: updatedSkills });
    if (success) {
      setEditingSkillIndex(null);
      toast.success('Skill updated successfully');
    }
  };

  const handleDeleteSkill = async (index: number) => {
    const updatedSkills = userProfile.skills.filter((_, i) => i !== index);
    const success = await updateProfileData({ skills: updatedSkills });
    if (success) {
      toast.success('Skill deleted successfully');
    }
  };

  const handleAddEducation = async () => {
    if (!newEducation.degree.trim() || !newEducation.institution.trim()) {
      toast.error('Please fill in all required education fields');
      return;
    }

    const success = await updateProfileData({
      education: [...userProfile.education, { ...newEducation, id: Date.now().toString() }]
    });

    if (success) {
      setNewEducation({ degree: '', fieldOfStudy: '', institution: '', graduationYear: new Date().getFullYear() });
      setEditingEducation(false);
      toast.success('Education added successfully');
    }
  };

  const handleUpdateEducation = async (index: number, updatedEducation: any) => {
    const updatedEducations = [...userProfile.education];
    updatedEducations[index] = { ...updatedEducations[index], ...updatedEducation };

    const success = await updateProfileData({ education: updatedEducations });
    if (success) {
      setEditingEducationIndex(null);
      toast.success('Education updated successfully');
    }
  };

  const handleDeleteEducation = async (index: number) => {
    const updatedEducations = userProfile.education.filter((_, i) => i !== index);
    const success = await updateProfileData({ education: updatedEducations });
    if (success) {
      toast.success('Education deleted successfully');
    }
  };

  const handleAddExperience = async () => {
    if (!newExperience.title.trim() || !newExperience.company.trim() || !newExperience.startDate) {
      toast.error('Please fill in all required experience fields');
      return;
    }

    const success = await updateProfileData({
      experience: [...userProfile.experience, { ...newExperience, id: Date.now().toString() }]
    });

    if (success) {
      setNewExperience({ title: '', company: '', startDate: '', endDate: '', description: '' });
      setEditingExperience(false);
      toast.success('Experience added successfully');
    }
  };

  const handleUpdateExperience = async (index: number, updatedExperience: any) => {
    const updatedExperiences = [...userProfile.experience];
    updatedExperiences[index] = { ...updatedExperiences[index], ...updatedExperience };

    const success = await updateProfileData({ experience: updatedExperiences });
    if (success) {
      setEditingExperienceIndex(null);
      toast.success('Experience updated successfully');
    }
  };

  const handleDeleteExperience = async (index: number) => {
    const updatedExperiences = userProfile.experience.filter((_, i) => i !== index);
    const success = await updateProfileData({ experience: updatedExperiences });
    if (success) {
      toast.success('Experience deleted successfully');
    }
  };

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
              <h1 className="text-4xl font-bold text-[#2434B3] mb-2">{userProfile.firstName} {userProfile.lastName}</h1>
              <p className="text-gray-600 text-lg flex items-center">
                <Mail className="w-5 h-5 mr-2 text-[#2434B3]" />
                {userProfile.email}
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
              className="text-2xl font-semibold text-[#2434B3] mb-6 flex items-center justify-between"
            >
              <div className="flex items-center">
                <Award className="w-7 h-7 mr-3 text-[#2434B3]" />
                Skills
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setEditingSkills(!editingSkills);
                  if (editingSkills) {
                    setEditingSkillIndex(null);
                    setTempSkillEdit(null);
                  }
                }}
                className="px-4 py-2 bg-[#2434B3] text-white rounded-lg text-sm font-medium hover:bg-[#2434B3]/90 transition-colors flex items-center"
              >
                {editingSkills ? <X className="w-4 h-4 mr-2" /> : <Edit3 className="w-4 h-4 mr-2" />}
                {editingSkills ? 'Cancel' : 'Edit Skills'}
              </motion.button>
            </motion.h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userProfile.skills.map((skill, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  className="bg-[#2434B3]/5 p-4 rounded-lg flex items-center justify-between relative group"
                >
                  {editingSkillIndex === index ? (
                    <div className="w-full space-y-2">
                      <input
                        type="text"
                        defaultValue={skill.name}
                        value={tempSkillEdit?.name ?? skill.name}
                        onChange={(e) => setTempSkillEdit(prev => ({
                          name: e.target.value,
                          category: prev?.category ?? skill.category,
                          level: prev?.level ?? skill.level
                        }))}
                        className="w-full px-3 py-1 border border-gray-300 rounded text-black"
                      />
                      <select
                        defaultValue={skill.category}
                        value={tempSkillEdit?.category ?? skill.category}
                        onChange={(e) => setTempSkillEdit(prev => ({
                          name: prev?.name ?? skill.name,
                          category: e.target.value,
                          level: prev?.level ?? skill.level
                        }))}
                        className="w-full px-3 py-1 border border-gray-300 rounded text-black"
                      >
                        {SKILL_CATEGORIES.map(category => (
                          <option key={category.value} value={category.value}>{category.label}</option>
                        ))}
                      </select>
                      <select
                        defaultValue={skill.level}
                        value={tempSkillEdit?.level ?? skill.level}
                        onChange={(e) => setTempSkillEdit(prev => ({
                          name: prev?.name ?? skill.name,
                          category: prev?.category ?? skill.category,
                          level: parseInt(e.target.value)
                        }))}
                        className="w-full px-3 py-1 border border-gray-300 rounded text-black"
                      >
                        {SKILL_LEVELS.map(level => (
                          <option key={level.value} value={level.value}>{level.label}</option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          onClick={() => {
                            if (tempSkillEdit) {
                              handleUpdateSkill(index, tempSkillEdit);
                              setTempSkillEdit(null);
                            }
                            setEditingSkillIndex(null);
                          }}
                          className="px-3 py-2 bg-green-500 text-white rounded text-sm flex items-center"
                        >
                          <Save className="w-4 h-4 mr-1" />
                          Save
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          onClick={() => {
                            setEditingSkillIndex(null);
                            setTempSkillEdit(null);
                          }}
                          className="px-3 py-2 bg-gray-500 text-white rounded text-sm flex items-center"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Cancel
                        </motion.button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1">
                        <p className="font-medium text-[#2434B3]">{skill.name}</p>
                        <p className="text-sm text-gray-600">{skill.category}</p>
                        <span className="text-sm font-medium text-[#FF4B36]">
                          {SKILL_LEVELS.find(lvl => lvl.value === skill.level)?.label || skill.level}
                        </span>
                      </div>
                      {editingSkills && (
                        <div className="flex flex-col gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            onClick={() => {
                              setEditingSkillIndex(index);
                              setTempSkillEdit({
                                name: skill.name,
                                category: skill.category,
                                level: skill.level
                              });
                            }}
                            className="p-2 text-gray-400 hover:text-[#2434B3] transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            onClick={() => handleDeleteSkill(index)}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </motion.button>
                        </div>
                      )}
                    </>
                  )}
                </motion.div>
              ))}
              
              {editingSkills && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-300"
                >
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Skill name"
                      value={newSkill.name}
                      onChange={(e) => setNewSkill(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-black"
                    />
                    <select
                      value={newSkill.category}
                      onChange={(e) => setNewSkill(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-black"
                    >
                      <option value="">Select Category</option>
                      {SKILL_CATEGORIES.map(category => (
                        <option key={category.value} value={category.value}>{category.label}</option>
                      ))}
                    </select>
                    <select
                      value={newSkill.level}
                      onChange={(e) => setNewSkill(prev => ({ ...prev, level: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-black"
                    >
                      {SKILL_LEVELS.map(level => (
                        <option key={level.value} value={level.value}>{level.label}</option>
                      ))}
                    </select>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleAddSkill}
                      className="w-full px-4 py-2 bg-[#FF4B36] text-white rounded font-medium hover:bg-[#FF4B36]/90 transition-colors flex items-center justify-center"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Skill
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Education */}
          <motion.div 
            variants={itemVariants}
            className="bg-white rounded-xl shadow-lg border border-[#2434B3]/10 p-8 mb-8"
          >
            <motion.h2 
              variants={itemVariants}
              className="text-2xl font-semibold text-[#2434B3] mb-6 flex items-center justify-between"
            >
              <div className="flex items-center">
                <GraduationCap className="w-7 h-7 mr-3 text-[#2434B3]" />
                Education
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setEditingEducation(!editingEducation);
                  if (editingEducation) {
                    setEditingEducationIndex(null);
                    setTempEducationEdit(null);
                  }
                }}
                className="px-4 py-2 bg-[#2434B3] text-white rounded-lg text-sm font-medium hover:bg-[#2434B3]/90 transition-colors flex items-center"
              >
                {editingEducation ? <X className="w-4 h-4 mr-2" /> : <Edit3 className="w-4 h-4 mr-2" />}
                {editingEducation ? 'Cancel' : 'Edit Education'}
              </motion.button>
            </motion.h2>
            
            <div className="space-y-6">
              {userProfile.education.map((edu, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  className="bg-[#2434B3]/5 p-6 rounded-lg relative"
                >
                  {editingEducationIndex === index ? (
                    <div className="space-y-4">
                      <input
                        type="text"
                        defaultValue={edu.degree}
                        value={tempEducationEdit?.degree ?? edu.degree}
                        onChange={(e) => setTempEducationEdit(prev => ({
                          degree: e.target.value,
                          fieldOfStudy: prev?.fieldOfStudy ?? edu.fieldOfStudy,
                          institution: prev?.institution ?? edu.institution,
                          graduationYear: prev?.graduationYear ?? edu.graduationYear
                        }))}
                        placeholder="Degree"
                        className="w-full px-3 py-2 border border-gray-300 rounded text-black"
                      />
                      <input
                        type="text"
                        defaultValue={edu.fieldOfStudy}
                        value={tempEducationEdit?.fieldOfStudy ?? edu.fieldOfStudy}
                        onChange={(e) => setTempEducationEdit(prev => ({
                          degree: prev?.degree ?? edu.degree,
                          fieldOfStudy: e.target.value,
                          institution: prev?.institution ?? edu.institution,
                          graduationYear: prev?.graduationYear ?? edu.graduationYear
                        }))}
                        placeholder="Field of Study"
                        className="w-full px-3 py-2 border border-gray-300 rounded text-black"
                      />
                      <input
                        type="text"
                        defaultValue={edu.institution}
                        value={tempEducationEdit?.institution ?? edu.institution}
                        onChange={(e) => setTempEducationEdit(prev => ({
                          degree: prev?.degree ?? edu.degree,
                          fieldOfStudy: prev?.fieldOfStudy ?? edu.fieldOfStudy,
                          institution: e.target.value,
                          graduationYear: prev?.graduationYear ?? edu.graduationYear
                        }))}
                        placeholder="Institution"
                        className="w-full px-3 py-2 border border-gray-300 rounded text-black"
                      />
                      <input
                        type="number"
                        defaultValue={edu.graduationYear}
                        value={tempEducationEdit?.graduationYear ?? edu.graduationYear}
                        onChange={(e) => setTempEducationEdit(prev => ({
                          degree: prev?.degree ?? edu.degree,
                          fieldOfStudy: prev?.fieldOfStudy ?? edu.fieldOfStudy,
                          institution: prev?.institution ?? edu.institution,
                          graduationYear: parseInt(e.target.value) || edu.graduationYear
                        }))}
                        placeholder="Graduation Year"
                        className="w-full px-3 py-2 border border-gray-300 rounded text-black"
                      />
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          onClick={() => {
                            if (tempEducationEdit) {
                              handleUpdateEducation(index, tempEducationEdit);
                              setTempEducationEdit(null);
                            }
                            setEditingEducationIndex(null);
                          }}
                          className="px-3 py-2 bg-green-500 text-white rounded text-sm flex items-center"
                        >
                          <Save className="w-4 h-4 mr-1" />
                          Save
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          onClick={() => {
                            setEditingEducationIndex(null);
                            setTempEducationEdit(null);
                          }}
                          className="px-3 py-2 bg-gray-500 text-white rounded text-sm flex items-center"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Cancel
                        </motion.button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
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
                        </div>
                        {editingEducation && (
                          <div className="flex flex-col gap-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              onClick={() => {
                                setEditingEducationIndex(index);
                                setTempEducationEdit({
                                  degree: edu.degree,
                                  fieldOfStudy: edu.fieldOfStudy,
                                  institution: edu.institution,
                                  graduationYear: edu.graduationYear
                                });
                              }}
                              className="p-2 text-gray-400 hover:text-[#2434B3] transition-colors"
                            >
                              <Edit3 className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              onClick={() => handleDeleteEducation(index)}
                              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </motion.button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </motion.div>
              ))}
              
              {editingEducation && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gray-50 p-6 rounded-lg border-2 border-dashed border-gray-300"
                >
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Degree"
                      value={newEducation.degree}
                      onChange={(e) => setNewEducation(prev => ({ ...prev, degree: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-black"
                    />
                    <input
                      type="text"
                      placeholder="Field of Study"
                      value={newEducation.fieldOfStudy}
                      onChange={(e) => setNewEducation(prev => ({ ...prev, fieldOfStudy: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-black"
                    />
                    <input
                      type="text"
                      placeholder="Institution"
                      value={newEducation.institution}
                      onChange={(e) => setNewEducation(prev => ({ ...prev, institution: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-black"
                    />
                    <input
                      type="number"
                      placeholder="Graduation Year"
                      value={newEducation.graduationYear}
                      onChange={(e) => setNewEducation(prev => ({ ...prev, graduationYear: parseInt(e.target.value) || new Date().getFullYear() }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-black"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleAddEducation}
                      className="w-full px-4 py-2 bg-[#FF4B36] text-white rounded font-medium hover:bg-[#FF4B36]/90 transition-colors flex items-center justify-center"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Education
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Experience */}
          <motion.div 
            variants={itemVariants}
            className="bg-white rounded-xl shadow-lg border border-[#2434B3]/10 p-8 mb-8"
          >
            <motion.h2 
              variants={itemVariants}
              className="text-2xl font-semibold text-[#2434B3] mb-6 flex items-center justify-between"
            >
              <div className="flex items-center">
                <Briefcase className="w-7 h-7 mr-3 text-[#2434B3]" />
                Experience
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setEditingExperience(!editingExperience);
                  if (editingExperience) {
                    setEditingExperienceIndex(null);
                    setTempExperienceEdit(null);
                  }
                }}
                className="px-4 py-2 bg-[#2434B3] text-white rounded-lg text-sm font-medium hover:bg-[#2434B3]/90 transition-colors flex items-center"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                {editingExperience ? 'Cancel' : 'Edit Experience'}
              </motion.button>
            </motion.h2>
            
            <div className="space-y-6">
              {userProfile.experience.map((exp, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  className="bg-[#2434B3]/5 p-6 rounded-lg relative"
                >
                  {editingExperienceIndex === index ? (
                    <div className="space-y-4">
                      <input
                        type="text"
                        defaultValue={exp.title}
                        value={tempExperienceEdit?.title ?? exp.title}
                        onChange={(e) => setTempExperienceEdit(prev => ({
                          title: e.target.value,
                          company: prev?.company ?? exp.company,
                          startDate: prev?.startDate ?? exp.startDate,
                          endDate: prev?.endDate ?? (exp.endDate || ''),
                          description: prev?.description ?? (exp.description || '')
                        }))}
                        placeholder="Job Title"
                        className="w-full px-3 py-2 border border-gray-300 rounded text-black"
                      />
                      <input
                        type="text"
                        defaultValue={exp.company}
                        value={tempExperienceEdit?.company ?? exp.company}
                        onChange={(e) => setTempExperienceEdit(prev => ({
                          title: prev?.title ?? exp.title,
                          company: e.target.value,
                          startDate: prev?.startDate ?? exp.startDate,
                          endDate: prev?.endDate ?? (exp.endDate || ''),
                          description: prev?.description ?? (exp.description || '')
                        }))}
                        placeholder="Company"
                        className="w-full px-3 py-2 border border-gray-300 rounded text-black"
                      />
                      <input
                        type="text"
                        defaultValue={exp.startDate}
                        value={tempExperienceEdit?.startDate ?? exp.startDate}
                        onChange={(e) => setTempExperienceEdit(prev => ({
                          title: prev?.title ?? exp.title,
                          company: prev?.company ?? exp.company,
                          startDate: e.target.value,
                          endDate: prev?.endDate ?? (exp.endDate || ''),
                          description: prev?.description ?? (exp.description || '')
                        }))}
                        placeholder="Start Date"
                        className="w-full px-3 py-2 border border-gray-300 rounded text-black"
                      />
                      <input
                        type="text"
                        defaultValue={exp.endDate}
                        value={tempExperienceEdit?.endDate ?? (exp.endDate || '')}
                        onChange={(e) => setTempExperienceEdit(prev => ({
                          title: prev?.title ?? exp.title,
                          company: prev?.company ?? exp.company,
                          startDate: prev?.startDate ?? exp.startDate,
                          endDate: e.target.value,
                          description: prev?.description ?? (exp.description || '')
                        }))}
                        placeholder="End Date (Leave empty if current)"
                        className="w-full px-3 py-2 border border-gray-300 rounded text-black"
                      />
                      <textarea
                        defaultValue={exp.description}
                        value={tempExperienceEdit?.description ?? (exp.description || '')}
                        onChange={(e) => setTempExperienceEdit(prev => ({
                          title: prev?.title ?? exp.title,
                          company: prev?.company ?? exp.company,
                          startDate: prev?.startDate ?? exp.startDate,
                          endDate: prev?.endDate ?? (exp.endDate || ''),
                          description: e.target.value
                        }))}
                        placeholder="Job Description"
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded resize-none text-black"
                      />
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          onClick={() => {
                            if (tempExperienceEdit) {
                              handleUpdateExperience(index, tempExperienceEdit);
                              setTempExperienceEdit(null);
                            }
                            setEditingExperienceIndex(null);
                          }}
                          className="px-3 py-2 bg-green-500 text-white rounded text-sm flex items-center"
                        >
                          <Save className="w-4 h-4 mr-1" />
                          Save
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          onClick={() => {
                            setEditingExperienceIndex(null);
                            setTempExperienceEdit(null);
                          }}
                          className="px-3 py-2 bg-gray-500 text-white rounded text-sm flex items-center"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Cancel
                        </motion.button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-[#2434B3]">{exp.title}</h3>
                          <div className="mt-2 flex items-center text-gray-500">
                            <Building2 className="w-4 h-4 mr-2" />
                            <span>{exp.company}</span>
                          </div>
                          <div className="mt-1 flex items-center text-gray-500">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span>{exp.startDate} - {exp.endDate || 'Present'}</span>
                          </div>
                          {exp.description && (
                            <p className="text-gray-600 mt-3">{exp.description}</p>
                          )}
                        </div>
                        {editingExperience && (
                          <div className="flex flex-col gap-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              onClick={() => {
                                setEditingExperienceIndex(index);
                                setTempExperienceEdit({
                                  title: exp.title,
                                  company: exp.company,
                                  startDate: exp.startDate,
                                  endDate: exp.endDate || '',
                                  description: exp.description || ''
                                });
                              }}
                              className="p-2 text-gray-400 hover:text-[#2434B3] transition-colors"
                            >
                              <Edit3 className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              onClick={() => handleDeleteExperience(index)}
                              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </motion.button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </motion.div>
              ))}
              
              {editingExperience && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gray-50 p-6 rounded-lg border-2 border-dashed border-gray-300"
                >
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Job Title"
                      value={newExperience.title}
                      onChange={(e) => setNewExperience(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-black"
                    />
                    <input
                      type="text"
                      placeholder="Company"
                      value={newExperience.company}
                      onChange={(e) => setNewExperience(prev => ({ ...prev, company: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-black"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="date"
                        placeholder="Start Date"
                        value={newExperience.startDate}
                        onChange={(e) => setNewExperience(prev => ({ ...prev, startDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-black"
                      />
                      <input
                        type="date"
                        placeholder="End Date (Leave empty if current)"
                        value={newExperience.endDate}
                        onChange={(e) => setNewExperience(prev => ({ ...prev, endDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-black"
                      />
                    </div>
                    <textarea
                      placeholder="Job Description"
                      value={newExperience.description}
                      onChange={(e) => setNewExperience(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded resize-none text-black"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleAddExperience}
                      className="w-full px-4 py-2 bg-[#FF4B36] text-white rounded font-medium hover:bg-[#FF4B36]/90 transition-colors flex items-center justify-center"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Experience
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </Layout>
  );
}