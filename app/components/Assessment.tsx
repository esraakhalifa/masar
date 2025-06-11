import React, { useState, useEffect } from "react";
import { MCQQuestion } from "../services/gemini";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

interface AssessmentProps {
  role: string;
}

interface AnswerState {
  selectedOption: number;
  isAnswered: boolean;
}

export default function Assessment({ role }: AssessmentProps) {
  const [skills, setSkills] = useState<string[]>([]);
  const [currentSkillIndex, setCurrentSkillIndex] = useState(0);
  const [questions, setQuestions] = useState<MCQQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<{
    [key: string]: AnswerState[];
  }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [completedSkills, setCompletedSkills] = useState<Set<number>>(
    new Set()
  );

  // Fetch skills first
  useEffect(() => {
    const fetchSkills = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/skill-assessment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role, action: "getSkills" }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch skills");
        }

        const data = await response.json();
        setSkills(data.skills);

        // Initialize userAnswers with empty arrays
        const initialAnswers: { [key: string]: AnswerState[] } = {};
        data.skills.forEach((skill: string) => {
          initialAnswers[skill] = [];
        });
        setUserAnswers(initialAnswers);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (role) {
      fetchSkills();
    }
  }, [role]);

  // Fetch questions when skill changes
  useEffect(() => {
    const fetchQuestions = async () => {
      if (!skills.length) return;

      setLoading(true);
      setError(null);
      try {
        const currentSkill = skills[currentSkillIndex];
        const response = await fetch("/api/skill-assessment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            role,
            action: "getQuestions",
            skill: currentSkill,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch questions");
        }

        const data = await response.json();
        setQuestions(data.questions);

        // Initialize answers for this skill if not already done
        setUserAnswers((prev) => {
          if (!prev[currentSkill] || prev[currentSkill].length === 0) {
            return {
              ...prev,
              [currentSkill]: Array(data.questions.length).fill({
                selectedOption: -1,
                isAnswered: false,
              }),
            };
          }
          return prev;
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [currentSkillIndex, skills, role]);

  const handleAnswerSelect = (
    questionIndex: number,
    selectedOption: number
  ) => {
    const currentSkill = skills[currentSkillIndex];
    if (!currentSkill || !userAnswers[currentSkill]) return;

    // Only allow selection if not already answered
    if (userAnswers[currentSkill][questionIndex]?.isAnswered) return;

    setUserAnswers((prev) => {
      const currentAnswers = prev[currentSkill] || [];
      const updatedAnswers = [...currentAnswers];
      updatedAnswers[questionIndex] = { selectedOption, isAnswered: true };

      const newState = {
        ...prev,
        [currentSkill]: updatedAnswers,
      };

      // Check if this was the last question in the skill
      const allAnswered = updatedAnswers.every((ans) => ans?.isAnswered);
      if (allAnswered) {
        // Add this skill to completed skills
        setCompletedSkills((prev) => new Set([...prev, currentSkillIndex]));

        // Show results for all skills, including the last one
        setTimeout(() => setShowResults(true), 0);
      }

      return newState;
    });
  };

  const moveToSkill = (skillIndex: number) => {
    // Only allow moving to completed skills or the next uncompleted skill
    if (
      skillIndex < currentSkillIndex ||
      (skillIndex === currentSkillIndex + 1 &&
        isSkillComplete(skills[currentSkillIndex]))
    ) {
      setCurrentSkillIndex(skillIndex);
      setShowResults(false);
    }
  };

  const isSkillComplete = (skill: string) => {
    const skillAnswers = userAnswers[skill];
    if (!skillAnswers || skillAnswers.length === 0) return false;
    return skillAnswers.every((ans) => ans?.isAnswered);
  };

  const calculateScore = () => {
    const skillQuestions = questions;
    const skillAnswers = userAnswers[skills[currentSkillIndex]];

    if (!skillQuestions || !skillAnswers || skillAnswers.length === 0) return 0;

    const correctAnswers = skillAnswers.reduce((count, answer, index) => {
      if (
        answer?.isAnswered &&
        answer.selectedOption === skillQuestions[index].correctAnswer
      ) {
        return count + 1;
      }
      return count;
    }, 0);

    return Math.round((correctAnswers / skillQuestions.length) * 100);
  };

  if (loading && !skills.length) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-md">
        Error: {error}
      </div>
    );
  }

  if (!skills.length) {
    return null;
  }

  const currentSkill = skills[currentSkillIndex];

  return (
    <div className="min-h-screen p-6">
      <div className="w-full max-w-4xl mx-auto bg-black/30 rounded-xl shadow-lg p-8 text-white border border-white/10">
        <div className="mb-8">
          <div className="relative flex items-center mb-8">
            <div className="flex-1">
              <div className="text-white/70 text-sm font-medium mb-1">
                Skills Assessment
              </div>
              <h2 className="text-3xl font-bold">{role}</h2>
            </div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-3">
              <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/25">
                <span className="text-2xl font-bold">
                  {currentSkillIndex + 1}
                </span>
                <span className="text-2xl font-bold">/</span>
                <span className="text-2xl font-bold">{skills.length}</span>
              </div>
            </div>
          </div>

          {/* Progress Bar Container */}
          <div className="relative mb-6">
            <div className="w-full bg-white/10 rounded-full h-3">
              <div
                className="h-full rounded-full transition-all duration-500 bg-white"
                style={{
                  width: `${
                    ((currentSkillIndex +
                      (isSkillComplete(skills[currentSkillIndex]) ? 1 : 0)) /
                      skills.length) *
                    100
                  }%`,
                }}
              />
            </div>
          </div>

          {/* Current Skill */}
          <div className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/25">
            <div className="flex items-center gap-3">
              <div className="text-lg font-medium">
                {skills[currentSkillIndex]}
              </div>
              {isSkillComplete(skills[currentSkillIndex]) && (
                <div className="bg-white/20 px-2.5 py-0.5 rounded text-sm">
                  Completed
                </div>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {questions.map((question, qIndex) => {
              const answer = userAnswers[skills[currentSkillIndex]]?.[qIndex];

              return (
                <div
                  key={qIndex}
                  className="bg-gradient-to-br from-white to-[#F8F9FF] rounded-lg p-6 text-[#1A1A3D] shadow-md"
                >
                  <p className="text-lg font-medium mb-4">
                    {qIndex + 1}. {question.question}
                  </p>
                  <div className="space-y-3">
                    {question.options.map((option, oIndex) => {
                      const isCorrect =
                        answer?.isAnswered && oIndex === question.correctAnswer;
                      const isSelected = answer?.selectedOption === oIndex;
                      const isAnswered = answer?.isAnswered;

                      return (
                        <label
                          key={oIndex}
                          className={`flex items-center p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                            !isAnswered
                              ? "bg-white border-2 border-[#2434B3] text-[#1A1A3D] hover:border-[#2434B3] hover:bg-[#2434B3]/5 hover:shadow-md"
                              : isCorrect
                              ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-md"
                              : isSelected
                              ? "bg-gradient-to-r from-red-500 to-[#FF4A3D] text-white shadow-md"
                              : "bg-white border-2 border-[#2434B3] text-[#1A1A3D] opacity-50"
                          }`}
                          onClick={() => handleAnswerSelect(qIndex, oIndex)}
                        >
                          <input
                            type="radio"
                            name={`question-${qIndex}`}
                            value={oIndex}
                            checked={answer?.selectedOption === oIndex}
                            onChange={() => {}}
                            className="hidden"
                          />
                          <span className="text-base">{option}</span>
                          {isCorrect && <span className="ml-2">✓</span>}
                        </label>
                      );
                    })}
                  </div>
                  {answer?.isAnswered &&
                    answer.selectedOption === question.correctAnswer && (
                      <div className="mt-4 text-sm">
                        <p className="text-emerald-600 font-medium">
                          Correct! Well done!
                        </p>
                      </div>
                    )}
                </div>
              );
            })}
          </div>
        )}

        <div className="flex justify-between mt-8">
          <button
            onClick={() => moveToSkill(currentSkillIndex - 1)}
            disabled={currentSkillIndex === 0}
            className="px-6 py-3 rounded-lg disabled:bg-white/20 disabled:text-white/40 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-200
                     enabled:bg-[#FF4B36] enabled:text-white enabled:hover:translate-x-[-4px] enabled:shadow-md"
          >
            <FaArrowLeft /> Previous Skill
          </button>
          <button
            onClick={() => moveToSkill(currentSkillIndex + 1)}
            disabled={
              currentSkillIndex === skills.length - 1 ||
              !isSkillComplete(skills[currentSkillIndex])
            }
            className="px-6 py-3 rounded-lg disabled:bg-white/20 disabled:text-white/40 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-200
                     enabled:bg-[#FF4B36] enabled:text-white enabled:hover:translate-x-[4px] enabled:shadow-md"
          >
            Next Skill <FaArrowRight />
          </button>
        </div>

        {/* Results Modal */}
        {showResults && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gradient-to-br from-white to-[#F8F9FF] p-8 rounded-xl max-w-md w-full mx-4 shadow-2xl">
              <h3 className="text-2xl font-bold mb-6 text-center text-[#1A1A3D]">
                Skill Assessment Results
              </h3>
              <div className="mb-8">
                <div className="text-7xl font-bold text-center mb-3">
                  {calculateScore() >= 70 ? (
                    <span className="bg-gradient-to-r from-emerald-500 to-green-500 text-transparent bg-clip-text">
                      {calculateScore()}%
                    </span>
                  ) : (
                    <span className="bg-gradient-to-r from-red-500 to-[#FF4A3D] text-transparent bg-clip-text">
                      {calculateScore()}%
                    </span>
                  )}
                </div>
                <p className="text-center text-[#1A1A3D]/70 text-lg">
                  Score for {skills[currentSkillIndex]}
                </p>
              </div>
              <div className="flex justify-center">
                <button
                  onClick={() => {
                    setShowResults(false);
                    if (currentSkillIndex < skills.length - 1) {
                      moveToSkill(currentSkillIndex + 1);
                    }
                  }}
                  className={`px-8 py-4 rounded-lg hover:translate-y-[-2px] transition-all duration-200 flex items-center gap-2 font-medium text-white shadow-lg
                    ${
                      calculateScore() >= 70 ? "bg-emerald-500" : "bg-[#FF4B36]"
                    }`}
                >
                  {currentSkillIndex < skills.length - 1 ? (
                    <>
                      Next Skill <FaArrowRight />
                    </>
                  ) : (
                    "Finish Assessment"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
