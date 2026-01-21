import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";

export async function POST(req: Request) {
  try {
    const { subject, marks, questionType, question, answer } = await req.json();

    if (!subject || !marks || !questionType || !question || !answer) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const prompt = `
You are an expert exam evaluator and answer writing coach.

Return ONLY VALID JSON in this exact format:
{
  "estimated_marks": number,
  "missing_points": string[],
  "improvements": string[],
  "topper_answer": string
}

Subject: ${subject}
Question Type: ${questionType}
Total Marks: ${marks}

Question:
${question}

Student Answer:
${answer}

Rules:
- estimated_marks must be between 0 and ${marks}
- missing_points MUST be an array of strings
- improvements MUST be an array of strings
- topper_answer MUST be plain string
Return ONLY JSON (no extra explanation).
`;

    const result = await generateText({
      model: groq("llama-3.1-8b-instant"), // ✅ fast + free tier friendly
      prompt,
      temperature: 0.3,
    });

    // Remove ```json fences if any
    const cleaned = result.text
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return Response.json(
        { error: "AI returned invalid JSON", raw: result.text },
        { status: 500 }
      );
    }

    return Response.json(parsed);
  } catch (error: any) {
    return Response.json(
      { error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
