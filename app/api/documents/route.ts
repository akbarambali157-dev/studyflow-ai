import { NextResponse } from "next/server";
import mammoth from "mammoth";
import pdf from "pdf-parse";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_FILE_BYTES = 8 * 1024 * 1024;
const MAX_TEXT_CHARS = 80000;

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, error: "Choose a document to upload." }, { status: 400 });
    }
    if (file.size === 0 || file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ success: false, error: "The file is empty or exceeds the 8 MB limit." }, { status: 400 });
    }

    const name = file.name.toLowerCase();
    const buffer = Buffer.from(await file.arrayBuffer());
    let text = "";

    if (name.endsWith(".txt")) {
      text = buffer.toString("utf8");
    } else if (name.endsWith(".pdf")) {
      const result = await pdf(buffer);
      text = result.text;
    } else if (name.endsWith(".docx")) {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else {
      return NextResponse.json({ success: false, error: "Supported formats are PDF, DOCX, and TXT." }, { status: 415 });
    }

    text = text.replace(/\u0000/g, "").trim();
    if (text.length < 30) {
      return NextResponse.json({
        success: false,
        error: "We could not find enough selectable text. Scanned PDFs may need OCR, which is not included in this version.",
      }, { status: 422 });
    }

    const truncated = text.length > MAX_TEXT_CHARS;
    return NextResponse.json({
      success: true,
      data: {
        fileName: file.name,
        text: text.slice(0, MAX_TEXT_CHARS),
        characterCount: text.length,
        truncated,
      },
    });
  } catch (error) {
    console.error("Document extraction failed:", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({
      success: false,
      error: "We could not read that document. Check that it is a valid PDF, DOCX, or TXT file.",
    }, { status: 422 });
  }
}
