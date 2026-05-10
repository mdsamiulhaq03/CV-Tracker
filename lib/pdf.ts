export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  // pdf-parse v2 uses a class-based API: new PDFParse({ data }) then .getText()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { PDFParse } = await import("pdf-parse") as any;
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();
  return (result?.text ?? "").trim();
}

export async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ buffer });
  return result.value.trim();
}

export async function extractTextFromFile(
  buffer: Buffer,
  mimeType: string,
  fileName: string
): Promise<string> {
  const ext = fileName.split(".").pop()?.toLowerCase();

  if (mimeType === "application/pdf" || ext === "pdf") {
    return extractTextFromPDF(buffer);
  }

  if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mimeType === "application/msword" ||
    ext === "docx" ||
    ext === "doc"
  ) {
    return extractTextFromDOCX(buffer);
  }

  if (mimeType === "text/plain" || ext === "txt") {
    return buffer.toString("utf-8").trim();
  }

  throw new Error(`Unsupported file type: ${mimeType || ext}`);
}
