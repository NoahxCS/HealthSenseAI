# **App Name**: HealthSense AI

## Core Features:

- Mode Toggle UI: A prominent two-mode toggle at the top for switching between 'Medical Bill' and 'Prescription' analysis modes.
- File Upload & Preview: Central upload area with drag & drop support for JPG, PNG, and PDF files (up to 5MB), displaying a file preview (image thumbnail or first page of PDF) and file details, with options to clear/change the selection.
- OCR Text Extraction: Integrates with OCR.space API to extract text from uploaded images and PDFs, handling OCR errors gracefully and showing a loading state during processing.
- Medical Bill Analysis: Utilizes the Gemini 2.0 Flash tool (via OpenRouter) with a dedicated prompt to intelligently analyze OCR'd text from medical bills, identifying potentially overpriced items, estimating fair prices, calculating total possible savings, and providing specific recommendations.
- Prescription Analysis: Utilizes the Gemini 2.0 Flash tool (via OpenRouter) with a dedicated prompt to intelligently analyze OCR'd text from prescriptions, extracting information on what each medicine treats, potential side effects, drug interactions, and important cautions.
- Formatted Results Display: Displays the AI analysis results in a clean, organized panel below the upload area, with content formatted specifically for 'Medical Bill' or 'Prescription' mode.
- State & Error Handling: Manages application state including current mode, uploaded file, OCR text, analysis results, and loading indicators, while providing clear, user-friendly error messages for invalid files, OCR failures, and API issues.

## Style Guidelines:

- Primary color: A deep, professional blue (#24588C) evoking trust and clinical expertise.
- Background color: An extremely light, cool white (#F8F9FB) with a hint of blue, providing a clean, spacious canvas for content.
- Accent color: A vibrant yet clean cyan-blue (#4AB2DB) to highlight interactive elements and provide visual differentiation.
- Body and headline font: 'Inter' (sans-serif) for its modern, clear, and neutral readability across all text, ensuring a professional aesthetic as requested.
- Use simple, outlined, modern icons to maintain a clean and uncluttered visual appearance, consistent with the minimalist design philosophy.
- Emphasis on white space, subtle borders, and minimal shadows to create a clean, professional, and clinical aesthetic. Elements are arranged for clear information hierarchy, with a central upload area and a results panel below, designed to be fully responsive for various screen sizes.
- Minimal and functional animations, primarily for loading states and subtle UI feedback, avoiding heavy or flashy effects to maintain a focused and professional user experience.