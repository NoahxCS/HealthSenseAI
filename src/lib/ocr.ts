
/**
 * OCR.space API integration helper
 */

const OCR_API_KEY = process.env.NEXT_PUBLIC_OCR_API_KEY;

export interface OCRResult {
  text: string;
  error?: string;
}

export async function extractTextFromFile(file: File): Promise<OCRResult> {
  if (!OCR_API_KEY) {
    return { text: "", error: "OCR API Key is missing. Please check your environment variables." };
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("apikey", OCR_API_KEY);
  formData.append("isOverlayRequired", "false");
  formData.append("scale", "true");
  formData.append("isTable", "true");
  formData.append("detectOrientation", "true");

  try {
    const response = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.IsErroredOnProcessing) {
      return { text: "", error: data.ErrorMessage?.[0] || "OCR processing failed" };
    }

    const parsedResults = data.ParsedResults;
    if (!parsedResults || parsedResults.length === 0) {
      return { text: "", error: "No text found in the document." };
    }

    const extractedText = parsedResults.map((result: any) => result.ParsedText).join("\n");
    return { text: extractedText };
  } catch (error: any) {
    console.error("OCR Error:", error);
    return { text: "", error: error.message || "Failed to extract text. Please check your internet connection." };
  }
}
