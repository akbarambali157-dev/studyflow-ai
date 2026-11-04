import { NextResponse } from "next/server";
import { runStudyTask, taskSchema } from "@/lib/ai";
import { ZodError } from "zod";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const input = taskSchema.parse(body);
    const result = await runStudyTask(input);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Check your study material and request, then try again." } },
        { status: 400 },
      );
    }

    const message = error instanceof Error ? error.message : "INTERNAL_ERROR";
    const known: Record<string, { status: number; message: string }> = {
      AI_NOT_CONFIGURED: { status: 503, message: "AI is not configured yet. Add GEMINI_API_KEY to the server environment." },
      AI_EMPTY_RESPONSE: { status: 502, message: "The AI returned an empty response. Please try again." },
      AI_OUTPUT_INVALID: { status: 502, message: "The generated quiz could not be validated. Please try again." },
    };
    const mapped = known[message];
    console.error("Study task failed:", message);
    return NextResponse.json(
      { success: false, error: { code: mapped ? message : "AI_PROVIDER_ERROR", message: mapped?.message ?? "The AI request failed. Please try again shortly." } },
      { status: mapped?.status ?? 502 },
    );
  }
}
