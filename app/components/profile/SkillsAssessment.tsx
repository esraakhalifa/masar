'use client';

import { useState } from 'react';
import type { Skill } from '@/app/lib/types/profile';

interface SkillsAssessmentProps {
  skills: Skill[];
  onChange: (skills: Skill[]) => void;
}

const SKILL_CATEGORIES = [
  'Technical',
  'Soft Skills',
  'Languages',
  'Tools',
  'Frameworks',
  'Databases',
  'Cloud',
  'DevOps',
  'Design',
  'Other'
] as const;

const SKILL_LEVELS = [
  { value: 1, label: 'Beginner' },
  { value: 2, label: 'Intermediate' },
  { value: 3, label: 'Advanced' },
  { value: 4, label: 'Expert' }
] as const;

export default function SkillsAssessment({ skills, onChange }: SkillsAssessmentProps) {
  const [newSkill, setNewSkill] = useState<Skill>({
    name: '',
    level: 1,
    category: 'Technical'
  });
  const [error, setError] = useState<string | null>(null);

  const addSkill = () => {
    if (!newSkill.name.trim()) {
      setError('Please enter a skill name');
      return;
    }
    setError(null);
    onChange([...skills, newSkill]);
    setNewSkill({
      name: '',
      level: 1,
      category: 'Technical'
    });
  };

  const removeSkill = (index: number) => {
    const updatedSkills = skills.filter((_, i) => i !== index);
    onChange(updatedSkills);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label htmlFor="skillName" className="block text-sm font-medium text-gray-700">
            Skill Name
          </label>
          <input
            type="text"
            id="skillName"
            value={newSkill.name}
            onChange={(e) => {
              setNewSkill({ ...newSkill, name: e.target.value });
              if (error) setError(null);
            }}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FF4B36] focus:ring-[#FF4B36] bg-white text-gray-900 placeholder-gray-400 ${
              error ? 'border-red-300' : ''
            }`}
            placeholder="Enter skill name"
          />
          {error && (
            <p className="mt-1 text-sm text-red-600">{error}</p>
          )}
        </div>

        <div>
          <label htmlFor="skillCategory" className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <select
            id="skillCategory"
            value={newSkill.category}
            onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value as Skill['category'] })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FF4B36] focus:ring-[#FF4B36] bg-white text-gray-900"
          >
            {SKILL_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="skillLevel" className="block text-sm font-medium text-gray-700">
            Level
          </label>
          <select
            id="skillLevel"
            value={newSkill.level}
            onChange={(e) => setNewSkill({ ...newSkill, level: Number(e.target.value) as Skill['level'] })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FF4B36] focus:ring-[#FF4B36] bg-white text-gray-900"
          >
            {SKILL_LEVELS.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <button
            type="button"
            onClick={addSkill}
            className="w-full h-[38px] px-4 text-sm font-medium text-white bg-[#FF4B36] rounded-md hover:bg-[#FF4B36]/90 transition-colors"
          >
            Add Skill
          </button>
        </div>
      </div>

      {/* Skills List */}
      <div className="space-y-4">
        {skills.map((skill, index) => (
          <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-md border border-gray-200">
            <div>
              <span className="font-medium text-gray-900">{skill.name}</span>
              <span className="ml-2 text-sm text-gray-600">
                ({skill.category} - {SKILL_LEVELS.find(lvl => lvl.value === skill.level)?.label || skill.level})
              </span>
            </div>
            <button
              type="button"
              onClick={() => removeSkill(index)}
              className="text-red-600 hover:text-red-700"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
