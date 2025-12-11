import { GoogleGenAI } from "@google/genai";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Edits an image based on a text prompt using Gemini 2.5 Flash Image.
 * @param base64Image The base64 encoded string of the source image (including data URI scheme).
 * @param mimeType The mime type of the source image.
 * @param prompt The text instruction for editing.
 * @returns The generated image as a base64 string (including data URI scheme) or undefined if no image generated.
 */
export const editImageWithGemini = async (
  base64Image: string,
  mimeType: string,
  prompt: string
): Promise<string | undefined> => {
  try {
    // Strip the data:image/...;base64, prefix to get just the raw base64 data
    const base64Data = base64Image.split(',')[1];

    if (!base64Data) {
      throw new Error("Invalid image data");
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', // Use the specific model for image editing tasks
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    // Parse the response to find the generated image
    // The model might return text explanation + image, or just image.
    // We iterate through parts to find the inlineData.
    if (response.candidates && response.candidates.length > 0) {
      const parts = response.candidates[0].content.parts;
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          // Construct the full data URI
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }

    return undefined;
  } catch (error) {
    console.error("Error generating content:", error);
    throw error;
  }
};