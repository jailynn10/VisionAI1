import * as FileSystem from "expo-file-system/legacy";

/**
 * Gemini API Key
 * Store it in your .env file as:
 * EXPO_PUBLIC_GEMINI_KEY=your_api_key_here
 */
const GEMINI_KEY = process.env.EXPO_PUBLIC_GEMINI_KEY;

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`;

/**
 * Prompt used for image analysis.
 */
export const ANALYSIS_PROMPT = `
Analyze this image.

Identify:

1. Objects - list the distinct physical objects you see.
2. Context - briefly describe the setting or scene.
3. Activities - what activity appears to be happening, if any.
4. Recommendations - one practical suggestion based on the scene.

Respond ONLY with valid JSON in this exact shape, with no extra text:

{
  "objects": ["...", "..."],
  "context": "...",
  "activities": "...",
  "recommendations": "..."
}
`;

/**
 * Converts an image file into a Base64 string.
 */
export async function imageToBase64(uri: string): Promise<string> {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return base64;
  } catch (error) {
    console.error("Error converting image to Base64:", error);
    throw error;
  }
}

/**
 * Sends the image to Gemini Vision for analysis.
 */
export async function analyzeImage(
  base64Image: string,
  prompt: string = ANALYSIS_PROMPT,
): Promise<any> {
  if (!GEMINI_KEY) {
    throw new Error("Missing EXPO_PUBLIC_GEMINI_KEY. Check your .env file.");
  }

  try {
    const response = await fetch(GEMINI_URL, {
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
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: base64Image,
                },
              },
            ],
          },
        ],
      }),
    });

    console.log("Gemini Status:", response.status);

    const json = await response.json();

    if (!response.ok) {
      console.error("Gemini Error:", json);
      throw new Error(json?.error?.message || "Failed to analyze image.");
    }

    return json;
  } catch (error) {
    console.error("Analyze Image Error:", error);
    throw error;
  }
}
