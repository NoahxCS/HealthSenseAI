'use server';

/**
 * OCR.space API integration helper (Server-side)
 */

const OCR_API_KEY = process.env.OCR_API_KEY;

export interface OCRResult {
  text: string;
  error?: string;
}

export async function extractTextFromFile(formData: FormData): Promise<OCRResult> {
  if (!OCR_API_KEY) {
    return { 
      text: "", 
      error: "OCR API Key is missing. Please set OCR_API_KEY in your environment variables." 
    };
  }

  try {
    // We expect the 'file' to be already in the formData from the client
    formData.append("apikey", OCR_API_KEY);
    formData.append("isOverlayRequired", "false");
    formData.append("scale", "true");
    formData.append("isTable", "true");
    formData.append("detectOrientation", "true");

    const response = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      body: formData,
      // Adding a timeout signal if needed, though Next.js has its own limits
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OCR Service Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.IsErroredOnProcessing) {
      return { text: "", error: data.ErrorMessage?.[0] || "OCR processing failed" };
    }

    const parsedResults = data.ParsedResults;
    if (!parsedResults || parsedResults.length === 0) {
      return { text: "", error: "No text found in the document. Please ensure the image is clear and contains text." };
    }

    const extractedText = parsedResults.map((result: any) => result.ParsedText).join("\n");
    return { text: extractedText };
  } catch (error: any) {
    console.error("OCR Server Action Error:", error);
    return { 
      text: "", 
      error: error.message || "Failed to extract text due to a server error." 
    };
  }
}
