export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  // pdf-parse v1 — simple Node.js-compatible function, no browser APIs needed
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require("pdf-parse");
  const data = await pdfParse(buffer);
  return (data.text ?? "").trim();
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

  throw new Error(`Unsupported file type: ${mimeType || ext}`);
}
