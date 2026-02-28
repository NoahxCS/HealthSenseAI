# HealthSense AI - Visual Medical Bill Auditor & Prescription Analyzer
https://health-sense-ai-three.vercel.app/

##  Overview

HealthSense AI is a comprehensive healthcare cost transparency tool that empowers patients to understand and verify their medical bills. In an era of complex healthcare pricing, we provide users with the tools to ensure they're being charged fairly for medical services and medications.

### Key Features

####  Medical Bill Auditor

- **Upload & Analyze**: Users can upload their medical bills for automated analysis
- **Price Comparison**: Compares billed amounts against our database of standard medical prices
- **Visual Discrepancy Highlighting**: Color-coded visualization of overcharges and fair prices
- **Summary Reports**: Get a clear summary of potential savings and discrepancies

####  Prescription Analysis

- **Medication Information**: Understand what prescribed medications do
- **Drug Interactions**: Identify potential interactions between multiple medications
- **Side Effects & Precautions**: Get important safety information
- **Educational Content**: Learn about your prescriptions in simple terms

##  Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **OCR Processing**: [ocr.space](https://ocr.space/) API for text extraction from uploaded bills and prescriptions
- **AI Analysis**: [OpenRouter.ai](https://openrouter.ai/) - Free LLM integration for intelligent text analysis

##  How It Works

1. **Bill Upload**: User uploads a medical bill image/PDF
2. **Text Extraction**: OCR.space API extracts text from the document
3. **AI Analysis**: Extracted text is sent to OpenRouter.ai LLMs for intelligent parsing
4. **Database Comparison**: Analyzed items are compared against our price database (comparison is done by LLMs using RAG for fair price values)
5. **Results Visualization**: Discrepancies are highlighted both textually and visually
6. **Prescription Analysis**: Similar process for prescriptions with specialized medical information extraction

## Hackathon Project Note

This project was developed as part of a hackathon with limited time constraints. While we're proud of what we accomplished, we acknowledge that there's room for improvement and additional features. Here are some areas we'd like to enhance:

- **Price Database Expansion**: Our current database covers common procedures but needs significant expansion
- **Medical Accuracy**: Further refinement of AI prompts for more precise medical information
- **UI/UX Polish**: Additional user experience improvements and responsive design enhancements
- **More Comprehensive Drug Database**: Integration with official pharmaceutical databases
- **User Authentication Improvements**: Enhanced security features and user profiles
- **Mobile App**: Native mobile applications for iOS and Android

##  Acknowledgments

- [ocr.space](https://ocr.space/) for providing reliable OCR services
- [OpenRouter.ai](https://openrouter.ai/) for accessible LLM integration
- Google Firebase for the robust backend infrastructure
- All hackathon organizers and participants for their support and inspiration

**Note**: This is a proof-of-concept developed during a hackathon. While functional, it requires additional development for production use. 
