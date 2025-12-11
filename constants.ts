import { PresetPrompt } from './types';

export const PRESET_PROMPTS: PresetPrompt[] = [
  {
    label: "Remove Background",
    prompt: "Remove the background completely and place the product on a pure white background. Ensure clean edges.",
    icon: "✂️"
  },
  {
    label: "Studio Lighting",
    prompt: "Enhance the lighting to look like a professional studio photoshoot. Soft shadows, high contrast, clean look.",
    icon: "💡"
  },
  {
    label: "Cyberpunk Vibe",
    prompt: "Add a cyberpunk neon aesthetic with pink and blue rim lighting.",
    icon: "🌆"
  },
  {
    label: "Minimalist",
    prompt: "Place the object on a soft, pastel colored minimalist podium. Clean geometric background.",
    icon: "🎨"
  },
  {
    label: "Nature Scene",
    prompt: "Place the product on a mossy rock in a forest with dappled sunlight coming through trees.",
    icon: "🌿"
  },
  {
    label: "Luxury Gold",
    prompt: "Make the background luxurious dark marble with gold accents.",
    icon: "✨"
  }
];