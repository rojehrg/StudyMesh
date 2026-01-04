import { NextResponse } from "next/server";

// Use the Hugging Face router for inference
const HF_API_URL = "https://router.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2";

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    if (!process.env.HUGGINGFACE_API_KEY) {
      console.error("HUGGINGFACE_API_KEY not configured");
      return NextResponse.json({ error: "API not configured" }, { status: 500 });
    }

    const response = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: text }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Hugging Face API error:", response.status, errorText);
      // Return empty embedding to allow text search fallback
      return NextResponse.json({ embedding: null, fallback: true });
    }

    const embedding = await response.json();

    // HF returns the embedding directly as an array
    // For feature-extraction, it returns [[...values...]] so we take [0]
    const vector = Array.isArray(embedding[0]) ? embedding[0] : embedding;

    return NextResponse.json({ embedding: vector });
  } catch (error) {
    console.error("Embedding generation error:", error);
    // Return null to allow text search fallback instead of 500
    return NextResponse.json({ embedding: null, fallback: true });
  }
}
