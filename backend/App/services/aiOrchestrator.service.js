import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://api.openrouter.ai/v1",
});

/* -----------------------------
   Rule Based Feedback
----------------------------- */

function generateRuleBasedFeedback({
  innovationScore,
  feasibilityScore,
  impactScore,
}) {
  const lines = [];

  if (innovationScore >= 8)
    lines.push(
      "Your project demonstrates strong innovation and creative thinking.",
    );
  else if (innovationScore >= 5)
    lines.push(
      "Your project shows a reasonable level of innovation with room to push further.",
    );
  else
    lines.push(
      "Consider exploring more unique or creative angles for your project idea.",
    );

  if (feasibilityScore < 5)
    lines.push(
      "Implementation feasibility could be improved with a clearer technical plan.",
    );
  else if (feasibilityScore >= 8)
    lines.push(
      "The technical approach is well thought out and practically achievable.",
    );

  if (impactScore >= 7)
    lines.push(
      "The project has meaningful real-world potential and addresses a genuine need.",
    );
  else
    lines.push(
      "Strengthening the real-world impact of your solution would make it more compelling.",
    );

  return {
    text: lines.slice(0, 3).join(" "),
    type: "RULE_BASED",
  };
}

/* -----------------------------
   AI Feedback Generation
----------------------------- */

export async function generateAIFeedback({
  projectTitle,
  innovationScore,
  feasibilityScore,
  impactScore,
  classificationLevel,
  plagiarismLevel,
}) {
  try {
    const prompt = `You are an expert hackathon mentor.

Generate short feedback (2-3 lines only) for a hackathon project.

Project Title: ${projectTitle}
Innovation Score: ${innovationScore}
Feasibility Score: ${feasibilityScore}
Impact Score: ${impactScore}
Classification: ${classificationLevel}
Plagiarism: ${plagiarismLevel}

Guidelines:
- Plain text only
- No bullet points
- Maximum 3 lines
- Constructive tone`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
      max_output_tokens: 150,
    });

    const response = completion.choices[0]?.message?.content?.trim() || "";

    return {
      text: response,
      type: "AI_GENERATED",
    };
  } catch (error) {
    console.error("AI Feedback Error:", error);

    return generateRuleBasedFeedback({
      innovationScore,
      feasibilityScore,
      impactScore,
    });
  }
}
