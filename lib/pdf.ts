// Top-level require so pdf-parse is loaded once at module startup,
// not inside an async function where Turbopack can mishandle it.
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any
const pdfParseLib: any = require("pdf-parse");

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  if (typeof pdfParseLib !== "function") {
    throw new Error("pdf-parse failed to load — run: npm install pdf-parse@1.1.1");
  }
  const data = await pdfParseLib(buffer);
  return (data?.text ?? "").trim();
}

export async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  const mammoth = await import("mammoth");
  const result  = await mammoth.extractRawText({ buffer });
  return result.value.trim();
}

export async function extractTextFromFile(
  buffer: Buffer,
  mimeType: string,
  fileName: string
): Promise<string> {
  const ext = fileName.split(".").pop()?.toLowerCase();

  if (mimeType === "application/pdf" || ext === "pdf")
    return extractTextFromPDF(buffer);

  if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mimeType === "application/msword" ||
    ext === "docx" ||
    ext === "doc"
  )
    return extractTextFromDOCX(buffer);

  if (mimeType === "text/plain" || ext === "txt")
    return buffer.toString("utf-8").trim();

  throw new Error(`Unsupported file type. Please use PDF, DOCX, or TXT.`);
}
