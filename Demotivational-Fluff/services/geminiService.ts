import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedPosterData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface TextResponse {
  quote: string;
  visualDescription: string;
}

// Collections for Randomization
const ART_STYLES = [
  "Pop Surrealism (Mark Ryden style)",
  "Vintage 90s CGI (Bryce 3D style)",
  "Knitted Plush Photography",
  "Grimy Industrial Claymation",
  "Neon Noir Felt Art",
  "Fuzzy Pastel Goth",
  "Hyper-realistic Velvet Render",
  "Diorama Photography"
];

const LOCATIONS = [
  "a floating cosmic supermarket",
  "a melting playground at sunset",
  "an empty birthday party room",
  "a velvet forest with giant mushrooms",
  "inside a giant washing machine",
  "a desert made of candy",
  "a cloudy void with floating geometry",
  "a dimly lit 1980s office",
  "a swamp made of glitter"
];

const TEXTURES = [
  "matted fur and glass",
  "shiny vinyl and velvet",
  "distressed felt",
  "translucent plastic",
  "patchwork fabric",
  "ceramic and fuzz"
];

const TEXT_INTEGRATION_STYLES = [
  "stamped on the character's t-shirt",
  "written on a sloppy cardboard sign held by the character",
  "floating as glowing 3D neon letters behind the character",
  "embroidered onto the character's belly",
  "written in frosting on a cake",
  "on a speech bubble coming from the character"
];

const getRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

export const generateDemotivationalPoster = async (mood: string): Promise<GeneratedPosterData> => {
  try {
    // Randomize the parameters for this generation
    const style = getRandom(ART_STYLES);
    const location = getRandom(LOCATIONS);
    const texture = getRandom(TEXTURES);
    const textStyle = getRandom(TEXT_INTEGRATION_STYLES);
    const subjectCount = Math.floor(Math.random() * 2) + 1; // 1 or 2 characters

    // Step 1: Generate the "Bad Advice" and the Visual Description
    const textModel = 'gemini-2.5-flash';
    
    const prompt = `
      I am creating a ${style} art poster for a user who is feeling ${mood}.
      
      1. Create a SHORT sarcastic, weird, or specific quote.
         - **MAXIMUM 7 WORDS** (Critical: Must be short for AI image text rendering).
         - Theme: Twisted old sayings, specific strange animals (e.g. possums, raccoons, blobfish), or weird objects.
         - Tone: Sarcastic, Nihilistic, "Rotting", or Absurdist.
         - Examples: "Eat trash, hail satan", "Be the problem", "Chaos is cozy".
         
      2. Describe a scene with ${subjectCount} weird 3D characters/puppets.
         - Vibe: ${style}.
         - Texture focus: ${texture}.
         - Setting: ${location}.
         - Mood: ${mood}, but interpreted through a weird, dreamlike lens.
         - Make the description detailed and strange.
    `;

    const textResponse = await ai.models.generateContent({
      model: textModel,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            quote: { type: Type.STRING, description: "The funny short quote (max 7 words)" },
            visualDescription: { type: Type.STRING, description: "Visual description of the weird puppet character(s)" }
          },
          required: ["quote", "visualDescription"]
        }
      }
    });

    const jsonText = textResponse.text;
    if (!jsonText) throw new Error("Failed to generate text content.");
    
    const data = JSON.parse(jsonText) as TextResponse;

    // Step 2: Generate the Image using Imagen
    const imagePrompt = `
      A masterpiece of ${style} 3D art.
      
      SCENE: ${data.visualDescription}.
      
      TEXT RENDERING:
      Render the text: "${data.quote}" visibly in the scene.
      Style: ${textStyle}.
      Ensure the text is legible, spelled correctly, and integrated into the artwork (not just an overlay).
      
      DETAILS:
      The characters should look like high-end collectible art toys made of ${texture}.
      They have frantic, "manic cute" expressions.
      
      ENVIRONMENT:
      ${location}. Soft, cinematic studio lighting.
      
      COMPOSITION:
      Portrait 3:4 aspect ratio.
      Ensure the image is visually striking and beautiful.
      
      AESTHETIC:
      ${style}, Lowbrow Art, Weirdcore, Pop Surrealism.
    `;

    const imageResponse = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: imagePrompt,
      config: {
        numberOfImages: 1,
        aspectRatio: '3:4',
        outputMimeType: 'image/jpeg'
      }
    });

    if (!imageResponse.generatedImages || imageResponse.generatedImages.length === 0) {
      throw new Error("Failed to generate image.");
    }

    const imageBytes = imageResponse.generatedImages[0].image.imageBytes;
    const base64Image = `data:image/jpeg;base64,${imageBytes}`;

    return {
      quote: data.quote,
      imageBase64: base64Image,
      animalDescription: data.visualDescription
    };

  } catch (error) {
    console.error("Gemini Service Error:", error);
    throw error;
  }
};