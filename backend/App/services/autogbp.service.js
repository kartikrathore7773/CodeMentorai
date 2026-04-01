import axios from "axios";
import OpenAI from "openai";
import Groq from "groq-sdk";
import AutoGBP from "../models/autogbp.model.js";
import AutoGBPSettings from "../models/autogbpSettings.model.js";
import { getAccessToken } from "./googleAuth.service.js";
const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://api.openrouter.ai/v1",
});

const groq = new Groq({
  apiKey: process.env.OPENROUTER_API_KEY,
});

// Generate AI Post
export const generatePostService = async (topic) => {
  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",

    messages: [
      {
        role: "user",
        content: `
        Write a Google Business post for ${topic}.
        Keep it under 80 words and include a call to action.
        `,
      },
    ],
  });

  const post = completion.choices[0].message.content;

  const saved = await AutoGBP.create({
    topic,
    postContent: post,
  });

  return saved;
};

// Generate AI Image Prompt (Gemini only text)
export const generateImagePromptService = async (city) => {
  const prompt = `
  Create a short image prompt for an illustration of
  home tutoring service in ${city}.
  Education theme, student and tutor.
  `;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  return completion.choices[0]?.message?.content || "";
};

// Publish Post to Google Business
export const publishPostService = async (postId, accountId, locationId) => {
  const post = await AutoGBP.findById(postId);

  if (!post) throw new Error("Post not found");

  const accessToken = await getAccessToken();

  await axios.post(
    `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/localPosts`,

    {
      summary: post.postContent,
    },

    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    },
  );

  post.status = "published";
  post.publishedAt = new Date();

  await post.save();

  return post;
};

// Auto Post Service (Multi Location)
export const runAutoGBPService = async () => {
  const settings = await AutoGBPSettings.findOne();

  if (!settings || !settings.enabled) return;

  const accountId = settings.accountId;

  for (const loc of settings.locations) {
    try {
      const topic = `Tutvex home tutor service in ${loc.city}`;

      const post = await generatePostService(topic);

      await publishPostService(post._id, accountId, loc.locationId);

      console.log(`Post published for ${loc.city}`);
    } catch (err) {
      console.error(`Error posting for ${loc.city}`, err.message);
    }
  }
};
