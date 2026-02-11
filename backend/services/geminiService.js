import { GoogleGenAI, Type } from "@google/genai";
import { z } from "zod";

const apiKey = process.env.API_KEY; 
const ai = new GoogleGenAI({ apiKey: apiKey || 'MOCK_KEY' });

const ReviewAnalysisSchema = z.object({
  relevance: z.enum(["relevant", "irrelevant"]),
  confidence: z.number().min(0).max(1),
  reason: z.string(),
  policy_category: z.enum(["Off-topic", "Misleading", "None"]),
});

export const classifyReview = async (reviewText, businessContext) => {
  if (!apiKey) {
    console.warn("Missing API_KEY, using mock classification");
    return {
      relevance: 'relevant',
      confidence: 0.5,
      reason: "Mock analysis (System API Key missing)",
      policy_category: 'None'
    };
  }

  // Use gemini-3-flash-preview as it is the current recommendation for text tasks
  // Matches "latest Gemini ... Preview" requirement
  const modelId = "gemini-3-flash-preview";
  
  const systemInstruction = `You are a review classification engine.

Your task is to determine whether a Google Business review is relevant to the business category and services provided.

Instructions:
- Only mark "irrelevant" if the review clearly discusses unrelated services.
- Detect logical mismatches.
- Do not assume malicious intent.
- Do not add commentary.
- Output STRICT valid JSON only.
- No markdown.
- No explanations outside JSON.`;

  const userPrompt = `Business Name: ${businessContext.name}
Primary Category: ${businessContext.category}
Services: ${businessContext.services.join(", ")}

Review:
"""
${reviewText}
"""

Classify the review.`;

  const generate = async () => {
      const response = await ai.models.generateContent({
      model: modelId,
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.2,
        topP: 0.8,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            relevance: {
              type: Type.STRING,
              enum: ["relevant", "irrelevant"],
              description: "Whether the review is relevant to the business."
            },
            confidence: {
              type: Type.NUMBER,
              description: "Confidence score between 0 and 1."
            },
            reason: {
              type: Type.STRING,
              description: "A short explanation of why it is relevant or irrelevant."
            },
            policy_category: {
              type: Type.STRING,
              enum: ["Off-topic", "Misleading", "None"],
              description: "The specific policy category if irrelevant, otherwise None."
            }
          },
          required: ["relevance", "confidence", "reason", "policy_category"]
        }
      }
    });
    
    const jsonText = response.text;
    if (!jsonText) throw new Error("Empty response from Gemini");
    
    return JSON.parse(jsonText);
  };

  // Retry logic for JSON validation failure
  let attempts = 0;
  const maxAttempts = 2;
  
  while (attempts < maxAttempts) {
    try {
      const jsonResult = await generate();
      // Validate with Zod
      const validResult = ReviewAnalysisSchema.parse(jsonResult);
      return validResult;
    } catch (error) {
      console.warn(`Gemini analysis attempt ${attempts + 1} failed validation or generation:`, error);
      attempts++;
    }
  }

  // Fallback if AI fails validation twice
  console.error("Gemini failed to produce valid JSON after retries.");
  return {
    relevance: 'relevant', // Fail safe to relevant
    confidence: 0,
    reason: "Analysis failed validation check.",
    policy_category: 'None'
  };
};

export const generateReport = async (reviewText, reason, businessCategory) => {
  if (!apiKey) return "Error: Server API Key not configured.";

  const systemInstruction = `Generate a short, professional explanation for reporting an off-topic review.
Maximum 3 sentences.
No emotional tone.
No accusations.`;

  const userPrompt = `Business Category: ${businessCategory}
Review Text: ${reviewText}
Reason: ${reason}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.2,
        topP: 0.8,
      }
    });
    return response.text || "Could not generate report text.";
  } catch (e) {
    console.error("Gemini Report Generation Error:", e);
    return "Error generating report text.";
  }
};