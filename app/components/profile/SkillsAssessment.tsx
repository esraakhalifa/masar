'use client';

import { useState } from 'react';
import type { Skill } from '@/app/lib/types/profile';

interface SkillsAssessmentProps {
  skills: Skill[];
  onChange: (skills: Skill[]) => void;
}

const SKILL_CATEGORIES = ['technical', 'soft', 'language'] as const;
const SKILL_LEVELS = [1, 2, 3, 4, 5] as const;

export default function SkillsAssessment({ skills, onChange }: SkillsAssessmentProps) {
  const [newSkill, setNewSkill] = useState<Partial<Skill>>({
    name: '',
    level: 1,
    category: 'technical'
  });

  const addSkill = () => {
    if (newSkill.name && newSkill.level && newSkill.category) {
      onChange([...skills, newSkill as Skill]);
      setNewSkill({ name: '', level: 1, category: 'technical' });
    }
  };

  const removeSkill = (index: number) => {
    const updatedSkills = skills.filter((_, i) => i !== index);
    onChange(updatedSkills);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Skills Assessment</h2>
      
      {/* Add New Skill */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label htmlFor="skillName" className="block text-sm font-medium text-gray-700">
            Skill Name
          </label>
          <input
            type="text"
            id="skillName"
            value={newSkill.name}
            onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 bg-white text-gray-900 placeholder-gray-400"
            placeholder="Enter skill name"
          />
        </div>

        <div>
          <label htmlFor="skillCategory" className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <select
            id="skillCategory"
            value={newSkill.category}
            onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value as Skill['category'] })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 bg-white text-gray-900"
          >
            {SKILL_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
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
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 bg-white text-gray-900"
          >
            {SKILL_LEVELS.map((level) => (
              <option key={level} value={level}>
                {level} - {level === 1 ? 'Beginner' : level === 5 ? 'Expert' : `Level ${level}`}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={addSkill}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700"
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
                ({skill.category} - Level {skill.level})
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
