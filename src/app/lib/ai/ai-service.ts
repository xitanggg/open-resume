/**
 * Client-side AI service — calls the /api/ai endpoint.
 * Manages API key from localStorage and provides typed helpers.
 */

const AI_API_ENDPOINT = "/api/ai";
const LOCAL_STORAGE_SETTINGS_KEY = "open-resume-ai-settings";

export interface AISettings {
  apiKey: string;
  model: string;
  tone: "professional" | "creative" | "academic";
}

const DEFAULT_SETTINGS: AISettings = {
  apiKey: "",
  model: "gemini-3.5-flash-lite",
  tone: "professional",
};

// Models with 0 free tier quota — auto-migrate away from these
const DEPRECATED_MODELS = [
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
  "gemini-2.5-pro",
];

export function getAISettings(): AISettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_SETTINGS_KEY);
    if (stored) {
      const parsed = { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      // Auto-migrate deprecated models with 0 quota
      if (DEPRECATED_MODELS.includes(parsed.model)) {
        parsed.model = DEFAULT_SETTINGS.model;
        localStorage.setItem(LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(parsed));
      }
      return parsed;
    }
  } catch {
    // ignore parse errors
  }
  return DEFAULT_SETTINGS;
}

export function saveAISettings(settings: AISettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(settings));
}

export function hasAPIKey(): boolean {
  return getAISettings().apiKey.trim().length > 0;
}

interface AIRequestPayload {
  system: string;
  user: string;
  type:
    | "summary"
    | "bullet-points"
    | "improve"
    | "education"
    | "skills"
    | "chat";
}

export async function callAI(payload: AIRequestPayload): Promise<string> {
  const settings = getAISettings();

  if (!settings.apiKey.trim()) {
    throw new Error(
      "Please set your Gemini API key in AI Settings (top-right ✨ button). Get a free key at aistudio.google.com"
    );
  }

  const MAX_RETRIES = 2;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const response = await fetch(AI_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": settings.apiKey,
      },
      body: JSON.stringify({
        system: payload.system,
        user: payload.user,
        type: payload.type,
        model: settings.model,
        tone: settings.tone,
      }),
    });

    if (response.status === 429 && attempt < MAX_RETRIES) {
      // Rate limited — extract wait time and auto-retry
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = (errorData as any).error || "";
      const match = errorMsg.match(/wait (\d+)/);
      const waitSec = match ? Math.min(parseInt(match[1], 10), 60) : 10 + attempt * 10;
      await new Promise((r) => setTimeout(r, waitSec * 1000));
      continue;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        (errorData as any).error ||
          `AI request failed with status ${response.status}`
      );
    }

    const data = await response.json();
    return (data as any).content;
  }

  throw new Error("Rate limit persists after retries. Please wait a minute and try again.");
}

/**
 * Parse AI-generated bullet points (one per line) into an array.
 */
export function parseBulletPoints(text: string): string[] {
  if (!text) return [];

  // Strip markdown code blocks (e.g. ```markdown ... ```)
  const cleanedText = text
    .replace(/```[a-z]*\n?/gi, "")
    .replace(/```/g, "")
    .trim();

  return cleanedText
    .split("\n")
    .map((line) =>
      line
        .replace(/^[-•*]\s*/, "") // remove leading bullet chars
        .replace(/^\d+[.)]\s*/, "") // remove leading numbers
        .replace(/^["']|["']$/g, "") // remove surrounding quotes
        .trim()
    )
    .filter((line) => {
      if (!line) return false;
      if (line.startsWith("#")) return false;
      if (line.startsWith("```")) return false;
      if (/^(here are|here's|sure|certainly|below are|bullet points|key skills)/i.test(line)) return false;
      return true;
    });
}
