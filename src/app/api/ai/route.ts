import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      system,
      user,
      type,
      model = "gemini-3.5-flash-lite",
      tone = "professional",
    } = body;

    if (!system || !user || !type) {
      return NextResponse.json(
        { error: "Missing required fields: system, user, type" },
        { status: 400 }
      );
    }

    // Get API key from request header or environment variable
    const apiKey =
      request.headers.get("x-api-key") || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "No API key provided. Please set your Gemini API key in AI Settings. Get a free key at https://aistudio.google.com/app/apikey",
        },
        { status: 401 }
      );
    }

    // Adjust system prompt based on tone
    const toneInstructions: Record<string, string> = {
      professional:
        "Use a professional, formal tone suitable for corporate environments.",
      creative:
        "Use a slightly creative and engaging tone while remaining professional.",
      academic:
        "Use an academic and scholarly tone suitable for research and education roles.",
    };

    const fullSystem = `${system}\n\nTone: ${toneInstructions[tone] || toneInstructions.professional}`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const geminiModel = genAI.getGenerativeModel({
      model,
      systemInstruction: fullSystem,
    });

    const result = await geminiModel.generateContent(user);
    const response = result.response;
    const content = response.text().trim();

    return NextResponse.json({ content, type });
  } catch (error: any) {
    console.error("AI API Error:", error);

    const errorMessage = error?.message || "";
    const errorStr = String(error);

    if (
      errorMessage.includes("API_KEY_INVALID") ||
      errorMessage.includes("401") ||
      errorStr.includes("API_KEY_INVALID")
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid API key. Please check your Gemini API key in AI Settings.",
        },
        { status: 401 }
      );
    }

    if (
      errorMessage.includes("RATE_LIMIT") ||
      errorMessage.includes("429") ||
      errorMessage.includes("quota") ||
      errorStr.includes("429") ||
      errorStr.includes("Too Many Requests")
    ) {
      // Try to extract retry delay from error
      const retryMatch = errorMessage.match(/retry in (\d+)/i) || errorStr.match(/retry in (\d+)/i);
      const retrySeconds = retryMatch ? retryMatch[1] : "30";
      
      return NextResponse.json(
        { error: `Rate limit reached. Please wait ${retrySeconds} seconds and try again. The free Gemini API has per-minute limits.` },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        error:
          error.message || "An error occurred while generating content.",
      },
      { status: 500 }
    );
  }
}
