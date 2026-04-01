import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.OPENROUTER_API_KEY;
const openai = apiKey
  ? new OpenAI({ apiKey, baseURL: "https://api.openrouter.ai/v1" })
  : null;

class HackathonAIService {
  /**
   * Evaluates a submission using AI.
   * @param {Object} submission - Input data
   * @returns {Promise<Object>} { innovation_score, feasibility_score, impact_score, remarks }
   */
  static async evaluate(submission) {
    if (!openai) {
      throw new Error("AI Model not initialized. Check OPENROUTER_API_KEY.");
    }

    const { projectTitle, projectDescription, techStack, githubLink } =
      submission;

    const prompt = `You are an expert hackathon judge.

Task:
Evaluate the following hackathon project submission.

Guidelines:
- Score only based on given content
- Do not assume missing details
- Be objective and concise
- Return output in strict JSON
- Do not add explanations outside JSON

Input:
Project Title: ${projectTitle}
Description: ${projectDescription}
Tech Stack: ${techStack.join(", ")}
GitHub Link: ${githubLink}

Return:
{
  "innovation_score": 0-10,
  "feasibility_score": 0-10,
  "impact_score": 0-10,
  "remarks": "2–3 lines"
}`;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
      });

      let text = completion.choices[0]?.message?.content?.trim() || "";

      // Clean up potential markdown formatting in AI response
      if (text.startsWith("```json")) {
        text = text
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();
      }

      const parsed = JSON.parse(text);

      // Validate scores are within [0, 10]
      return {
        innovation_score: Math.max(
          0,
          Math.min(10, Number(parsed.innovation_score) || 0),
        ),
        feasibility_score: Math.max(
          0,
          Math.min(10, Number(parsed.feasibility_score) || 0),
        ),
        impact_score: Math.max(
          0,
          Math.min(10, Number(parsed.impact_score) || 0),
        ),
        remarks: (parsed.remarks || "No AI remarks available.").substring(
          0,
          200,
        ), // Limit length
      };
    } catch (error) {
      console.error("Hackathon AI Evaluation Error:", error);
      throw error; // Let the caller handle fallbacks
    }
  }
}

export default HackathonAIService;
