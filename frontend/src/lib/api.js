// src/lib/api.js

/**
 * Helper to call the Gemini LLM API.
 * Reads the API key from Vite environment variable VITE_GEMINI_API_KEY.
 * Returns parsed JSON from the model response.
 */
export async function callGemini(prompt) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("VITE_GEMINI_API_KEY is not set.");
    return null;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const body = {
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      response_mime_type: "application/json",
      temperature: 0.2,
    },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API error: ${response.status} ${err}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  // Sanitize text if enclosed in markdown code blocks
  let cleanText = text.trim();
  if (cleanText.startsWith("```")) {
    cleanText = cleanText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  }

  try {
    return JSON.parse(cleanText);
  } catch (e) {
    console.error("Failed to parse Gemini JSON response:", text);
    return null;
  }
}
