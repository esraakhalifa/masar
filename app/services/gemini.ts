const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export interface SkillsList {
  skills: string[];
}

export interface MCQQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface SkillQuestions {
  questions: MCQQuestion[];
}

export interface SkillAssessment {
  skills: string[];
  questions: {
    [skill: string]: Array<{
      question: string;
      options: string[];
      correctAnswer: number;
    }>;
  };
}

export interface GeminiResponse {
  recommendations: Array<{
    name: string;
    description: string;
    url: string;
  }>;
}

function extractJSONFromText(text: string): GeminiResponse | null {
  // Try to find JSON-like structure in the text
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed?.recommendations)) {
        return parsed as GeminiResponse;
      }
    } catch {
      return null;
    }
  }
  return null;
}

export async function getTestRecommendations(
  role: string
): Promise<GeminiResponse> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const prompt = `You are a helpful AI assistant. For someone pursuing a career as a ${role}, 
  provide 3-5 relevant online tests, assessments,
   or coding challenges from reputable platforms (e.g., HackerRank, LeetCode, Coursera). 
   Ensure each test is active, not expired, and accessible as of the current date(very important). 
   Verify that links are valid and functional. 
    and a direct URL. If fewer than 3 tests are available, 
    include as many as possible and note the limitation in the JSON. 
    Respond ONLY with a JSON object in this format, with no additional text:


  {
  "recommendations": [
    {
      "name": "Test Name",
      "description": "Brief description of the test",
      "url": "URL to take the test"
    }
  ]
}`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1, // Lower temperature for more structured output
          topP: 0.1,
          maxOutputTokens: 1000,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Gemini API error: ${errorData.error?.message || response.statusText}`
      );
    }

    const data = await response.json();
    

    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error("Unexpected response format from Gemini API");
    }

    const content = data.candidates[0].content.parts[0].text;

    // Try to parse the content directly first
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed?.recommendations)) {
        return parsed as GeminiResponse;
      }
    } catch {}

    // If direct parsing fails, try to extract JSON from the text
    const extracted = extractJSONFromText(content);
    if (extracted) {
      return extracted;
    }

    // If all parsing attempts fail, throw an error
    throw new Error("Could not extract valid JSON response from Gemini API");
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error;
  }
}

export async function getCoreSkills(role: string): Promise<SkillsList> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const prompt = `You are a technical interviewer. For someone pursuing a career as a ${role}, identify 4-5 most important core technical skills they need to master. Return ONLY a JSON object in this exact format (no additional text):
{"skills": ["skill1", "skill2", "skill3", "skill4"]}`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          topP: 0.1,
          maxOutputTokens: 200,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Gemini API error: ${errorData.error?.message || response.statusText}`
      );
    }

    const data = await response.json();

    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error("Unexpected response format from Gemini API");
    }

    const content = data.candidates[0].content.parts[0].text;
    

    try {
      // Clean the response by removing markdown formatting
      const cleanedContent = content
        .replace(/```json\n?/g, "") // Remove ```json
        .replace(/```\n?/g, "") // Remove closing ```
        .trim(); // Remove any extra whitespace

      

      const parsed = JSON.parse(cleanedContent);
      if (!Array.isArray(parsed.skills)) {
        throw new Error("Invalid skills array in response");
      }
      return parsed as SkillsList;
    } catch (error) {
      console.error("Error parsing skills response:", error);
      throw new Error("Failed to parse skills response");
    }
  } catch (error) {
    console.error("Error getting core skills:", error);
    throw error;
  }
}

export async function getSkillQuestions(
  role: string,
  skill: string
): Promise<SkillQuestions> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const prompt = `You are a technical interviewer creating an assessment for a ${role} position. Create 10 multiple choice questions specifically about ${skill}. The questions should:
1. Test practical knowledge and understanding
2. Range from basic to advanced concepts
3. Each have exactly 4 options with only one correct answer
4. Be clear and unambiguous

Return ONLY a JSON object in this exact format (no additional text):
{
  "questions": [
    {
      "question": "Question text?",
      "options": ["option1", "option2", "option3", "option4"],
      "correctAnswer": 0
    }
  ]
}`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          topP: 0.1,
          maxOutputTokens: 1000,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Gemini API error: ${errorData.error?.message || response.statusText}`
      );
    }

    const data = await response.json();

    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error("Unexpected response format from Gemini API");
    }

    const content = data.candidates[0].content.parts[0].text;
    

    try {
      // Clean the response by removing markdown formatting
      const cleanedContent = content
        .replace(/```json\n?/g, "") // Remove ```json
        .replace(/```\n?/g, "") // Remove closing ```
        .trim(); // Remove any extra whitespace

     

      const parsed = JSON.parse(cleanedContent);
      if (!Array.isArray(parsed.questions)) {
        throw new Error("Invalid questions array in response");
      }
      return parsed as SkillQuestions;
    } catch (error) {
      console.error("Error parsing questions response:", error);
      throw new Error("Failed to parse questions response");
    }
  } catch (error) {
    console.error("Error getting skill questions:", error);
    throw error;
  }
}

export async function getSkillAssessment(
  role: string
): Promise<SkillAssessment> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const prompt = `You are a technical interviewer. For someone pursuing a career as a ${role}, identify 3 core technical skills and create 3 multiple choice questions for each skill.

Keep answers very short and concise. Each question must have 4 brief options and exactly one correct answer (index 0-3).

Return a JSON object in this exact format (no additional text, no line breaks in strings):
{"skills":["skill1"],"questions":{"skill1":[{"q":"Brief question?","o":["opt1","opt2","opt3","opt4"],"c":0}]}}`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          topP: 0.1,
          maxOutputTokens: 800,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Gemini API error: ${errorData.error?.message || response.statusText}`
      );
    }

    const data = await response.json();

    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error("Unexpected response format from Gemini API");
    }

    const content = data.candidates[0].content.parts[0].text;

    // Remove any markdown formatting or extra text and normalize the JSON
    const jsonContent = content
      .replace(/```json\n|\n```|```/g, "")
      .replace(/\n/g, "")
      .replace(/\s+/g, " ")
      .trim();

    try {
      const parsed = JSON.parse(jsonContent);

      // Transform the compact format to the full format
      const transformedData: SkillAssessment = {
        skills: parsed.skills,
        questions: {},
      };

      // Validate skills array
      if (!Array.isArray(parsed.skills) || parsed.skills.length === 0) {
        throw new Error("Invalid or empty skills array");
      }

      // Validate and transform each skill's questions
      for (const skill of parsed.skills) {
        const questions = parsed.questions[skill];
        if (!Array.isArray(questions) || questions.length === 0) {
          throw new Error(`Invalid or empty questions for skill: ${skill}`);
        }

        transformedData.questions[skill] = questions.map(
          (q: { q: string; o: string[]; c: number }) => {
            if (
              !q.q ||
              !Array.isArray(q.o) ||
              q.o.length !== 4 ||
              typeof q.c !== "number" ||
              q.c < 0 ||
              q.c > 3
            ) {
              throw new Error(`Invalid question format for skill: ${skill}`);
            }
            return {
              question: q.q,
              options: q.o,
              correctAnswer: q.c,
            };
          }
        );
      }

      return transformedData;
    } catch (error) {
      console.error("Error parsing Gemini response:", error);
      console.log("Raw content:", content);
      console.log("Cleaned content:", jsonContent);
      throw error;
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error;
  }
}
